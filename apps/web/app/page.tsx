"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";

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

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setIsLoading(true);
        setError(null);

        const [statsData, trendsData, vendorsData, categoriesData, cashData, invoicesData] = await Promise.all([
          api.getStats(),
          api.getInvoiceTrends(),
          api.getTopVendors(),
          api.getCategorySpend(),
          api.getCashOutflow(),
          api.getInvoices(),
        ]);

        setStats(statsData);
        setInvoiceTrends(trendsData);
        setTopVendors(vendorsData);
        setCategorySpend(categoriesData);
        setCashOutflow(cashData);
        setInvoices(invoicesData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // Invoice search handler
  async function handleInvoiceSearch(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await api.getInvoices(invoiceSearch);
      setInvoices(data);
    } catch (err) {
      console.error("Invoice search failed:", err);
      setError("Failed to search invoices");
    }
  }

  // Chat submit handler
  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    setIsChatLoading(true);
    setChatResponse(null);

    try {
      const data = await api.chatWithData(chatQuestion);
      setChatResponse(data);
    } catch (err) {
      console.error("Chat query failed:", err);
      setError(err instanceof Error ? err.message : "Chat query failed");
    } finally {
      setIsChatLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main style={{ maxWidth: 900, margin: "auto", padding: 20, textAlign: "center" }}>
        <h1>Loading Dashboard...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
        <h1>Error Loading Dashboard</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Flowbit Analytics Dashboard</h1>

      {/* Overview Cards */}
      {stats && (
        <section style={{ display: "flex", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
          <div style={cardStyle}>
            <h3>Total Spend (YTD)</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
              ${stats.totalSpend.toLocaleString()}
            </p>
          </div>
          <div style={cardStyle}>
            <h3>Total Invoices Processed</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
              {stats.totalInvoices}
            </p>
          </div>
          <div style={cardStyle}>
            <h3>Documents Uploaded</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
              {stats.documentsUploaded}
            </p>
          </div>
          <div style={cardStyle}>
            <h3>Average Invoice Value</h3>
            <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
              ${stats.averageInvoiceValue.toFixed(2)}
            </p>
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
        <ul style={{ listStyle: "none", padding: 0 }}>
          {topVendors.map(({ name, spend }) => (
            <li key={name} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <strong>{name}</strong>: ${spend.toLocaleString()}
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
            style={{ padding: 6, width: "300px", border: "1px solid #ccc", borderRadius: 4 }}
          />
          <button type="submit" style={{ marginLeft: 8, padding: "6px 12px", cursor: "pointer" }}>
            Search
          </button>
        </form>

        <div style={{ overflowX: "auto" }}>
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
                  <td style={tableCellStyle}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      background: inv.status === "paid" ? "#d4edda" : "#fff3cd",
                      color: inv.status === "paid" ? "#155724" : "#856404"
                    }}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            style={{ padding: 6, width: "400px", border: "1px solid #ccc", borderRadius: 4 }}
          />
          <button 
            type="submit" 
            style={{ marginLeft: 8, padding: "6px 12px", cursor: "pointer" }} 
            disabled={isChatLoading}
          >
            {isChatLoading ? "Loading..." : "Ask"}
          </button>
        </form>

        {chatResponse && (
          <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 4, border: "1px solid #ddd" }}>
            <h3>Generated SQL:</h3>
            <pre style={{ background: "#fff", padding: 10, borderRadius: 4, overflowX: "auto" }}>
              <code>{chatResponse.sql}</code>
            </pre>

            <h3>Results ({chatResponse.row_count} rows):</h3>
            <div style={{ overflowX: "auto" }}>
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
          </div>
        )}
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
  padding: 20,
  background: "#f5f5f5",
  borderRadius: 8,
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const tableHeaderStyle: React.CSSProperties = {
  borderBottom: "2px solid #ccc",
  padding: 8,
  textAlign: "left",
  background: "#f0f0f0",
  fontWeight: "bold",
};

const tableCellStyle: React.CSSProperties = {
  padding: 8,
};