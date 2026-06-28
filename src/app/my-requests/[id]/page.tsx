"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactMessage = {
  id: number;
  name: string | null;
  email: string | null;
  subject: string | null;
  message_type: string | null;
  message: string | null;
  status: string | null;
  admin_reply: string | null;
  created_at: string | null;
  handled_at: string | null;
};

export default function MyRequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const requestId = Number(params.id);

  const [request, setRequest] = useState<ContactMessage | null>(null);
  const [pageMessage, setPageMessage] = useState("Loading request...");

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  async function loadRequest() {
    if (Number.isNaN(requestId)) {
      setPageMessage("Invalid request ID.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPageMessage("Please login first to view this request.");
      return;
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .select(
        "id, name, email, subject, message_type, message, status, admin_reply, created_at, handled_at"
      )
      .eq("id", requestId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setPageMessage(error.message);
      return;
    }

    if (!data) {
      setPageMessage("Request not found, or you do not have permission to view it.");
      return;
    }

    setRequest(data as ContactMessage);
    setPageMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/my-requests"
          className="mb-6 inline-block font-bold text-emerald-700"
        >
          ← Back to my requests
        </Link>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          {pageMessage && (
            <p className="rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {pageMessage}
            </p>
          )}

          {request && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                    Request #{request.id}
                  </p>

                  <h1 className="text-4xl font-black">
                    {request.subject || request.message_type || "Contact request"}
                  </h1>

                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Submitted:{" "}
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString()
                      : "No date"}
                  </p>
                </div>

                <StatusBadge status={request.status || "new"} />
              </div>

              <div className="mt-8 rounded-3xl bg-slate-50 p-6">
                <h2 className="text-2xl font-black">Your message</h2>

                <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-5 leading-7 text-slate-700">
                  {request.message || "No message body."}
                </p>
              </div>

              <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <h2 className="text-2xl font-black text-emerald-950">
                  Admin reply
                </h2>

                {request.admin_reply ? (
                  <>
                    <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white p-5 leading-7 text-slate-700">
                      {request.admin_reply}
                    </p>

                    <p className="mt-4 text-sm font-bold text-emerald-800">
                      Replied at:{" "}
                      {request.handled_at
                        ? new Date(request.handled_at).toLocaleString()
                        : "Not available"}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 rounded-2xl bg-white p-5 font-bold text-slate-600">
                    Admin has not replied yet. You will receive a notification
                    when there is an update.
                  </p>
                )}
              </div>

              <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
                <h2 className="text-xl font-black">Need to send another request?</h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  You can send a new complaint, misleading report, or support
                  request from the contact page.
                </p>

                <Link
                  href="/contact"
                  className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 font-black text-slate-950 hover:bg-slate-100"
                >
                  Contact Admin
                </Link>
              </div>
            </>
          )}
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
      className={`rounded-full px-4 py-2 text-sm font-black capitalize ring-1 ${className}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}