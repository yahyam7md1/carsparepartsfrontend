import { AdminProtectedLayoutClient } from "@/admin/components/AdminProtectedLayoutClient";

export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminProtectedLayoutClient>{children}</AdminProtectedLayoutClient>;
}
