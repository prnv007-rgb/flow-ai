// apps/api/src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = process.env.PORT || 3001; // Default to 3001 for API
const prisma = new PrismaClient();

// Middleware
app.use(cors()); // Enable CORS for your Vercel frontend
app.use(express.json()); // Enable JSON body parsing

// --- API Endpoints ---

// Task 1: /stats (Overview Cards)
app.get('/stats', async (req, res) => {
  try {
    const totalSpend = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
    });

    const invoiceCount = await prisma.invoice.count();

    const avgInvoiceValue = await prisma.invoice.aggregate({
      _avg: {
        amount: true,
      }
    });

    res.json({
      totalSpend: totalSpend._sum.amount ?? 0,
      totalInvoices: invoiceCount,
      // Documents Uploaded is just invoiceCount in this context
      documentsUploaded: invoiceCount, 
      averageInvoiceValue: avgInvoiceValue._avg.amount ?? 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Task 2: /invoice-trends (Line Chart)
app.get('/invoice-trends', async (req, res) => {
  try {
    // This is a more complex query. It groups by month.
    // Note: This specific query is for PostgreSQL.
    const trends = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(date_trunc('month', "date"), 'YYYY-MM') as month,
        SUM("amount") as "totalValue",
        COUNT("id")::float as "totalVolume"
      FROM "Invoice"
      GROUP BY month
      ORDER BY month;
    `;

    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch trends', details: error.message });
  }
});

// Task 3: /vendors/top10 (Horizonal Bar Chart)
app.get('/vendors/top10', async (req, res) => {
  try {
    const topVendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          select: {
            amount: true
          }
        }
      },
    });

    // Calculate total spend per vendor in code
    const vendorSpend = topVendors.map(vendor => ({
      name: vendor.name,
      spend: vendor.invoices.reduce((acc, inv) => acc + inv.amount, 0)
    }));

    // Sort by spend and take top 10
    const top10 = vendorSpend
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    res.json(top10);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch top vendors', details: error.message });
  }
});

// Task 4: /category-spend (Pie Chart)
app.get('/category-spend', async (req, res) => {
  try {
    // Group by the 'category' (Sachkonto) field
    const categorySpend = await prisma.lineItem.groupBy({
      by: ['category'],
      _sum: {
        totalPrice: true,
      },
    });

    // Format for the chart
    const formattedData = categorySpend.map(item => ({
      name: item.category ?? 'Uncategorized',
      value: item._sum.totalPrice ?? 0
    })).sort((a,b) => b.value - a.value);

    res.json(formattedData);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch category spend', details: error.message });
  }
});

// Task 5: /cash-outflow (Bar Chart)
app.get('/cash-outflow', async (req, res) => {
  try {
    // Get payments that are due (date is not null) and group by that date
    const outflow = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(date_trunc('day', "date"), 'YYYY-MM-DD') as day,
        SUM("amount") as "totalAmount"
      FROM "Payment"
      WHERE "date" IS NOT NULL
      GROUP BY day
      ORDER BY day;
    `;

    res.json(outflow);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch cash outflow', details: error.message });
  }
});

// Task 6: /invoices (Invoices Table)
app.get('/invoices', async (req, res) => {
  try {
    const { search } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: search ? {
        OR: [
          { invoiceNumber: { contains: search as string, mode: 'insensitive' } },
          { vendor: { name: { contains: search as string, mode: 'insensitive' } } },
        ],
      } : {},
      include: {
        vendor: {
          select: { name: true }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Format to match table
    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      vendor: inv.vendor.name,
      date: inv.date,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      status: inv.status,
    }));

    res.json(formattedInvoices);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch invoices', details: error.message });
  }
});

// Task 7: /chat-with-data (Placeholder)
// We will build this in Phase 3

app.post('/chat-with-data', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const VANNA_BASE_URL = process.env.VANNA_BASE_URL || 'http://localhost:8000';
  
  try {
    console.log('Proxying query to Vanna AI:', question);
    
    const vannaResponse = await fetch(`${VANNA_BASE_URL}/api/v1/chat-with-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!vannaResponse.ok) {
      const errorText = await vannaResponse.text();
      console.error('Vanna AI error:', vannaResponse.status, errorText);
      return res.status(vannaResponse.status).json({ 
        error: 'Vanna AI request failed',
        details: errorText 
      });
    }

    const data = await vannaResponse.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error calling Vanna AI:', error);
    res.status(500).json({ 
      error: 'Failed to connect to Vanna AI',
      details: error.message 
    });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});