import { AdminSidebar } from "@/admin/components/AdminSidebar";

export function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="min-h-screen flex-1 overflow-auto bg-background p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
