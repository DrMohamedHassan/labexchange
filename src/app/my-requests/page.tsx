"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactMessage = {
  id: number;
  subject: string | null;
  message_type: string | null;
  message: string | null;
  status: string | null;
  admin_reply: string | null;
  created_at: string | null;
  handled_at: string | null;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<ContactMessage[]>([]);
  const [message, setMessage] = useState("Loading your requests...");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first to view your requests.");
      return;
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select(
        "id, subject, message_type, message, status, admin_reply, created_at, handled_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setRequests((data || []) as ContactMessage[]);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">My Requests</h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Track your complaints, misleading reports, enquiries, and admin
            replies.
          </p>

          {message && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>
          )}

          <div className="mt-8 grid gap-4">
            {requests.length > 0 ? (
              requests.map((item) => (
                <Link
                  key={item.id}
                  href={`/my-requests/${item.id}`}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-400"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">
                        {item.subject || item.message_type || "Contact request"}
                      </h2>

                      <p className="mt-2 line-clamp-2 leading-7 text-slate-600">
                        {item.message || "No message body."}
                      </p>

                      {item.admin_reply ? (
                        <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-700">
                          Admin replied — click to read
                        </p>
                      ) : (
                        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-500">
                          No admin reply yet
                        </p>
                      )}
                    </div>

                    <StatusBadge status={item.status || "new"} />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-400">
                    Submitted:{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "No date"}
                  </p>
                </Link>
              ))
            ) : (
              !message && (
                <div className="rounded-3xl bg-slate-50 p-8">
                  <h2 className="text-2xl font-black">No requests yet</h2>

                  <p className="mt-3 text-slate-600">
                    When you send a complaint or request, it will appear here.
                  </p>

                  <Link
                    href="/contact"
                    className="mt-5 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
                  >
                    Send Request
                  </Link>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "resolved" || status === "closed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "rejected"
      ? "bg-red-50 text-red-700 ring-red-200"
      : status === "under_review"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-indigo-50 text-indigo-700 ring-indigo-200";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${className}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}