import os
import re
import uvicorn
import pandas as pd
import psycopg2
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv
from groq import Groq
from sqlalchemy import create_engine, text

# -------------------------------
# Load .env
# -------------------------------
load_dotenv()

def _strip_quotes(s: str) -> str:
    if not s:
        return s
    s = s.strip()
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        return s[1:-1]
    return s

GROQ_API_KEY = _strip_quotes(os.getenv("GROQ_API_KEY", ""))
DB_URL = _strip_quotes(os.getenv("DATABASE_URL", ""))

if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API_KEY in .env")
if not DB_URL:
    raise ValueError("Missing DATABASE_URL in .env")

# -------------------------------
# Groq LLaMA client
# -------------------------------
groq_client = Groq(api_key=GROQ_API_KEY)

# -------------------------------
# Utility: Clean SQL
# -------------------------------
def clean_sql_output(raw_text: str) -> str:
    if not raw_text:
        return ""

    match = re.search(r"```sql\s*(.*?)```", raw_text, flags=re.DOTALL | re.IGNORECASE)
    if match:
        candidate = match.group(1)
    else:
        candidate = re.sub(r"```.*?```", "", raw_text, flags=re.DOTALL)
        candidate = candidate.replace("`", "")

    candidate = re.split(r"(?i)\b(explanation|assumption|example|schema|structure)\b", candidate)[0]

    lines = []
    for line in candidate.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("--") or stripped.startswith("#"):
            continue
        lines.append(line)

    cleaned = "\n".join(lines).strip()
    if ";" in cleaned:
        cleaned = cleaned[: cleaned.rfind(";") + 1]
    return cleaned.strip()

system_instructions = """
You are an expert SQL generator for PostgreSQL with the following schema:

Tables:

- Vendor (id: String, name: String)
- Invoice (id: String, invoiceNumber: String, date: DateTime, amount: Float, status: String, customerName: String (nullable), vendorId: String)
- LineItem (id: String, description: String, quantity: Float, unitPrice: Float, totalPrice: Float, category: String (nullable), invoiceId: String)
- Payment (id: String, date: DateTime (nullable), amount: Float, invoiceId: String)

Relations:

- Invoice.vendorId references Vendor.id
- LineItem.invoiceId references Invoice.id
- Payment.invoiceId references Invoice.id (one-to-one)

Rules:

- Always use **double quotes** around all table names and column names exactly as shown, preserving camelCase (e.g. "vendorId", "invoiceNumber").
- Use table aliases such as V for Vendor, I for Invoice, L for LineItem, and P for Payment.
- When referencing columns, always prefix with the table alias and a dot, for example: V."id", I."vendorId".
- Format the SQL with proper spacing and line breaks for readability.
- Return only the SQL query, no explanation or extra text.

Example:

```sql
SELECT
    V."name",
    SUM(L."totalPrice") AS total_spend
FROM
    "Vendor" V
JOIN
    "Invoice" I ON V."id" = I."vendorId"
JOIN
    "LineItem" L ON I."id" = L."invoiceId"
GROUP BY
    V."name"
ORDER BY
    total_spend DESC
LIMIT 5;
"""

# -------------------------------
# SQL Generation (Groq LLaMA)
# -------------------------------
def generate_sql_from_question(question: str, system_instructions: str = None) -> Tuple[str, str]:
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    # Use your new schema-aware prompt if no override provided
    system_instructions = system_instructions or """
    You are an expert SQL generator for PostgreSQL using the following schema:

    Tables:

    Vendor (id: String, name: String)

    Invoice (id: String, invoiceNumber: String, date: DateTime, amount: Float, status: String, customerName: String (nullable), vendorId: String)

    LineItem (id: String, description: String, quantity: Float, unitPrice: Float, totalPrice: Float, category: String (nullable), invoiceId: String)

    Payment (id: String, date: DateTime (nullable), amount: Float, invoiceId: String)

    Relations:

    - Invoice.vendorId references Vendor.id
    - LineItem.invoiceId references Invoice.id
    - Payment.invoiceId references Invoice.id (one-to-one)

    Use table aliases and JOINs when necessary. Use exact table and column names as in schema. Return only valid SQL without explanations.
    """

    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": f"Generate a valid PostgreSQL SQL query for: {question}"}
            ],
            temperature=0.05,
            max_tokens=800
        )
        raw_output = resp.choices[0].message.content.strip()
        cleaned_sql = clean_sql_output(raw_output)
        return cleaned_sql, raw_output
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq LLM error: {e}")

# -------------------------------
# Postgres Connection
# -------------------------------
def _connect_psycopg_from_url(db_url: str):
    parsed = urlparse(db_url)
    if parsed.scheme not in ("postgresql", "postgres"):
        raise ValueError("DATABASE_URL must start with postgresql://")
    dbname = parsed.path.lstrip("/")
    if "?" in dbname:
        dbname = dbname.split("?")[0]

    conn = psycopg2.connect(
        host=parsed.hostname,
        dbname=dbname,
        user=parsed.username,
        password=parsed.password,
        port=parsed.port or 5432,
    )
    return conn


def run_sql_query(sql: str) -> pd.DataFrame:
    """
    Executes SQL on Postgres using SQLAlchemy and returns a pandas DataFrame.
    """
    if not sql.strip():
        raise HTTPException(status_code=400, detail="No SQL provided to execute")

    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            df = pd.read_sql_query(text(sql), conn)
        return df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL execution error: {str(e)}")


# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="Vanna (Groq LLaMA) SQL AI", version="1.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Models
class QuestionRequest(BaseModel):
    question: str

class SQLResponse(BaseModel):
    question: str
    sql: str
    raw_model_output: str = ""

class RunSQLRequest(BaseModel):
    sql: str

class QueryResponse(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int

class ChatResponse(BaseModel):
    question: str
    sql: str
    raw_model_output: str
    data: List[Dict[str, Any]]
    columns: List[str]
    row_count: int

# -------------------------------
# Routes
# -------------------------------
@app.get("/")
def root():
    return {
        "message": "✅ Vanna (Groq LLaMA) SQL AI is running",
        "endpoints": [
            "/api/v1/generate_sql",
            "/api/v1/run_sql",
            "/api/v1/chat-with-data",
        ],
    }

@app.post("/api/v1/generate_sql", response_model=SQLResponse)
def api_generate_sql(req: QuestionRequest):
    cleaned_sql, raw = generate_sql_from_question(req.question)
    return SQLResponse(question=req.question, sql=cleaned_sql, raw_model_output=raw)

@app.post("/api/v1/run_sql", response_model=QueryResponse)
def api_run_sql(req: RunSQLRequest):
    df = run_sql_query(req.sql)
    return QueryResponse(
        data=df.to_dict("records"),
        columns=list(df.columns),
        row_count=len(df),
    )
    
    
@app.post("/api/v1/chat-with-data", response_model=ChatResponse)
def api_chat_with_data(req: QuestionRequest):
    try:
        cleaned_sql, raw = generate_sql_from_question(req.question)
        if not cleaned_sql:
            raise HTTPException(status_code=422, detail=f"Model did not return valid SQL. Raw output: {raw}")

        # No fix_table_names call needed if prompt is correct
        df = run_sql_query(cleaned_sql)

        return ChatResponse(
            question=req.question,
            sql=cleaned_sql,
            raw_model_output=raw,
            data=df.to_dict("records"),
            columns=list(df.columns),
            row_count=len(df),
        )
    except Exception as e:
        print(f"Error in chat-with-data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# Entry
# -------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000) or 8000)
    print(f"🚀 Starting Vanna AI server at http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
