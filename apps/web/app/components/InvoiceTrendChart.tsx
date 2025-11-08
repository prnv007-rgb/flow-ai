// components/InvoiceTrendChart.tsx
"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type InvoiceTrendChartProps = {
  data: { month: string; invoiceCount: number; invoiceValue: number }[];
};

export default function InvoiceTrendChart({ data }: InvoiceTrendChartProps) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Invoice Count",
        data: data.map((d) => d.invoiceCount),
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.3)",
        tension: 0.3,
      },
      {
        label: "Invoice Value",
        data: data.map((d) => d.invoiceValue),
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.3)",
        tension: 0.3,
      },
    ],
  };

  return <Line data={chartData} />;
}
