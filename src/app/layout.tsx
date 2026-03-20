import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "疾走領域 / Drive Field 3000",
  description:
    "あなたの能力が最も通る疾走領域を開眼せよ。神経系プロファイルから導く、2880の領域。",
  openGraph: {
    title: "疾走領域 / Drive Field 3000",
    description: "あなたの能力が最も通る疾走領域を開眼せよ。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-black text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
