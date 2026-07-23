import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Accedi · Momopolis Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-momo-black px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-momo-black-soft p-8">
        <h1 className="font-display text-2xl font-extrabold text-white">
          Momopolis <span className="text-momo-orange">Admin</span>
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Accesso riservato alla gestione delle foto del sito.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-white/80">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-xl border border-white/15 bg-momo-black px-4 py-2.5 text-white placeholder:text-white/30 focus:border-momo-orange focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-400">
              Password errata. Riprova.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-momo-orange px-5 py-2.5 font-extrabold text-momo-black transition-transform hover:scale-105"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}
