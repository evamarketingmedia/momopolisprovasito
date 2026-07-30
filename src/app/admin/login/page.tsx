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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-momo-green-neon/35 via-white to-momo-orange/25 px-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-momo-green-neon bg-white p-8 shadow-xl">
        <h1 className="font-display text-2xl font-extrabold text-momo-black">
          Momòpolis <span className="text-momo-orange">Admin</span>
        </h1>
        <p className="mt-2 text-sm text-momo-black/60">
          Accesso riservato alla gestione del sito, del preventivatore e delle disponibilità.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-momo-black/80">
              Nome utente
            </label>
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              autoFocus
              className="momo-input"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-momo-black/80">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="momo-input"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-400">
              Nome utente o password non corretti. Riprova.
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
