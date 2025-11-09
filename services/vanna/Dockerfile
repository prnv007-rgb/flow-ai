# Use a slim Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app
RUN apt-get update && apt-get install -y \
    postgresql-client \
 && rm -rf /var/lib/apt/lists/*
# Copy only the requirements file first to leverage caching
COPY services/vanna/requirements.txt requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir --upgrade groq httpx
# Copy the rest of the Vanna app code
COPY services/vanna/ .

# Expose the port Vanna will run on
EXPOSE 8000

# Command to run the app (ADJUST THIS to match your app)
# This assumes you have 'main.py' with a FastAPI app named 'app'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]