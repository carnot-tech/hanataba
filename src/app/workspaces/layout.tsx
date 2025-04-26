import type { ReactNode } from "react";
import { Header } from "@/components/header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14">
        <div className="container mx-auto px-6 py-12 max-w-[800px]">
          {children}
        </div>
      </main>
    </>
  );
} 