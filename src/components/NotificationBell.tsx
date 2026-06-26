"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminNotification = {
  key: string;
  title: string;
  description: string;
  count: number;
  href: string;
  badgeClassName: string;
};

export default function NotificationBell() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [verificationCount, setVerificationCount] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function checkAdminAndLoad() {
      try {
        setIsLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!mounted) return;
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        const admin = profile?.role === "admin";
        setIsAdmin(admin);

        if (admin) {
          await loadCounts();
        }

        if (!mounted) return;
        setIsLoading(false);
      } catch (error) {
        console.error("Notification loading failed:", error);

        if (!mounted) return;

        setIsAdmin(false);
        setIsLoading(false);
      }
    }

    checkAdminAndLoad();

    const interval = window.setInterval(() => {
      if (isAdmin) {
        loadCounts();
      }
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [isAdmin]);

  async function loadCounts() {
    try {
      const { count: pendingVerifications } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "pending");

      const { count: pendingListings } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingContacts } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "open", "pending", "unread"]);

      const { count: pendingReports } = await supabase
        .from("listing_reports")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "open", "pending", "unread"]);

      const { count: pendingReviews } = await supabase
        .from("seller_reviews")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      setVerificationCount(pendingVerifications || 0);
      setListingCount(pendingListings || 0);
      setContactCount(pendingContacts || 0);
      setReportCount(pendingReports || 0);
      setReviewCount(pendingReviews || 0);
    } catch (error) {
      console.error("Notification counts failed:", error);
    }
  }

  const notifications = useMemo<AdminNotification[]>(
    () => [
      {
        key: "verifications",
        title: "Seller verification requests",
        description: "Users waiting for ID / seller verification approval.",
        count: verificationCount,
        href: "/admin/verifications",
        badgeClassName: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      },
      {
        key: "listings",
        title: "Product approvals",
        description: "Listings waiting for admin acceptance or rejection.",
        count: listingCount,
        href: "/admin",
        badgeClassName: "bg-blue-50 text-blue-700 ring-blue-200",
      },
      {
        key: "contacts",
        title: "Contact messages",
        description: "Complaints, enquiries, misleading reports, or help requests.",
        count: contactCount,
        href: "/admin/contact-messages",
        badgeClassName: "bg-indigo-50 text-indigo-700 ring-indigo-200",
      },
      {
        key: "reports",
        title: "Listing reports",
        description: "Users reported misleading, unsafe, or suspicious listings.",
        count: reportCount,
        href: "/admin/reports",
        badgeClassName: "bg-red-50 text-red-700 ring-red-200",
      },
      {
        key: "reviews",
        title: "Seller review approvals",
        description: "Reviews waiting for admin approval before publishing.",
        count: reviewCount,
        href: "/admin/reviews",
        badgeClassName: "bg-amber-50 text-amber-700 ring-amber-200",
      },
    ],
    [verificationCount, listingCount, contactCount, reportCount, reviewCount]
  );

  const totalCount = notifications.reduce((sum, item) => sum + item.count, 0);

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:border-emerald-600"
        aria-label="Admin notifications"
      >
        🔔

        {totalCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-black text-white">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[340px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Admin Notifications
                </h2>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  Pending actions requiring admin review.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                {totalCount}
              </span>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {notifications.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-2xl p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{item.title}</p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${item.badgeClassName}`}
                  >
                    {item.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 p-3">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
            >
              Open Notification Center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}