"use client";

import Header from "@/components/Header";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  country: string | null;
  message_type: string;
  subject: string | null;
  message: string;
  status: string | null;
  admin_note: string | null;
  created_at: string;
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statusMessage, setStatusMessage] = useState("Loading contact messages...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadMessages() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatusMessage("Please login first.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        setStatusMessage("You are not an admin.");
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("contact_messages")
        .select(
          "id, name, email, country, message_type, subject, message, status, admin_note, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      setMessages((data || []) as ContactMessage[]);
      setStatusMessage("");
    }

    loadMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    if (statusFilter === "all") {
      return messages;
    }

    return messages.filter((message) => message.status === statusFilter);
  }, [messages, statusFilter]);

  async function updateMessageStatus(
    messageId: number,
    newStatus: "new" | "reviewing" | "resolved" | "dismissed"
  ) {
    setStatusMessage("Updating message...");

    const { error } = await supabase
      .from("contact_messages")
      .update({
        status: newStatus,
        admin_note: adminNotes[messageId] || null,
      })
      .eq("id", messageId);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              status: newStatus,
              admin_note: adminNotes[messageId] || null,
            }
          : message
      )
    );

    setStatusMessage(`Message marked as ${newStatus}.`);
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Contact Messages</h1>

            <p className="mt-4 rounded-2xl bg-slate-100 p-4 font-semibold text-slate-700">
              {statusMessage}
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Contact Messages</h1>

            <p className="mt-3 text-slate-600">
              Review enquiries, complaints, safety issues, and technical
              messages submitted from the contact page.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-emerald-700"
            >
              <option value="all">All messages</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="All" value={messages.length} />
          <StatCard
            label="New"
            value={messages.filter((item) => item.status === "new").length}
          />
          <StatCard
            label="Reviewing"
            value={messages.filter((item) => item.status === "reviewing").length}
          />
          <StatCard
            label="Resolved"
            value={messages.filter((item) => item.status === "resolved").length}
          />
        </div>

        {statusMessage && (
          <p className="mt-6 rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
            {statusMessage}
          </p>
        )}

        <div className="mt-8 grid gap-5">
          {filteredMessages.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {item.subject || item.message_type}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    From: {item.name} Â· {item.email}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Country: {item.country || "-"} Â· Type: {item.message_type} Â·{" "}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black capitalize">
                  {item.status || "new"}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5 leading-7 text-slate-700">
                {item.message}
              </div>

              {item.admin_note && (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-emerald-900">
                  <p className="font-black">Saved admin note</p>
                  <p className="mt-2 text-sm leading-6">{item.admin_note}</p>
                </div>
              )}

              <div className="mt-5">
                <label className="mb-2 block font-black">Admin note</label>

                <textarea
                  rows={3}
                  placeholder="Write internal note about this message..."
                  value={adminNotes[item.id] || ""}
                  onChange={(event) =>
                    setAdminNotes((current) => ({
                      ...current,
                      [item.id]: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateMessageStatus(item.id, "reviewing")}
                  className="rounded-2xl bg-sky-700 px-5 py-3 font-bold text-white hover:bg-sky-800"
                >
                  Mark Reviewing
                </button>

                <button
                  type="button"
                  onClick={() => updateMessageStatus(item.id, "resolved")}
                  className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  Mark Resolved
                </button>

                <button
                  type="button"
                  onClick={() => updateMessageStatus(item.id, "dismissed")}
                  className="rounded-2xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800"
                >
                  Dismiss
                </button>

                <a
                  href={`mailto:${item.email}?subject=Re: ${
                    item.subject || item.message_type
                  }`}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-bold hover:border-emerald-700"
                >
                  Reply by Email
                </a>
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              No contact messages found.
            </div>
          )}
        </div>
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
