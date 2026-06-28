"use client";

import { useRouter } from "next/navigation";
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

export default function UserNotificationBell() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let loadedUserId = "";

    async function loadUserAndNotifications() {
      try {
        setIsLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!mounted) return;

          setUserId("");
          setUnreadCount(0);
          setNotifications([]);
          setIsLoading(false);
          return;
        }

        loadedUserId = user.id;

        if (!mounted) return;

        setUserId(user.id);
        await loadNotifications(user.id);

        if (!mounted) return;
        setIsLoading(false);
      } catch (error) {
        console.error("User notifications failed:", error);

        if (!mounted) return;

        setIsLoading(false);
      }
    }

    loadUserAndNotifications();

    const interval = window.setInterval(() => {
      if (loadedUserId) {
        loadNotifications(loadedUserId);
      }
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  async function loadNotifications(currentUserId: string) {
    const { data } = await supabase
      .from("user_notifications")
      .select("id, type, title, message, href, is_read, created_at")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { count } = await supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", currentUserId)
      .eq("is_read", false);

    setNotifications((data || []) as UserNotification[]);
    setUnreadCount(count || 0);
  }

  async function markNotificationAsRead(notificationId: number) {
    if (!userId) return;

    await supabase
      .from("user_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", userId);

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item
      )
    );

    setUnreadCount((current) => Math.max(current - 1, 0));
  }

  async function openNotification(item: UserNotification) {
    if (!item.is_read) {
      await markNotificationAsRead(item.id);
    }

    setIsOpen(false);
    router.push(item.href || "/notifications");
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

    await loadNotifications(userId);
  }

  if (isLoading || !userId) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm hover:border-emerald-600"
        aria-label="User notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-700 px-2 text-xs font-black text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[340px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  My Notifications
                </h2>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  Unread updates related to your account.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                {unreadCount}
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="mt-3 text-xs font-black text-emerald-700 underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto p-3">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openNotification(item)}
                  className={
                    item.is_read
                      ? "block w-full rounded-2xl p-4 text-left transition hover:bg-slate-50"
                      : "block w-full rounded-2xl bg-emerald-50 p-4 text-left transition hover:bg-emerald-100"
                  }
                >
                  <p className="font-black text-slate-950">{item.title}</p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.message}
                  </p>

                  <p className="mt-2 text-[11px] font-bold text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">
                No notifications yet.
              </p>
            )}
          </div>

          <div className="border-t border-slate-100 p-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
              className="block w-full rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
            >
              Open All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}