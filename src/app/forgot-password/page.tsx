"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Sending password reset email...");

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage(
      "Password reset email sent. Please check your inbox and open the reset link to create a new password."
    );

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-md px-6 py-10">
        <Link href="/login" className="mb-6 inline-block font-bold text-emerald-700">
          â† Back to Login
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Forgot Password</h1>

          <p className="mt-3 text-slate-600">
            Enter your email address. We will send you a secure reset email to
            create a new password.
          </p>

          <form onSubmit={handleForgotPassword} className="mt-8 grid gap-5">
            <div>
              <label className="mb-2 block font-bold">Email</label>

              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Sending..." : "Send Reset Email"}
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
