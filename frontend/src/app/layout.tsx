import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400","500","600","700","800"],
  display: 'swap',
  preload: true,
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "PLANORA 360",
  description: "Plateforme intégrée de planification, suivi-évaluation, gestion financière et pilotage de la performance",
  icons: {
    icon: [
      { url: '/logo-dark.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('user');
                  if (stored) {
                    const user = JSON.parse(stored);
                    const color = user?.organization?.brandColor;
                    if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
                      document.documentElement.style.setProperty('--color-brand', color);
                      const r = parseInt(color.slice(1, 3), 16);
                      const g = parseInt(color.slice(3, 5), 16);
                      const b = parseInt(color.slice(5, 7), 16);
                      const darken = (v) => Math.max(0, Math.round(v * 0.65)).toString(16).padStart(2, '0');
                      const darkColor = '#' + darken(r) + darken(g) + darken(b);
                      document.documentElement.style.setProperty('--color-brand-dark', darkColor);
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} font-outfit h-full antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
