"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VerifySellerPage() {
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [country, setCountry] = useState("");
  const [note, setNote] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading verification status...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first to request seller verification.");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "full_name, organization, country, verification_status, verification_note, verification_admin_feedback"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        return;
      }

      setFullName(profile?.full_name || "");
      setOrganization(profile?.organization || "");
      setCountry(profile?.country || "");
      setNote(profile?.verification_note || "");
      setCurrentStatus(profile?.verification_status || "not_requested");
      setAdminFeedback(profile?.verification_admin_feedback || null);
      setMessage("");
    }

    loadProfile();
  }, []);

  async function uploadDocument(userId: string, file: File) {
    const extension = file.name.split(".").pop();
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("verification-documents")
      .upload(path, file, {
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    return path;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim()) {
      setMessage("Please write your full name.");
      return;
    }

    if (!organization.trim()) {
      setMessage("Please write your organization, lab, company, or workplace.");
      return;
    }

    if (!country.trim()) {
      setMessage("Please write your country.");
      return;
    }

    if (!documentFile) {
      setMessage("Please upload an ID, company document, lab card, or proof document.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting verification request...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        setIsSubmitting(false);
        return;
      }

      const documentPath = await uploadDocument(user.id, documentFile);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          organization: organization.trim(),
          country: country.trim(),
          verification_document_path: documentPath,
          verification_note: note.trim() || null,
          verification_status: "pending",
          verification_requested_at: new Date().toISOString(),
          verification_admin_feedback: null,
        })
        .eq("id", user.id);

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setCurrentStatus("pending");
      setAdminFeedback(null);
      setDocumentFile(null);
      setMessage(
        "Your verification request was submitted successfully. Admin will review it soon."
      );
      setIsSubmitting(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Seller trust program
          </p>

          <h1 className="text-4xl font-black">Seller ID Verification</h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            This step is optional, but it increases buyer trust. Your document is
            private and will only be reviewed by the admin. It will not be shown
            publicly.
          </p>

          {currentStatus && (
            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
              <p className="font-black">
                Current verification status:{" "}
                <span className="capitalize text-emerald-700">
                  {currentStatus.replace("_", " ")}
                </span>
              </p>

              {adminFeedback && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Admin feedback: {adminFeedback}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <InputField
              label="Full Name *"
              value={fullName}
              onChange={setFullName}
              placeholder="Your full legal name"
            />

            <InputField
              label="Organization / Lab / Company *"
              value={organization}
              onChange={setOrganization}
              placeholder="Example: Cairo University Lab / ABC Diagnostics"
            />

            <InputField
              label="Country *"
              value={country}
              onChange={setCountry}
              placeholder="Example: Egypt"
            />

            <div>
              <label className="mb-2 block font-bold">
                Verification Document *
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
              />

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You can upload an ID, work ID, company registration, lab proof,
                or any document that helps admin verify your seller identity.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-bold">Additional Note</label>

              <textarea
                rows={5}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write any additional details for admin review."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Verification Request"}
            </button>
          </form>

          {message && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />
    </div>
  );
}