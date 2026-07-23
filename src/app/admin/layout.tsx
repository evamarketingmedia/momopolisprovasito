import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import Link from "next/link";
import "../globals.css";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logoutAction } from "./actions";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Momopolis Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();

  return (
    <html lang="it" className={`${baloo.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full bg-momo-cream">
        {authed && (
          <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b-2 border-momo-green-neon bg-momo-black px-6 py-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="font-display text-xl font-extrabold text-white">
                Momo<span className="text-momo-orange">polis</span>{" "}
                <span className="text-white/50">Admin</span>
              </span>
              <nav className="flex gap-1">
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Foto
                </Link>
                <Link
                  href="/admin/availability"
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Disponibilità
                </Link>
              </nav>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/80 hover:text-white"
              >
                Esci
              </button>
            </form>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
