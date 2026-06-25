"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VerificationProfile = {
  full_name: string | null;
  email: string | null;
  is_verified_seller: boolean | null;
  verification_status: string | null;
  verification_note: string | null;
  verification_admin_feedback: string | null;
};

export default function VerifySellerPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<VerificationProfile | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("Loading verification status...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first. Redirecting...");
        setIsLoading(false);

        setTimeout(() => {
          router.push("/login");
        }, 1000);

        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, email, is_verified_seller, verification_status, verification_note, verification_admin_feedback"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      setProfile(data as VerificationProfile);
      setNote(data?.verification_note || "");
      setMessage("");
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  function validateDocument(file: File | null) {
    if (!file) {
      return "Please upload your ID document.";
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, WEBP, or PDF.";
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return "File is too large. Maximum size is 5 MB.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("Submitting verification request...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please login first.");
      setIsSubmitting(false);
      router.push("/login");
      return;
    }

    const fileError = validateDocument(idFile);

    if (fileError) {
      setMessage(fileError);
      setIsSubmitting(false);
      return;
    }

    if (!accepted) {
      setMessage("Please confirm that the uploaded ID belongs to you.");
      setIsSubmitting(false);
      return;
    }

    try {
      const file = idFile as File;
      const fileExtension = file.name.split(".").pop() || "jpg";
      const safeFileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${user.id}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("verification-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          verification_status: "pending",
          verification_document_path: filePath,
          verification_note: note,
          verification_admin_feedback: null,
          verification_requested_at: new Date().toISOString(),
          is_verified_seller: false,
        })
        .eq("id", user.id);

      if (updateError) {
        setMessage(updateError.message);
        setIsSubmitting(false);
        return;
      }

      setMessage(
        "Verification request submitted successfully. Admin will review your ID document."
      );

      setProfile((current) =>
        current
          ? {
              ...current,
              verification_status: "pending",
              verification_note: note,
              verification_admin_feedback: null,
              is_verified_seller: false,
            }
          : current
      );

      setIsSubmitting(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Verification request failed. Please try again."
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <PageCard title="Loading..." text={message} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          â† Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">Seller ID Verification</h1>

          <p className="mt-3 leading-7 text-slate-600">
            This step is optional, but it increases buyer trust. Your ID document
            is private and will only be reviewed by the admin. It will not be
            shown publicly.
          </p>

          <p className="mt-3 leading-7 text-slate-600">
            Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ø®ØªÙŠØ§Ø±ÙŠØ©ØŒ Ù„ÙƒÙ†Ù‡Ø§ ØªØ²ÙŠØ¯ Ø«Ù‚Ø© Ø§Ù„Ù…Ø´ØªØ±ÙŠ. Ù…Ø³ØªÙ†Ø¯ Ø§Ù„Ù‡ÙˆÙŠØ© Ø®Ø§Øµ ÙˆÙ„Ù†
            ÙŠØ¸Ù‡Ø± Ù„Ù„Ø¹Ø§Ù…Ø©ØŒ ÙˆØ³ÙŠØªÙ… Ù…Ø±Ø§Ø¬Ø¹ØªÙ‡ Ù…Ù† Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙÙ‚Ø·.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="font-black">Current verification status</p>

            <p className="mt-2 capitalize text-slate-700">
              {profile?.is_verified_seller
                ? "Approved â€” Verified Seller"
                : profile?.verification_status || "Not requested"}
            </p>

            {profile?.verification_admin_feedback && (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-red-800">
                <p className="font-black">Admin feedback</p>
                <p className="mt-2">{profile.verification_admin_feedback}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <label className="mb-2 block font-black">
                Upload ID document
              </label>

              <p className="mb-3 text-sm leading-6 text-slate-600">
                Upload a clear ID, passport, company ID, or institutional proof.
                Allowed files: JPG, PNG, WEBP, or PDF. Maximum size: 5 MB.
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(event) => setIdFile(event.target.files?.[0] || null)}
                className="w-full rounded-xl bg-white p-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">
                Optional verification note
              </label>

              <textarea
                rows={4}
                placeholder="Example: I am a lab manager at..., or this is my company ID..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <label className="flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1"
              />

              <span>
                I confirm that the uploaded document belongs to me or my
                organization, and I understand that false information may lead to
                account restriction.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Verification Request"}
            </button>
          </form>

          {message && (
            <p className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function PageCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-4 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
