"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VerificationUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  is_verified_seller: boolean | null;
  verification_status: string | null;
  verification_document_path: string | null;
  verification_note: string | null;
  verification_admin_feedback: string | null;
  verification_requested_at: string | null;
};

type VerificationUserWithUrl = VerificationUser & {
  signedUrl: string | null;
};

export default function AdminVerificationsPage() {
  const [users, setUsers] = useState<VerificationUserWithUrl[]>([]);
  const [message, setMessage] = useState("Loading verification requests...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function loadVerifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        setMessage("You are not an admin.");
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, city, is_verified_seller, verification_status, verification_document_path, verification_note, verification_admin_feedback, verification_requested_at"
        )
        .in("verification_status", ["pending", "approved", "rejected"])
        .order("verification_requested_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      const usersWithUrls: VerificationUserWithUrl[] = [];

      for (const item of (data || []) as VerificationUser[]) {
        let signedUrl: string | null = null;

        if (item.verification_document_path) {
          const { data: signedData } = await supabase.storage
            .from("verification-documents")
            .createSignedUrl(item.verification_document_path, 60 * 10);

          signedUrl = signedData?.signedUrl || null;
        }

        usersWithUrls.push({
          ...item,
          signedUrl,
        });
      }

      setUsers(usersWithUrls);
      setMessage("");
    }

    loadVerifications();
  }, []);

  async function updateVerificationStatus(
    userId: string,
    newStatus: "approved" | "rejected"
  ) {
    setMessage("Updating verification...");

    const feedback = feedbackDrafts[userId] || "";

    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: newStatus,
        is_verified_seller: newStatus === "approved",
        verification_admin_feedback: feedback || null,
      })
      .eq("id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              verification_status: newStatus,
              is_verified_seller: newStatus === "approved",
              verification_admin_feedback: feedback || null,
            }
          : user
      )
    );

    setMessage(`Verification marked as ${newStatus}.`);
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Seller Verifications</h1>

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
        <h1 className="text-4xl font-black">Seller ID Verifications</h1>

        <p className="mt-3 text-slate-600">
          Review private seller ID documents and approve or reject seller
          verification.
        </p>

        <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          ID documents are private. Do not share, download, or publish them
          outside admin review.
        </div>

        {message && (
          <p className="mt-6 rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-5">
          {users.map((user) => (
            <div key={user.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    {user.full_name || "Unnamed user"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email || "-"} Â· {user.phone || "-"} Â·{" "}
                    {user.city || "-"}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black capitalize">
                  {user.is_verified_seller
                    ? "verified seller"
                    : user.verification_status || "not requested"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoItem
                  label="Requested at"
                  value={
                    user.verification_requested_at
                      ? new Date(user.verification_requested_at).toLocaleString()
                      : "-"
                  }
                />

                <InfoItem
                  label="Admin feedback"
                  value={user.verification_admin_feedback || "-"}
                />
              </div>

              {user.verification_note && (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-500">
                    Seller note
                  </p>

                  <p className="mt-2 leading-7 text-slate-800">
                    {user.verification_note}
                  </p>
                </div>
              )}

              {user.signedUrl ? (
                <a
                  href={user.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block rounded-2xl border border-slate-200 px-5 py-3 font-bold hover:border-emerald-600"
                >
                  Open Private ID Document
                </a>
              ) : (
                <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
                  No document link available.
                </p>
              )}

              <div className="mt-5">
                <label className="mb-2 block font-black">
                  Admin feedback optional
                </label>

                <textarea
                  rows={3}
                  placeholder="Example: Please upload a clearer ID document."
                  value={feedbackDrafts[user.id] || ""}
                  onChange={(event) =>
                    setFeedbackDrafts((current) => ({
                      ...current,
                      [user.id]: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateVerificationStatus(user.id, "approved")}
                  className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  Approve Verification
                </button>

                <button
                  type="button"
                  onClick={() => updateVerificationStatus(user.id, "rejected")}
                  className="rounded-2xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800"
                >
                  Reject Verification
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && !message && (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              No verification requests yet.
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
