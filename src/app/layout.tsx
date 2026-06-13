import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ArenaCore — CS Tournament History",
  description: "Complete history of CS competitive tournaments featuring top-10 teams, powered by HLTV data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cs-darker text-cs-text">
        <header className="border-b border-cs-border bg-cs-dark sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-cs-orange">Arena</span>
              <span>Core</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-cs-muted">
              <Link href="/" className="hover:text-white transition-colors">Tournaments</Link>
              <Link href="/teams" className="hover:text-white transition-colors">Teams</Link>
              <Link href="/rankings" className="hover:text-white transition-colors">Rankings</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
