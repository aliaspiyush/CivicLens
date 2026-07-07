import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalHeader from "@/components/layout/GlobalHeader";
import GlobalFooter from "@/components/layout/GlobalFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicLens - Public Governance Portal",
  description:
    "Official citizen feedback and civic demand prioritization portal for Members of Parliament.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <GlobalHeader />
        <main className="flex-1 flex flex-col">{children}</main>
        <GlobalFooter />
      </body>
    </html>
  );
}
