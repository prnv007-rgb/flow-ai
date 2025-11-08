import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { InvoiceTrendChart } from "@/components/InvoiceTrendChart";
import { VendorSpendChart } from "@/components/VendorSpendChart";
import { CategorySpendChart } from "@/components/CategorySpendChart";
import { CashOutflowChart } from "@/components/CashOutflowChart";
import { InvoicesTable } from "@/components/InvoicesTable";
import { DollarSign, FileText, Upload, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: api.getStats,
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["invoice-trends"],
    queryFn: api.getInvoiceTrends,
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["top-vendors"],
    queryFn: api.getTopVendors,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["category-spend"],
    queryFn: api.getCategorySpend,
  });

  const { data: outflow, isLoading: outflowLoading } = useQuery({
    queryKey: ["cash-outflow"],
    queryFn: api.getCashOutflow,
  });

  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ["invoices", searchQuery],
    queryFn: () => api.getInvoices(searchQuery),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    refetchInvoices();
  }, [searchQuery, refetchInvoices]);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your invoice and payment data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spend (YTD)"
            value={stats ? `$${stats.totalSpend.toLocaleString()}` : "$0"}
            icon={DollarSign}
            loading={statsLoading}
          />
          <StatCard
            title="Total Invoices"
            value={stats?.totalInvoices || 0}
            icon={FileText}
            loading={statsLoading}
          />
          <StatCard
            title="Documents Uploaded"
            value={stats?.documentsUploaded || 0}
            icon={Upload}
            loading={statsLoading}
          />
          <StatCard
            title="Avg Invoice Value"
            value={stats ? `$${stats.averageInvoiceValue.toLocaleString()}` : "$0"}
            icon={TrendingUp}
            loading={statsLoading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InvoiceTrendChart data={trends || []} loading={trendsLoading} />
          <CategorySpendChart data={categories || []} loading={categoriesLoading} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VendorSpendChart data={vendors || []} loading={vendorsLoading} />
          <CashOutflowChart data={outflow || []} loading={outflowLoading} />
        </div>

        {/* Invoices Table */}
        <InvoicesTable
          invoices={invoices || []}
          onSearch={handleSearch}
          loading={invoicesLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
