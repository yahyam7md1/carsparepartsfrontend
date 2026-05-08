"use client";

import { AlertTriangle, Boxes, PackageX, Star } from "lucide-react";
import { StatCard } from "@/admin/components/dashboard/StatCard";
import { useAdminStats } from "@/hooks";

export function AdminDashboardView() {
  const { data, loading, error } = useAdminStats();

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={data?.totalProducts ?? 0}
          icon={Boxes}
          loading={loading}
        />
        <StatCard
          title="Out of Stock"
          value={data?.outOfStockCount ?? 0}
          icon={PackageX}
          tone="danger"
          loading={loading}
        />
        <StatCard
          title="Low Stock Alert"
          value={data?.lowStockCount ?? 0}
          icon={AlertTriangle}
          tone="warning"
          loading={loading}
        />
        <StatCard
          title="Featured Items"
          value={data?.featuredProductCount ?? 0}
          icon={Star}
          tone="accent"
          loading={loading}
        />
      </div>
    </section>
  );
}
