import "./globals.css";

export const metadata = {
  title: "Sales Goal Path",
  description: "Live dashboard powered by Google Sheet data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
  lang="en"
  style={
    {
      "--brand-card": process.env.NEXT_PUBLIC_BRAND_CARD,
      "--brand-bg": process.env.NEXT_PUBLIC_BRAND_BG,
      "--brand-text": process.env.NEXT_PUBLIC_BRAND_TEXT,
      "--brand-accent": process.env.NEXT_PUBLIC_BRAND_ACCENT,
      "--brand-muted": process.env.NEXT_PUBLIC_BRAND_MUTED,
    } as React.CSSProperties
  }
>
      <body>{children}</body>
    </html>
  );
}
