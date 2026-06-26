"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type NotificationCard = {
  title: string;
  description: string;
  count: number;
  href: string;
  buttonText: string;
  className: string;
};

export default function AdminNotificationsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("Loading admin notifications...");
  const [cards, setCards] = useState<NotificationCard[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login as admin first.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        setMessage("Admin access only.");
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      const { count: verificationCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "pending");

      const { count: listingCount } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: contactCount } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "open", "pending", "unread"]);

      const { count: reportCount } = await supabase
        .from("listing_reports")
        .select("id", { count: "exact", head: true })
        .in("status", ["new", "open", "pending", "unread"]);

      const { count: reviewCount } = await supabase
        .from("seller_reviews")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      setCards([
        {
          title: "Seller Verification Requests",
          description:
            "Users submitted ID or seller verification documents and need approval or rejection.",
          count: verificationCount || 0,
          href: "/admin/verifications",
          buttonText: "Review Verifications",
          className: "border-emerald-200 bg-emerald-50 text-emerald-800",
        },
        {
          title: "Product Listing Approvals",
          description:
            "Sellers submitted products that need admin acceptance or rejection before publishing.",
          count: listingCount || 0,
          href: "/admin",
          buttonText: "Review Products",
          className: "border-blue-200 bg-blue-50 text-blue-800",
        },
        {
          title: "Contact Messages & Complaints",
          description:
            "Users submitted enquiries, complaints, misleading information alerts, or help requests.",
          count: contactCount || 0,
          href: "/admin/contact-messages",
          buttonText: "Open Messages",
          className: "border-indigo-200 bg-indigo-50 text-indigo-800",
        },
        {
          title: "Reported Listings",
          description:
            "Users reported unsafe, misleading, suspicious, or incorrect product listings.",
          count: reportCount || 0,
          href: "/admin/reports",
          buttonText: "Review Reports",
          className: "border-red-200 bg-red-50 text-red-800",
        },
        {
          title: "Seller Review Approvals",
          description:
            "Verified users submitted seller reviews that need admin approval before appearing publicly.",
          count: reviewCount || 0,
          href: "/admin/reviews",
          buttonText: "Review Seller Reviews",
          className: "border-amber-200 bg-amber-50 text-amber-800",
        },
      ]);

      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const total = cards.reduce((sum, card) => sum + card.count, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/admin" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to admin dashboard
        </Link>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-4 inline-block rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
            Admin only
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black">Notification Center</h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                All pending admin actions in one place. Each card opens the
                correct review page directly.
              </p>
            </div>

            <button
              type="button"
              onClick={loadNotifications}
              className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              Refresh
            </button>
          </div>

          {message && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>
          )}

          {isAdmin && (
            <>
              <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
                <p className="text-sm font-black uppercase tracking-wide text-slate-300">
                  Total pending actions
                </p>

                <p className="mt-2 text-5xl font-black">{total}</p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {cards.map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-3xl border p-6 ${card.className}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black">{card.title}</h2>

                        <p className="mt-3 text-sm leading-6">
                          {card.description}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-4 py-2 text-xl font-black shadow-sm">
                        {card.count}
                      </span>
                    </div>

                    <Link
                      href={card.href}
                      className="mt-6 inline-block rounded-2xl bg-white px-5 py-3 font-black text-slate-950 shadow-sm hover:bg-slate-100"
                    >
                      {card.buttonText} →
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}