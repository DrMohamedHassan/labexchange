"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName || !email || !phone || !city || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (!isStrongPassword) {
      setMessage(
        "Password is not strong enough. Please follow all password conditions."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Password and confirm password do not match.");
      return;
    }

    if (!acceptedTerms) {
      setMessage("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);
    setMessage("Creating account...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setMessage("Account created. Please check your email confirmation.");
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      email,
      phone,
      city,
      role: "seller",
    });

    if (profileError) {
      setMessage(profileError.message);
      setIsLoading(false);
      return;
    }

    setMessage("Account created successfully. Redirecting to login...");

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          â† Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Create Account</h1>

          <p className="mt-3 text-slate-600">
            Create an account to add and manage your listings.
          </p>

          <form onSubmit={handleRegister} className="mt-8 grid gap-5">
            <Input
              label="Full Name"
              placeholder="Ahmed Mohamed"
              value={fullName}
              onChange={setFullName}
            />

            <Input
              label="Email"
              type="email"
              placeholder="test1@gmail.com"
              value={email}
              onChange={setEmail}
            />

            <Input
              label="Phone Number"
              placeholder="201000000000"
              value={phone}
              onChange={setPhone}
            />

            <Input
              label="City"
              placeholder="Cairo"
              value={city}
              onChange={setCity}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Strong password"
              value={password}
              onChange={setPassword}
            />

            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="font-black">Password must include:</p>

              <PasswordRule ok={passwordRules.length} text="At least 8 characters" />
              <PasswordRule ok={passwordRules.uppercase} text="One capital letter A-Z" />
              <PasswordRule ok={passwordRules.lowercase} text="One small letter a-z" />
              <PasswordRule ok={passwordRules.number} text="One number 0-9" />
              <PasswordRule ok={passwordRules.symbol} text="One symbol like @ # $ %" />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <label className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1"
              />

              <span>
                I agree to the{" "}
                <Link href="/policies" className="font-bold text-emerald-700">
                  Terms of Service, Privacy Policy, Prohibited Items Policy, and
                  Disclaimer
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-emerald-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />
    </div>
  );
}

function PasswordRule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p className={ok ? "mt-1 font-bold text-emerald-700" : "mt-1 text-slate-500"}>
      {ok ? "âœ“" : "â€¢"} {text}
    </p>
  );
}
