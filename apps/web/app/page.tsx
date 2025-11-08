"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ResponsiveContainer,
} from "recharts";

// Types for API responses
type Stats = {
  totalSpend: number;
  totalInvoices: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
};

type InvoiceTrend = {
  month: string;
  totalValue: number;
  totalVolume: number;
};

type VendorSpend = {
  name: string;
  spend: number;
};

type CategorySpend = {
  name: string;
  value: number;
};

type CashOutflow = {
  day: string;
  totalAmount: number;
};

type Invoice = {
  id: string;
  vendor: string;
  date: string;
  invoiceNumber: string;
  amount: number;
  status: string;
};

type ChatResponse = {
  question: string;
  sql: string;
  raw_model_output: string;
  data: any[];
  columns: string[];
  row_count: number;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE", "#FF4444", "#44FF99", "#FF66CC"];

export default function DashboardPage() {
  // State for dashboard data
  const [stats, setStats] = useState<Stats | null>(null);
  const [invoiceTrends, setInvoiceTrends] = useState<InvoiceTrend[]>([]);
  const [topVendors, setTopVendors] = useState<VendorSpend[]>([]);
  const [categorySpend, setCategorySpend] = useState<CategorySpend[]>([]);
  const [cashOutflow, setCashOutflow] = useState<CashOutflow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Chat states
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [statsRes, trendsRes, vendorsRes, categoriesRes, cashRes, invoicesRes] = await Promise.all([
          fetch(`${API_BASE}/stats`),
          fetch(`${API_BASE}/invoice-trends`),
          fetch(`${API_BASE}/vendors/top10`),
          fetch(`${API_BASE}/category-spend`),
          fetch(`${API_BASE}/cash-outflow`),
          fetch(`${API_BASE}/invoices`),
        ]);
        setStats(await statsRes.json());
        setInvoiceTrends(await trendsRes.json());
        setTopVendors(await vendorsRes.json());
        setCategorySpend(await categoriesRes.json());
        setCashOutflow(await cashRes.json());
        setInvoices(await invoicesRes.json());
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }

    fetchDashboard();
  }, [API_BASE]);

  // Invoice search handler
  async function handleInvoiceSearch(e: React.FormEvent) {
    e.preventDefault();
    try {
      const searchRes = await fetch(`${API_BASE}/invoices?search=${encodeURIComponent(invoiceSearch)}`);
      const data = await searchRes.json();
      setInvoices(data);
    } catch (err) {
      console.error("Invoice search failed:", err);
    }
  }

  // Chat submit handler
  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    setIsChatLoading(true);
    setChatResponse(null);

    try {
      const res = await fetch(`${API_BASE}/chat-with-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: chatQuestion }),
      });
      const data = await res.json();
      setChatResponse(data);
    } catch (err) {
      console.error("Chat query failed:", err);
      setChatResponse(null);
    } finally {
      setIsChatLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Flowbit Analytics Dashboard</h1>

      {/* Overview Cards */}
      {stats && (
        <section style={{ display: "flex", gap: 20, marginBottom: 30 }}>
          <div style={cardStyle}>
            <h3>Total Spend (YTD)</h3>
            <p>${stats.totalSpend.toLocaleString()}</p>
          </div>
          <div style={cardStyle}>
            <h3>Total Invoices Processed</h3>
            <p>{stats.totalInvoices}</p>
          </div>
          <div style={cardStyle}>
            <h3>Documents Uploaded</h3>
            <p>{stats.documentsUploaded}</p>
          </div>
          <div style={cardStyle}>
            <h3>Average Invoice Value</h3>
            <p>${stats.averageInvoiceValue.toFixed(2)}</p>
          </div>
        </section>
      )}

      {/* Invoice Trends Line Chart */}
      <section style={{ marginBottom: 30 }}>
        <h2>Invoice Volume + Value Trend (Line Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={invoiceTrends} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Line yAxisId="left" type="monotone" dataKey="totalVolume" name="Invoice Volume" stroke="#8884d8" />
            <Line yAxisId="right" type="monotone" dataKey="totalValue" name="Invoice Value" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Top Vendors List */}
      <section style={{ marginBottom: 30 }}>
        <h2>Spend by Vendor (Top 10)</h2>
        <ul>
          {topVendors.map(({ name, spend }) => (
            <li key={name}>
              {name}: ${spend.toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      {/* Spend by Category Pie Chart */}
      <section style={{ marginBottom: 30 }}>
        <h2>Spend by Category (Pie Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categorySpend}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {categorySpend.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Cash Outflow Bar Chart */}
      <section style={{ marginBottom: 30 }}>
        <h2>Cash Outflow Forecast (Bar Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashOutflow} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="totalAmount" name="Total Amount" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Invoices Table */}
      <section style={{ marginBottom: 30 }}>
        <h2>Invoices</h2>

        <form onSubmit={handleInvoiceSearch} style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Search by vendor or invoice number"
            value={invoiceSearch}
            onChange={(e) => setInvoiceSearch(e.target.value)}
            style={{ padding: 6, width: "300px" }}
          />
          <button type="submit" style={{ marginLeft: 8, padding: "6px 12px" }}>
            Search
          </button>
        </form>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Vendor</th>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Invoice #</th>
              <th style={tableHeaderStyle}>Amount</th>
              <th style={tableHeaderStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={tableCellStyle}>{inv.vendor}</td>
                <td style={tableCellStyle}>{new Date(inv.date).toLocaleDateString()}</td>
                <td style={tableCellStyle}>{inv.invoiceNumber}</td>
                <td style={tableCellStyle}>${inv.amount.toFixed(2)}</td>
                <td style={tableCellStyle}>{inv.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Chat with Data */}
      <section>
        <h2>Chat with Data</h2>
        <form onSubmit={handleChatSubmit} style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Ask a question about the data..."
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            style={{ padding: 6, width: "400px" }}
          />
          <button type="submit" style={{ marginLeft: 8, padding: "6px 12px" }} disabled={isChatLoading}>
            {isChatLoading ? "Loading..." : "Ask"}
          </button>
        </form>

        {chatResponse && (
          <div style={{ whiteSpace: "pre-wrap", background: "#f9f9f9", padding: 10, borderRadius: 4 }}>
            <h3>Generated SQL:</h3>
            <code>{chatResponse.sql}</code>

            <h3>Results:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {chatResponse.columns.map((col) => (
                    <th key={col} style={tableHeaderStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chatResponse.data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                    {chatResponse.columns.map((col) => (
                      <td key={col} style={tableCellStyle}>{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  padding: 20,
  background: "#eee",
  borderRadius: 6,
  textAlign: "center",
};

const tableHeaderStyle: React.CSSProperties = {
  borderBottom: "2px solid #ccc",
  padding: 8,
  textAlign: "left",
  background: "#f0f0f0",
};

const tableCellStyle: React.CSSProperties = {
  padding: 8,
};
