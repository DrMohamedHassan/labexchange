"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import { supabase } from "@/lib/supabase";

type UserRole = "seller" | "admin" | null;

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!isMounted) return;

          setIsLoggedIn(false);
          setRole(null);
          setIsVerifiedSeller(false);
          setAvatarUrl(null);
          setFullName(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_verified_seller, avatar_url, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!isMounted) return;

        setIsLoggedIn(true);
        setRole(profile?.role === "admin" ? "admin" : "seller");
        setIsVerifiedSeller(Boolean(profile?.is_verified_seller));
        setAvatarUrl(profile?.avatar_url || null);
        setFullName(profile?.full_name || user.email || "User");
        setLoading(false);
      } catch (error) {
        console.error("Header session loading failed:", error);

        if (!isMounted) return;

        setIsLoggedIn(false);
        setRole(null);
        setIsVerifiedSeller(false);
        setAvatarUrl(null);
        setFullName(null);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }

    setIsLoggedIn(false);
    setRole(null);
    setIsVerifiedSeller(false);
    setAvatarUrl(null);
    setFullName(null);

    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-800">
            LF
          </div>

          <span className="text-xl font-black md:text-2xl">
            Lab<span className="text-emerald-700">Finds</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-extrabold lg:flex">
          <Link href="/listings" className="hover:text-emerald-700">
            Buy Items
          </Link>

          <a href="/#categories" className="hover:text-emerald-700">
            Categories
          </a>

          <Link href="/policies" className="hover:text-emerald-700">
            Policies
          </Link>

          <Link href="/contact" className="hover:text-emerald-700">
            Contact
          </Link>
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {loading ? (
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500">
              Loading...
            </span>
          ) : isLoggedIn ? (
            <>
              {role === "admin" && <NotificationBell />}

              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 shadow-sm hover:border-emerald-600"
                title={fullName || "Profile"}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">
                    👤
                  </span>
                )}

                <span className="hidden max-w-[120px] truncate md:inline">
                  Profile
                </span>
              </Link>

              {role === "admin" && (
                <>
                  <Link
                    href="/admin"
                    className="hidden rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 hover:border-purple-500 md:inline-block"
                  >
                    Admin
                  </Link>

                  <Link
                    href="/admin/analytics"
                    className="hidden rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 hover:border-sky-500 md:inline-block"
                  >
                    Analytics
                  </Link>

                  <Link
                    href="/admin/reports"
                    className="hidden rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:border-red-500 md:inline-block"
                  >
                    Reports
                  </Link>

                  <Link
                    href="/admin/contact-messages"
                    className="hidden rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 hover:border-indigo-500 md:inline-block"
                  >
                    Messages
                  </Link>

                  <Link
                    href="/admin/reviews"
                    className="hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:border-amber-500 md:inline-block"
                  >
                    Reviews
                  </Link>

                  <Link
                    href="/admin/verifications"
                    className="hidden rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:border-emerald-500 md:inline-block"
                  >
                    Verifications
                  </Link>
                </>
              )}

              {role !== "admin" && (
                <Link
                  href="/verify-seller"
                  className={
                    isVerifiedSeller
                      ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 hover:border-emerald-500"
                      : "rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700 hover:border-amber-500"
                  }
                >
                  {isVerifiedSeller ? "✅ Verified" : "🛡️ Verify"}
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
                href="/verify-seller"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700 hover:border-amber-500"
              >
                🛡️ Get Verified
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