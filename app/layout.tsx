import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Debandeja",
  description: "Controle de estoque e operação para distribuidoras de bebidas.",
  metadataBase: new URL("https://www.debandeja.store"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "DeBandeja",
    title: "DeBandeja",
    description: "Controle de estoque e operação para distribuidoras de bebidas.",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "DeBandeja — Sistema para distribuidora de bebidas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeBandeja",
    description: "Controle de estoque e operação para distribuidoras de bebidas.",
    images: ["/social-preview.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
