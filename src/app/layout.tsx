import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "KIWI | Premium Fashion",
  description: "KIWI Clothing - Premium mobile-first fashion brand with lightning-fast performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
