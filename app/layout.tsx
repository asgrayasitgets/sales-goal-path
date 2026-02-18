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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
