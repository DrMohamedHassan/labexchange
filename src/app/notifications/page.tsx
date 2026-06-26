"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  href: string | null;
  is_read: boolean | null;
  created_at: string;
};

export default function UserNotificationsPage() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [message, setMessage] = useState("Loading notifications...");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first to view your notifications.");
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("user_notifications")
      .select("id, type, title, message, href, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotifications((data || []) as UserNotification[]);
    setMessage("");
  }

  async function markOneAsRead(notificationId: number) {
    await supabase
      .from("user_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", userId);

    await loadNotifications();
  }

  async function markAllAsRead() {
    if (!userId) return;

    await supabase
      .from("user_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    await loadNotifications();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black">My Notifications</h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Updates related to your listings, verification, seller reviews,
                contact requests, and reports.
              </p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              Mark All Read
            </button>
          </div>

          {message && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>
          )}

          <div className="mt-8 grid gap-4">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={
                    item.is_read
                      ? "rounded-3xl border border-slate-200 bg-white p-5"
                      : "rounded-3xl border border-emerald-200 bg-emerald-50 p-5"
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-black">{item.title}</p>

                      <p className="mt-2 leading-7 text-slate-700">
                        {item.message}
                      </p>

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.href && (
                        <Link
                          href={item.href}
                          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                        >
                          Open
                        </Link>
                      )}

                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() => markOneAsRead(item.id)}
                          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:border-emerald-600"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              !message && (
                <div className="rounded-3xl bg-slate-50 p-8">
                  <h2 className="text-2xl font-black">No notifications yet</h2>

                  <p className="mt-3 text-slate-600">
                    Your account updates will appear here.
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}