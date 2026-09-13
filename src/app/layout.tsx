import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sumqayıt | Mənzil-Kommunal Ödəniş Sistemi",
    template: "%s | Sumqayıt MKTİB",
  },
  description:
    "Sumqayıt şəhər mənzil-kommunal xidmətləri: borcun yoxlanılması, onlayn ödəniş və elektron arayış. Təqdimat üçün demo portal.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="az">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
