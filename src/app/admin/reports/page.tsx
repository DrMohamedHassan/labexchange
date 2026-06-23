"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Report = {
  id: number;
  listing_id: number;
  reporter_id: string | null;
  reporter_email: string | null;
  reason: string;
  message: string;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type ListingSummary = {
  id: number;
  title: string | null;
  status: string | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [listings, setListings] = useState<Record<number, ListingSummary>>({});
  const [message, setMessage] = useState("Loading reports...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    async function loadReports() {
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

      const { data: reportData, error: reportError } = await supabase
        .from("listing_reports")
        .select(
          "id, listing_id, reporter_id, reporter_email, reason, message, status, admin_note, created_at"
        )
        .order("created_at", { ascending: false });

      if (reportError) {
        setMessage(reportError.message);
        return;
      }

      const loadedReports = (reportData || []) as Report[];
      setReports(loadedReports);

      const listingIds = [
        ...new Set(loadedReports.map((report) => report.listing_id)),
      ];

      if (listingIds.length > 0) {
        const { data: listingData } = await supabase
          .from("listings")
          .select("id, title, status")
          .in("id", listingIds);

        const map: Record<number, ListingSummary> = {};

        (listingData || []).forEach((listing) => {
          map[listing.id] = listing as ListingSummary;
        });

        setListings(map);
      }

      setMessage("");
    }

    loadReports();
  }, []);

  async function updateReportStatus(reportId: number, newStatus: string) {
    setMessage("Updating report...");

    const { error } = await supabase
      .from("listing_reports")
      .update({
        status: newStatus,
        admin_note: adminNotes[reportId] || null,
      })
      .eq("id", reportId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: newStatus,
              admin_note: adminNotes[reportId] || report.admin_note,
            }
          : report
      )
    );

    setMessage(`Report marked as ${newStatus}.`);
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Admin Reports</h1>
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
        <h1 className="text-4xl font-black">Ad Reports & Complaints</h1>

        <p className="mt-3 text-slate-600">
          Reports submitted by buyers are visible to admin only.
        </p>

        {message && (
          <p className="mt-6 rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-5">
          {reports.map((report) => {
            const listing = listings[report.listing_id];

            return (
              <div
                key={report.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      {report.reason}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {listing?.title || `Listing #${report.listing_id}`}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Listing status: {listing?.status || "Unknown"}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black capitalize">
                    {report.status}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-500">
                    Complaint message
                  </p>

                  <p className="mt-2 leading-7 text-slate-800">
                    {report.message}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
                  <InfoItem
                    label="Reporter email"
                    value={report.reporter_email || "-"}
                  />

                  <InfoItem
                    label="Submitted at"
                    value={new Date(report.created_at).toLocaleString()}
                  />

                  <InfoItem
                    label="Admin note"
                    value={report.admin_note || "-"}
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-2 block font-black">Admin note</label>

                  <textarea
                    rows={3}
                    placeholder="Write internal admin note..."
                    value={adminNotes[report.id] || ""}
                    onChange={(event) =>
                      setAdminNotes((current) => ({
                        ...current,
                        [report.id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/listings/${report.listing_id}`}
                    className="rounded-2xl border border-slate-200 px-5 py-3 font-bold hover:border-emerald-600"
                  >
                    Open Listing
                  </Link>

                  <button
                    type="button"
                    onClick={() => updateReportStatus(report.id, "reviewing")}
                    className="rounded-2xl bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-700"
                  >
                    Mark Reviewing
                  </button>

                  <button
                    type="button"
                    onClick={() => updateReportStatus(report.id, "resolved")}
                    className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                  >
                    Mark Resolved
                  </button>

                  <button
                    type="button"
                    onClick={() => updateReportStatus(report.id, "dismissed")}
                    className="rounded-2xl bg-slate-800 px-5 py-3 font-bold text-white hover:bg-slate-900"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}

          {reports.length === 0 && !message && (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              No reports yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-black">{value}</p>
    </div>
  );
}