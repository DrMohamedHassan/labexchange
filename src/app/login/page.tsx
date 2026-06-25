"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setMessage("Logging in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    setMessage("Login successful. Redirecting...");

    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 800);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-md px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Login</h1>

          <p className="mt-3 text-slate-600">
            Login to add listings, track your products, or access admin tools.
          </p>

          <form onSubmit={handleLogin} className="mt-8 grid gap-5">
            <div>
              <label className="mb-2 block font-bold">Email</label>

              <input
                type="email"
                placeholder="test1@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">Password</label>

              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <Link href="/forgot-password" className="font-bold text-emerald-700">
                Forgot password?
              </Link>

              <Link href="/register" className="font-bold text-emerald-700">
                Create account
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}