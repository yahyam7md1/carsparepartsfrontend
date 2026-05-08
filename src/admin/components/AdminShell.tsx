import { AdminMobileHeaderBrand, AdminSidebar } from "@/admin/components/AdminSidebar";

export function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <main className="min-h-screen flex-1 overflow-auto bg-background px-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-5 md:px-6 md:pb-8 md:pt-6 lg:px-8 lg:pt-8">
        <div className="mb-4 border-b border-black/[.06] pb-4 md:hidden">
          <AdminMobileHeaderBrand />
        </div>
        {children}
      </main>
    </div>
  );
}
