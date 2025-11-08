import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search } from "lucide-react";
import { Invoice } from "@/lib/api";

interface InvoicesTableProps {
  invoices: Invoice[];
  onSearch: (query: string) => void;
  loading?: boolean;
}

export const InvoicesTable = ({ invoices, onSearch, loading }: InvoicesTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid')) return 'success';
    if (statusLower.includes('pending')) return 'warning';
    if (statusLower.includes('overdue')) return 'destructive';
    return 'secondary';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice #</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">{invoice.vendor}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground text-right">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusColor(invoice.status) as any}>
                      {invoice.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
