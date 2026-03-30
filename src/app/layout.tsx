import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "疾走領域 / Drive Field",
  description:
    "あなたの能力が最も通る疾走領域を開眼せよ。神経系プロファイルから導く、あなた固有の領域。",
  openGraph: {
    title: "疾走領域 / Drive Field",
    description: "あなたの能力が最も通る疾走領域を開眼せよ。",
    type: "website",
    locale: "ja_JP",
    siteName: "疾走領域 / Drive Field",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
