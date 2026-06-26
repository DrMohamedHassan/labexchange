"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSellerVerificationButton({
  sellerId,
}: {
  sellerId: string;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!mounted) return;
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          console.error("Admin role check failed:", error.message);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        setIsAdmin(profile?.role === "admin");
        setIsLoading(false);
      } catch (error) {
        console.error("Admin verification button failed:", error);

        if (!mounted) return;

        setIsAdmin(false);
        setIsLoading(false);
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || !isAdmin || !sellerId) {
    return null;
  }

  return (
    <Link
      href={`/admin/user-verification/${sellerId}`}
      className="inline-flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-black text-purple-700 shadow-sm transition hover:border-purple-500 hover:bg-purple-100"
    >
      🔐 Admin Verification Details
    </Link>
  );
}