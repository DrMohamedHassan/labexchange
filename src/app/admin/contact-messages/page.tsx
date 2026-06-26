"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ContactMessage = {
  id: number;
  user_id: string | null;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  message_type: string | null;
  status: string | null;
  admin_reply: string | null;
  admin_note: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string | null;
  [key: string]: unknown;
};

const statusOptions = [
  "new",
  "under_review",
  "resolved",
  "rejected",
  "closed",
];

export default function AdminContactMessagesPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [adminReply, setAdminReply] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("new");
  const [pageMessage, setPageMessage] = useState("Loading contact messages...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setPageMessage("Loading contact messages...");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAdmin(false);
        setPageMessage("Please login as admin first.");
        return;
      }

      setAdminId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setPageMessage(profileError.message);
        setIsAdmin(false);
        return;
      }

      if (profile?.role !== "admin") {
        setPageMessage("Admin access only.");
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setPageMessage(error.message);
        return;
      }

      const loadedMessages = (data || []) as ContactMessage[];
      setMessages(loadedMessages);

      if (loadedMessages.length > 0 && !selectedMessage) {
        chooseMessage(loadedMessages[0]);
      }

      setPageMessage("");
    } catch (error) {
      setPageMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  function chooseMessage(message: ContactMessage) {
    setSelectedMessage(message);
    setAdminReply(message.admin_reply || "");
    setAdminNote(message.admin_note || "");
    setSelectedStatus(message.status || "new");
  }

  async function updateMessageStatus(newStatus: string) {
    if (!selectedMessage) return;

    setIsSaving(true);
    setPageMessage("Updating message...");

    const { error } = await supabase
      .from("contact_messages")
      .update({
        status: newStatus,
        admin_reply: adminReply.trim() || null,
        admin_note: adminNote.trim() || null,
        handled_by: adminId || null,
        handled_at: new Date().toISOString(),
      })
      .eq("id", selectedMessage.id);

    if (error) {
      setPageMessage(error.message);
      setIsSaving(false);
      return;
    }

    if (selectedMessage.user_id) {
      await supabase.rpc("create_user_notification", {
        target_user_id: selectedMessage.user_id,
        notification_type: "contact_status",
        notification_title: "Contact request updated",
        notification_message: `Your contact message status is now ${newStatus}.`,
        notification_href: "/notifications",
        notification_metadata: {
          contact_message_id: selectedMessage.id,
          status: newStatus,
        },
      });
    }

    setPageMessage("Message updated successfully.");
    setIsSaving(false);

    await reloadAfterUpdate(selectedMessage.id);
  }

  async function reloadAfterUpdate(messageId: number) {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    const updatedMessages = (data || []) as ContactMessage[];
    setMessages(updatedMessages);

    const updatedSelected =
      updatedMessages.find((item) => item.id === messageId) || null;

    if (updatedSelected) {
      chooseMessage(updatedSelected);
    }
  }

  const newCount = messages.filter((item) =>
    ["new", "open", "pending", "unread"].includes(item.status || "new")
  ).length;

  const underReviewCount = messages.filter(
    (item) => item.status === "under_review"
  ).length;

  const resolvedCount = messages.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/admin" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to admin dashboard
        </Link>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
                Admin only
              </p>

              <h1 className="text-4xl font-black">Contact Messages</h1>

              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                Read complaints, enquiries, misleading reports, and user help
                requests. You can mark the message as under review, resolved,
                rejected, or closed.
              </p>
            </div>

            <button
              type="button"
              onClick={loadMessages}
              className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              Refresh
            </button>
          </div>

          {pageMessage && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {pageMessage}
            </p>
          )}

          {isAdmin && (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <StatCard title="All messages" value={messages.length} />
                <StatCard title="New" value={newCount} />
                <StatCard title="Under review" value={underReviewCount} />
                <StatCard title="Resolved" value={resolvedCount} />
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <h2 className="px-2 text-xl font-black">Inbox</h2>

                  <div className="mt-4 max-h-[650px] overflow-y-auto pr-2">
                    {messages.length > 0 ? (
                      <div className="grid gap-3">
                        {messages.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => chooseMessage(item)}
                            className={
                              selectedMessage?.id === item.id
                                ? "rounded-2xl border border-emerald-400 bg-emerald-50 p-4 text-left"
                                : "rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-300"
                            }
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-slate-950">
                                  {item.subject ||
                                    item.message_type ||
                                    "Contact message"}
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-600">
                                  {item.name || "No name"} ·{" "}
                                  {item.email || "No email"}
                                </p>
                              </div>

                              <StatusBadge status={item.status || "new"} />
                            </div>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {item.message || "No message body."}
                            </p>

                            <p className="mt-3 text-xs font-bold text-slate-400">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString()
                                : "No date"}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-2xl bg-white p-5 font-bold text-slate-600">
                        No contact messages yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  {selectedMessage ? (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-black">
                            {selectedMessage.subject ||
                              selectedMessage.message_type ||
                              "Contact message"}
                          </h2>

                          <p className="mt-2 text-sm font-bold text-slate-500">
                            Message ID: {selectedMessage.id}
                          </p>
                        </div>

                        <StatusBadge
                          status={selectedMessage.status || "new"}
                        />
                      </div>

                      <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-2">
                        <InfoItem
                          label="Name"
                          value={selectedMessage.name || "Not provided"}
                        />

                        <InfoItem
                          label="Email"
                          value={selectedMessage.email || "Not provided"}
                        />

                        <InfoItem
                          label="Type"
                          value={
                            selectedMessage.message_type ||
                            selectedMessage.subject ||
                            "General"
                          }
                        />

                        <InfoItem
                          label="Created"
                          value={
                            selectedMessage.created_at
                              ? new Date(
                                  selectedMessage.created_at
                                ).toLocaleString()
                              : "Not available"
                          }
                        />

                        <InfoItem
                          label="User ID"
                          value={selectedMessage.user_id || "Anonymous / not logged in"}
                        />

                        <InfoItem
                          label="Handled At"
                          value={
                            selectedMessage.handled_at
                              ? new Date(
                                  selectedMessage.handled_at
                                ).toLocaleString()
                              : "Not handled yet"
                          }
                        />
                      </div>

                      <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                        <h3 className="font-black">User message</h3>

                        <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-white p-5 leading-7 text-slate-700">
                          {selectedMessage.message || "No message body."}
                        </p>
                      </div>

                      <div className="mt-6 rounded-3xl bg-indigo-50 p-5">
                        <h3 className="font-black text-indigo-950">
                          Admin reply / resolution
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-indigo-900">
                          This reply is saved inside the admin panel. If the user
                          was logged in when sending the complaint, they will
                          receive an in-app notification after you update the
                          status.
                        </p>

                        <textarea
                          rows={6}
                          value={adminReply}
                          onChange={(event) => setAdminReply(event.target.value)}
                          placeholder="Write the admin reply, action taken, or resolution."
                          className="mt-4 w-full rounded-2xl border border-indigo-200 bg-white px-4 py-3 outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="mt-6 rounded-3xl bg-amber-50 p-5">
                        <h3 className="font-black text-amber-950">
                          Internal admin note
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-amber-900">
                          Private note for admin team only.
                        </p>

                        <textarea
                          rows={4}
                          value={adminNote}
                          onChange={(event) => setAdminNote(event.target.value)}
                          placeholder="Write private admin note, investigation details, or follow-up reminders."
                          className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600"
                        />
                      </div>

                      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <label className="mb-2 block font-black">
                          Update status
                        </label>

                        <select
                          value={selectedStatus}
                          onChange={(event) =>
                            setSelectedStatus(event.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-700"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => updateMessageStatus(selectedStatus)}
                            className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {isSaving ? "Saving..." : "Save Reply & Status"}
                          </button>

                          {selectedMessage.email && (
                            <a
                              href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                                `Re: ${
                                  selectedMessage.subject ||
                                  selectedMessage.message_type ||
                                  "LabFinds Contact Message"
                                }`
                              )}&body=${encodeURIComponent(adminReply)}`}
                              className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-700 hover:border-indigo-500"
                            >
                              Reply by Email
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl bg-slate-50 p-8">
                      <h2 className="text-2xl font-black">
                        Select a message
                      </h2>

                      <p className="mt-3 text-slate-600">
                        Choose a contact message from the inbox to read and
                        reply.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-4xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>

      <p className="mt-1 break-words font-black text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status || "new";

  const className =
    normalizedStatus === "resolved" || normalizedStatus === "closed"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : normalizedStatus === "rejected"
      ? "bg-red-50 text-red-700 ring-red-200"
      : normalizedStatus === "under_review"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-indigo-50 text-indigo-700 ring-indigo-200";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ring-1 ${className}`}
    >
      {normalizedStatus.replace("_", " ")}
    </span>
  );
}