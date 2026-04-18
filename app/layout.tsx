import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tamil Nadu Election Prediction Contest",
  description:
    "Predict Tamil Nadu Assembly constituency winners, track seat totals, and compare results after counting."
};

const navItems = [
  { href: "/contest/tn-2026", label: "Contest" },
  { href: "/contest/tn-2026/constituencies", label: "Constituencies" },
  { href: "/results/tn-2026", label: "Results" },
  { href: "/admin", label: "Admin" }
];

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="focus-ring flex min-w-0 items-center gap-2 rounded-md"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
                <Trophy aria-hidden className="h-5 w-5" />
              </span>
              <span className="truncate text-sm font-semibold sm:text-base">
                TN Prediction Contest
              </span>
            </Link>
            <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring rounded-md px-3 py-2 text-sm font-medium text-ink/75 hover:bg-white hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/login"
              className="focus-ring rounded-md bg-leaf px-3 py-2 text-sm font-semibold text-white hover:bg-leaf/90"
            >
              Sign in
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
