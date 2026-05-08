"use client";

import { useCallback } from "react";
import { AlertTriangle, Package, PackageX, Star } from "lucide-react";
import { LowStockAlertCard } from "@/admin/components/dashboard/LowStockAlertCard";
import { RecentlyAddedProductsCard } from "@/admin/components/dashboard/RecentlyAddedProductsCard";
import { StatCard } from "@/admin/components/dashboard/StatCard";
import { useAdminLowStockRows, useAdminProducts, useAdminStats } from "@/hooks";

export function AdminDashboardView() {
  const { data, loading, error, refetch } = useAdminStats();
  const lowStock = useAdminLowStockRows({ params: { page: 1, limit: 10 } });
  const recentProducts = useAdminProducts({ params: { page: 1, limit: 5 } });

  const refreshDashboardData = useCallback(async () => {
    await Promise.all([refetch(), lowStock.refetch(), recentProducts.refetch()]);
  }, [refetch, lowStock, recentProducts]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-secondary">An overview of inventory and activity.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Failed to load dashboard stats. Please refresh.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        <StatCard
          title="Total Products"
          value={data?.totalProducts ?? 0}
          icon={Package}
          loading={loading}
        />
        <StatCard
          title="Out of Stock"
          value={data?.outOfStockCount ?? 0}
          icon={PackageX}
          tone="default"
          loading={loading}
        />
        <StatCard
          title="Low Stock Alert"
          value={data?.lowStockCount ?? 0}
          icon={AlertTriangle}
          tone="default"
          loading={loading}
        />
        <StatCard
          title="Featured Items"
          value={data?.featuredProductCount ?? 0}
          icon={Star}
          tone="default"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LowStockAlertCard
          rows={lowStock.data?.rows ?? []}
          loading={lowStock.loading}
          error={lowStock.error ? lowStock.error.message : null}
          onChanged={refreshDashboardData}
        />
        <RecentlyAddedProductsCard
          rows={recentProducts.data?.products ?? []}
          loading={recentProducts.loading}
          error={recentProducts.error ? recentProducts.error.message : null}
        />
      </div>
    </section>
  );
}
