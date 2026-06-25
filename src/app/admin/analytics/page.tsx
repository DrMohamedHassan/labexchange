"use client";

import Header from "@/components/Header";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AnalyticsEvent = {
  id: number;
  event_type: string;
  page_path: string | null;
  listing_id: number | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [message, setMessage] = useState("Loading analytics...");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        setMessage("You are not an admin.");
        return;
      }

      setIsAdmin(true);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("analytics_events")
        .select("id, event_type, page_path, listing_id, user_id, metadata, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setEvents((data || []) as AnalyticsEvent[]);
      setMessage("");
    }

    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const totalVisits = events.filter(
      (event) => event.event_type === "page_visit"
    ).length;

    const whatsappClicks = events.filter(
      (event) => event.event_type === "whatsapp_click"
    ).length;

    const uniqueVisitors = new Set(
      events
        .filter((event) => event.event_type === "page_visit")
        .map((event) => event.user_id || event.metadata?.userAgent || event.id)
    ).size;

    const dailyMap: Record<
      string,
      {
        visits: number;
        whatsappClicks: number;
      }
    > = {};

    events.forEach((event) => {
      const day = new Date(event.created_at).toISOString().slice(0, 10);

      if (!dailyMap[day]) {
        dailyMap[day] = {
          visits: 0,
          whatsappClicks: 0,
        };
      }

      if (event.event_type === "page_visit") {
        dailyMap[day].visits += 1;
      }

      if (event.event_type === "whatsapp_click") {
        dailyMap[day].whatsappClicks += 1;
      }
    });

    const dailyStats = Object.entries(dailyMap)
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const topPagesMap: Record<string, number> = {};

    events
      .filter((event) => event.event_type === "page_visit")
      .forEach((event) => {
        const page = event.page_path || "Unknown";
        topPagesMap[page] = (topPagesMap[page] || 0) + 1;
      });

    const topPages = Object.entries(topPagesMap)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topWhatsappListingsMap: Record<string, number> = {};

    events
      .filter((event) => event.event_type === "whatsapp_click")
      .forEach((event) => {
        const key = event.listing_id ? `Listing #${event.listing_id}` : "Unknown";
        topWhatsappListingsMap[key] = (topWhatsappListingsMap[key] || 0) + 1;
      });

    const topWhatsappListings = Object.entries(topWhatsappListingsMap)
      .map(([listing, count]) => ({ listing, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalVisits,
      whatsappClicks,
      uniqueVisitors,
      dailyStats,
      topPages,
      topWhatsappListings,
    };
  }, [events]);

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Admin Analytics</h1>

            <p className="mt-4 rounded-2xl bg-slate-100 p-4 font-semibold text-slate-700">
              {message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-black">Website Analytics</h1>

        <p className="mt-3 text-slate-600">
          Track daily visits, buyer interest, WhatsApp clicks, and top pages
          during the last 30 days.
        </p>

        {message && (
          <p className="mt-6 rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Page Visits" value={stats.totalVisits} />
          <StatCard label="WhatsApp Clicks" value={stats.whatsappClicks} />
          <StatCard label="Estimated Visitors" value={stats.uniqueVisitors} />
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Daily Statistics</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Visits</th>
                  <th className="px-4 py-3">WhatsApp Clicks</th>
                </tr>
              </thead>

              <tbody>
                {stats.dailyStats.map((day) => (
                  <tr key={day.date} className="border-t">
                    <td className="px-4 py-3 font-bold">{day.date}</td>
                    <td className="px-4 py-3">{day.visits}</td>
                    <td className="px-4 py-3">{day.whatsappClicks}</td>
                  </tr>
                ))}

                {stats.dailyStats.length === 0 && (
                  <tr>
                    <td className="px-4 py-5 text-slate-500" colSpan={3}>
                      No analytics yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Top Pages</h2>

            <div className="mt-5 grid gap-3">
              {stats.topPages.map((item) => (
                <InfoRow key={item.page} label={item.page} value={item.count} />
              ))}

              {stats.topPages.length === 0 && (
                <p className="text-slate-500">No page data yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Top WhatsApp Clicks</h2>

            <div className="mt-5 grid gap-3">
              {stats.topWhatsappListings.map((item) => (
                <InfoRow
                  key={item.listing}
                  label={item.listing}
                  value={item.count}
                />
              ))}

              {stats.topWhatsappListings.length === 0 && (
                <p className="text-slate-500">No WhatsApp click data yet.</p>
              )}
            </div>
          </div>
        </section>

        <p className="mt-8 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Note: this is simple first-party analytics for MVP evaluation. For
          more accurate visitor analytics later, connect Google Search Console
          and a privacy-friendly analytics tool.
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <span className="break-all font-bold text-slate-700">{label}</span>
      <span className="rounded-full bg-white px-3 py-1 font-black">
        {value}
      </span>
    </div>
  );
}