const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow-back-three.vercel.app';

export async function fetchAPI<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getStats: () => fetchAPI('/stats'),
  getInvoiceTrends: () => fetchAPI('/invoice-trends'),
  getTopVendors: () => fetchAPI('/vendors/top10'),
  getCategorySpend: () => fetchAPI('/category-spend'),
  getCashOutflow: () => fetchAPI('/cash-outflow'),
  getInvoices: (search?: string) => fetchAPI(`/invoices${search ? `?search=${search}` : ''}`),
  chatWithData: (question: string) => fetchAPI('/chat-with-data', {
    method: 'POST',
    body: JSON.stringify({ question }),
  }),
};