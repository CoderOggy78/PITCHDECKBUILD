import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "VentureForge AI — AI Investor Pitch Intelligence Platform",
  description:
    "Transform rough startup concepts and reference pitch decks into a structured, evidence-grounded 10-slide investor pitch blueprint with formula-backed financial modeling, RAG intelligence, and AI red-team critique.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#06080D] text-slate-100 antialiased selection:bg-brand-violet/30 selection:text-white relative">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
