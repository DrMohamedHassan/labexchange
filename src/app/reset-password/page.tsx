"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking reset session...");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRules = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const isStrongPassword = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    async function prepareResetSession() {
      const hash = window.location.hash;

      if (hash.includes("access_token") && hash.includes("refresh_token")) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setMessage(error.message);
            setIsReady(false);
            return;
          }
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage(
          "Reset session not found. Please open the password reset link from your email again."
        );
        setIsReady(false);
        return;
      }

      setMessage("");
      setIsReady(true);
    }

    prepareResetSession();
  }, []);

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Please enter and confirm your new password.");
      return;
    }

    if (!isStrongPassword) {
      setMessage("Password is not strong enough. Please follow all conditions.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Updating password...");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");

    await supabase.auth.signOut();

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-md px-6 py-10">
        <Link href="/login" className="mb-6 inline-block font-bold text-emerald-700">
          â† Back to Login
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Create New Password</h1>

          <p className="mt-3 text-slate-600">
            Please choose a strong new password for your account.
          </p>

          {isReady && (
            <form onSubmit={handleResetPassword} className="mt-8 grid gap-5">
              <div>
                <label className="mb-2 block font-bold">New Password</label>

                <input
                  type="password"
                  placeholder="Strong new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-black">Password must include:</p>
                <PasswordRule ok={passwordRules.length} text="At least 8 characters" />
                <PasswordRule ok={passwordRules.uppercase} text="One capital letter A-Z" />
                <PasswordRule ok={passwordRules.lowercase} text="One small letter a-z" />
                <PasswordRule ok={passwordRules.number} text="One number 0-9" />
                <PasswordRule ok={passwordRules.symbol} text="One symbol like @ # $ %" />
              </div>

              <div>
                <label className="mb-2 block font-bold">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

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

function PasswordRule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={ok ? "mt-1 font-bold text-emerald-700" : "mt-1 text-slate-500"}>
      {ok ? "âœ“" : "â€¢"} {text}
    </p>
  );
}
