import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "TechBridge — Find your direction",
  description: "Career guidance from real professionals, across domains and languages."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
