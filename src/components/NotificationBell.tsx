"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "seller" | "admin" | null;

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean | null;
  created_at: string;
};

export default function NotificationBell({ userRole }: { userRole: UserRole }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.is_read).length;
  }, [notifications]);

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [userRole]);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNotifications([]);
      return;
    }

    const filter =
      userRole === "admin"
        ? `recipient_id.eq.${user.id},recipient_role.eq.admin`
        : `recipient_id.eq.${user.id}`;

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, link_url, is_read, created_at")
      .or(filter)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotifications((data || []) as NotificationItem[]);
  }

  async function markOneAsRead(notification: NotificationItem) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification.id);

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      )
    );

    if (notification.link_url) {
      window.location.href = notification.link_url;
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    setNotifications((current) =>
      current.map((item) => ({ ...item, is_read: true }))
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          loadNotifications();
        }}
        className="relative rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black shadow-sm hover:border-emerald-600 md:px-5 md:py-3"
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-black text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[200] mt-3 w-[340px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:w-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-black">Notifications</h2>
              <p className="text-xs font-bold text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
            >
              Mark all read
            </button>
          </div>

          {message && (
            <p className="mx-4 mt-4 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">
              {message}
            </p>
          )}

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markOneAsRead(notification)}
                  className={
                    notification.is_read
                      ? "block w-full border-b border-slate-100 px-5 py-4 text-left hover:bg-slate-50"
                      : "block w-full border-b border-red-100 bg-red-50 px-5 py-4 text-left hover:bg-red-100"
                  }
                >
                  <div className="flex items-start gap-3">
                    {!notification.is_read && (
                      <span className="mt-1 h-3 w-3 rounded-full bg-red-600" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-slate-950">
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs font-bold text-slate-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm font-bold text-slate-500">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}