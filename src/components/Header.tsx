"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "seller" | "admin" | null;

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setRole(null);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        setRole("admin");
      } else {
        setRole("seller");
      }

      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setIsLoggedIn(false);
    setRole(null);

    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-800">
            LX
          </div>

          <span className="text-xl font-black md:text-2xl">
            Lab<span className="text-emerald-700">Exchange</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-extrabold lg:flex">
          <a href="/#listings" className="hover:text-emerald-700">
            Browse
          </a>

          <a href="/#categories" className="hover:text-emerald-700">
            Categories
          </a>

          <a href="/#how-it-works" className="hover:text-emerald-700">
            How it Works
          </a>

          <a href="/#trust" className="hover:text-emerald-700">
            About Us
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500">
              Loading...
            </span>
          ) : isLoggedIn ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 hover:border-purple-500 md:inline-block"
                >
                  Admin
                </Link>
              )}

              <Link
                href="/my-listings"
                className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:border-emerald-600 md:inline-block"
              >
                My Listings
              </Link>

              <Link
                href="/add-listing"
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 md:px-5 md:py-3"
              >
                + List an Item
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:border-red-500 md:px-5 md:py-3"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:border-emerald-600 md:px-5 md:py-3"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:border-emerald-600 md:inline-block md:px-5 md:py-3"
              >
                Create Account
              </Link>

              <Link
                href="/add-listing"
                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 md:px-5 md:py-3"
              >
                + List an Item
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}