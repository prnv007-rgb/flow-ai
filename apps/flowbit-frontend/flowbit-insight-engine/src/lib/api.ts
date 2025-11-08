// API client for backend services
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const VANNA_BASE_URL = import.meta.env.VITE_VANNA_BASE_URL || 'http://localhost:8000';

export interface Stats {
  totalSpend: number;
  totalInvoices: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
}

export interface InvoiceTrend {
  month: string;
  totalValue: number;
  totalVolume: number;
}

export interface VendorSpend {
  name: string;
  spend: number;
}

export interface CategorySpend {
  name: string;
  value: number;
}

export interface CashOutflow {
  day: string;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  vendor: string;
  date: string;
  invoiceNumber: string;
  amount: number;
  status: string;
}

export interface ChatMessage {
  question: string;
  sql: string;
  raw_model_output?: string;
  data: any[];
  columns: string[];
  row_count: number;
}

export const api = {
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getInvoiceTrends(): Promise<InvoiceTrend[]> {
    const response = await fetch(`${API_BASE_URL}/invoice-trends`);
    if (!response.ok) throw new Error('Failed to fetch invoice trends');
    return response.json();
  },

  async getTopVendors(): Promise<VendorSpend[]> {
    const response = await fetch(`${API_BASE_URL}/vendors/top10`);
    if (!response.ok) throw new Error('Failed to fetch top vendors');
    return response.json();
  },

  async getCategorySpend(): Promise<CategorySpend[]> {
    const response = await fetch(`${API_BASE_URL}/category-spend`);
    if (!response.ok) throw new Error('Failed to fetch category spend');
    return response.json();
  },

  async getCashOutflow(): Promise<CashOutflow[]> {
    const response = await fetch(`${API_BASE_URL}/cash-outflow`);
    if (!response.ok) throw new Error('Failed to fetch cash outflow');
    return response.json();
  },

  async getInvoices(search?: string): Promise<Invoice[]> {
    const url = new URL(`${API_BASE_URL}/invoices`);
    if (search) url.searchParams.set('search', search);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  async chatWithData(question: string): Promise<ChatMessage> {
    const response = await fetch(`${VANNA_BASE_URL}/api/v1/chat-with-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error('Failed to query Vanna AI');
    return response.json();
  },
};
