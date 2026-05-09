import type { ReactNode } from "react";
import { ShopFooter } from "@/shop/components/shell/ShopFooter";
import { ShopHeader } from "@/shop/components/shell/ShopHeader";
import { WhatsAppFab } from "@/shop/components/shell/WhatsAppFab";

type Props = Readonly<{
  children: ReactNode;
}>;

export function ShopShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
      <WhatsAppFab />
    </div>
  );
}
