import "./globals.css";

export const metadata = {
  title: "Sales Goal Path",
  description: "Live dashboard powered by Google Sheet data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
      // ========= NEW STANDARD TOKENS (preferred) =========
      "--brand-bg":
        process.env.NEXT_PUBLIC_BRAND_BG || "#F1EFE7",

      "--brand-surface":
        process.env.NEXT_PUBLIC_BRAND_SURFACE ||
        process.env.NEXT_PUBLIC_BRAND_CARD || // backwards compat
        "rgba(255,255,255,0.65)",

      "--brand-surface-strong":
        process.env.NEXT_PUBLIC_BRAND_SURFACE_STRONG || "#212721",

      "--brand-text":
        process.env.NEXT_PUBLIC_BRAND_TEXT || "#212721",

      "--brand-text-muted":
        process.env.NEXT_PUBLIC_BRAND_TEXT_MUTED ||
        "rgba(33,39,33,0.70)",

      "--brand-border":
        process.env.NEXT_PUBLIC_BRAND_BORDER ||
        "rgba(33,39,33,0.14)",

      "--brand-accent":
        process.env.NEXT_PUBLIC_BRAND_ACCENT || "#CAB448",

      "--brand-accent-contrast":
        process.env.NEXT_PUBLIC_BRAND_ACCENT_CONTRAST || "#ffffff",

      "--brand-success":
        process.env.NEXT_PUBLIC_BRAND_SUCCESS || "#16a34a",

      "--brand-warning":
        process.env.NEXT_PUBLIC_BRAND_WARNING || "#f59e0b",

      "--brand-danger":
        process.env.NEXT_PUBLIC_BRAND_DANGER || "#ef4444",

      // ========= OPTIONAL: keep your existing button/tab vars =========
      // (You can later remove these env vars if you decide to derive them from brand tokens)
      "--btn-bg":
        process.env.NEXT_PUBLIC_BRAND_BUTTON_BG ||
        (process.env.NEXT_PUBLIC_BRAND_SURFACE_STRONG || "#212721"),

      "--btn-text":
        process.env.NEXT_PUBLIC_BRAND_BUTTON_TEXT || "#ffffff",

      "--tab-active-bg":
        process.env.NEXT_PUBLIC_TAB_ACTIVE_BG ||
        (process.env.NEXT_PUBLIC_BRAND_SURFACE_STRONG || "#212721"),

      "--tab-active-text":
        process.env.NEXT_PUBLIC_TAB_ACTIVE_TEXT || "#ffffff",

      "--tab-inactive-bg":
        process.env.NEXT_PUBLIC_TAB_INACTIVE_BG ||
        (process.env.NEXT_PUBLIC_BRAND_SURFACE || "rgba(255,255,255,0.65)"),

      "--tab-inactive-text":
        process.env.NEXT_PUBLIC_TAB_INACTIVE_TEXT ||
        (process.env.NEXT_PUBLIC_BRAND_TEXT || "#212721"),

      // ========= OPTIONAL: header vars =========
      "--header-bg":
        process.env.NEXT_PUBLIC_HEADER_BG ||
        (process.env.NEXT_PUBLIC_BRAND_SURFACE_STRONG || "#212721"),

      "--header-text":
        process.env.NEXT_PUBLIC_HEADER_TEXT || "#ffffff",

      "--header-button-bg":
        process.env.NEXT_PUBLIC_HEADER_BUTTON_BG ||
        (process.env.NEXT_PUBLIC_BRAND_ACCENT || "#CAB448"),

      "--header-button-text":
        process.env.NEXT_PUBLIC_HEADER_BUTTON_TEXT ||
        (process.env.NEXT_PUBLIC_BRAND_ACCENT_CONTRAST || "#ffffff"),

      // ========= BACKWARD COMPAT (so globals.css var(--brand-muted,...) still works) =========
      "--brand-muted":
        process.env.NEXT_PUBLIC_BRAND_MUTED ||
        process.env.NEXT_PUBLIC_BRAND_TEXT_MUTED ||
        "rgba(33,39,33,0.70)",

      // keep old var if anything references it
      "--brand-card":
        process.env.NEXT_PUBLIC_BRAND_CARD ||
        process.env.NEXT_PUBLIC_BRAND_SURFACE ||
        "rgba(255,255,255,0.65)",
    } as React.CSSProperties
  }
>

