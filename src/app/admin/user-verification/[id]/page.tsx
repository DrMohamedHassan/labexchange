"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VerificationProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  organization: string | null;
  country: string | null;
  avatar_url: string | null;
  is_verified_seller: boolean | null;
  verification_status: string | null;
  verification_document_path: string | null;
  verification_note: string | null;
  verification_admin_feedback: string | null;
  verification_requested_at: string | null;
};

export default function AdminUserVerificationPage() {
  const params = useParams<{ id: string }>();
  const sellerId = params.id;

  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<VerificationProfile | null>(null);
  const [documentUrl, setDocumentUrl] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("Loading verification details...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAdminVerificationDetails();
  }, [sellerId]);

  async function loadAdminVerificationDetails() {
    try {
      setMessage("Loading verification details...");

      if (!sellerId) {
        setMessage("Missing seller ID.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please login as admin first.");
        setIsAdmin(false);
        return;
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        setMessage(adminError.message);
        setIsAdmin(false);
        return;
      }

      if (adminProfile?.role !== "admin") {
        setMessage("Admin access only.");
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, full_name, organization, country, avatar_url, is_verified_seller, verification_status, verification_document_path, verification_note, verification_admin_feedback, verification_requested_at"
        )
        .eq("id", sellerId)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data) {
        setMessage("User profile not found.");
        return;
      }

      const loadedProfile = data as VerificationProfile;

      setProfile(loadedProfile);
      setFeedback(loadedProfile.verification_admin_feedback || "");

      if (loadedProfile.verification_document_path) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from("verification-documents")
          .createSignedUrl(loadedProfile.verification_document_path, 60 * 30);

        if (!signedError && signedData?.signedUrl) {
          setDocumentUrl(signedData.signedUrl);
        } else {
          setDocumentUrl("");
        }
      } else {
        setDocumentUrl("");
      }

      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function updateVerificationStatus(
    status: "approved" | "rejected" | "pending" | "not_requested"
  ) {
    if (!profile) return;

    setIsSaving(true);
    setMessage("Updating verification status...");

    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        is_verified_seller: status === "approved",
        verification_admin_feedback: feedback.trim() || null,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage(error.message);
      setIsSaving(false);
      return;
    }

    setProfile({
      ...profile,
      verification_status: status,
      is_verified_seller: status === "approved",
      verification_admin_feedback: feedback.trim() || null,
    });

    setMessage(`Verification status updated to ${status}.`);
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/users/${sellerId}`}
          className="mb-6 inline-block font-bold text-emerald-700"
        >
          ← Back to seller public profile
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-4 inline-block rounded-full bg-purple-50 px-4 py-2 text-sm font-black text-purple-700">
            Admin only
          </p>

          <h1 className="text-4xl font-black">User Verification Details</h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            This page is visible only to admin. It includes private verification
            details such as email, ID document, user note, admin feedback, and
            approval decision.
          </p>

          {message && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>
          )}

          {!isAdmin ? null : profile ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="flex items-center gap-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl">
                      👤
                    </div>
                  )}

                  <div>
                    <h2 className="text-2xl font-black">
                      {profile.full_name || "No name"}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {profile.organization || "No organization"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {profile.country || "No country"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <Info label="Private Email" value={profile.email || "Not available"} />

                  <Info
                    label="Verification Status"
                    value={profile.verification_status || "not_requested"}
                  />

                  <Info
                    label="Verified User"
                    value={profile.is_verified_seller ? "Yes" : "No"}
                  />

                  <Info
                    label="Requested At"
                    value={
                      profile.verification_requested_at
                        ? new Date(profile.verification_requested_at).toLocaleString()
                        : "Not requested"
                    }
                  />

                  <Info
                    label="Private Document Path"
                    value={profile.verification_document_path || "No document"}
                  />
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-2xl font-black">ID / Verification Document</h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    This document is private. The signed link below is temporary
                    and available only for admin review.
                  </p>

                  {documentUrl ? (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-block rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800"
                    >
                      Open Private Document
                    </a>
                  ) : (
                    <p className="mt-5 rounded-2xl bg-white p-4 font-bold text-slate-600">
                      No private document is available, or signed URL could not
                      be generated.
                    </p>
                  )}
                </div>

                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-2xl font-black">User Verification Note</h2>

                  <p className="mt-4 rounded-2xl bg-white p-4 leading-7 text-slate-700">
                    {profile.verification_note || "No note provided."}
                  </p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-6">
                  <h2 className="text-2xl font-black">Admin Feedback</h2>

                  <textarea
                    rows={5}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Write admin feedback or reason for approval/rejection."
                    className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                  />

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => updateVerificationStatus("approved")}
                      className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800 disabled:bg-slate-400"
                    >
                      Approve & Verify
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => updateVerificationStatus("rejected")}
                      className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700 disabled:bg-slate-400"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => updateVerificationStatus("pending")}
                      className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 hover:border-amber-500 disabled:bg-slate-100"
                    >
                      Mark Pending
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 break-words font-black text-slate-900">{value}</p>
    </div>
  );
}