"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportListingBox({ listingId }: { listingId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("Misleading advertisement");
  const [reporterEmail, setReporterEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message || message.trim().length < 10) {
      setStatusMessage("Please write a clear complaint message.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Submitting report...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("listing_reports").insert({
      listing_id: listingId,
      reporter_id: user?.id || null,
      reporter_email: reporterEmail || user?.email || null,
      reason,
      message,
      status: "new",
    });

    if (error) {
      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setReason("Misleading advertisement");
    setReporterEmail("");
    setMessage("");
    setStatusMessage(
      "Report submitted successfully. Admin will review it privately."
    );
    setIsSubmitting(false);
  }

  return (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left font-black text-red-800"
      >
        <span>⚠️ Report this ad / الإبلاغ عن إعلان أو تقديم شكوى</span>
        <span>{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="mt-5">
          <p className="text-sm leading-6 text-red-800">
            Use this form to report a misleading advertisement, fraud suspicion,
            prohibited item, or incorrect product information. Reports are
            visible to admin only.
          </p>

          <p className="mt-2 text-sm leading-6 text-red-800">
            استخدم هذا النموذج للإبلاغ عن إعلان مضلل، شبهة احتيال، منتج محظور،
            أو بيانات غير صحيحة. الشكوى تظهر للإدارة فقط.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <div>
              <label className="mb-2 block font-bold text-red-900">
                Complaint reason
              </label>

              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
              >
                <option>Misleading advertisement</option>
                <option>Fraud suspicion</option>
                <option>Prohibited or dangerous item</option>
                <option>Incorrect product information</option>
                <option>Fake image or fake proof</option>
                <option>Intellectual property concern</option>
                <option>Other complaint</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-bold text-red-900">
                Your email optional
              </label>

              <input
                type="email"
                placeholder="email@example.com"
                value={reporterEmail}
                onChange={(event) => setReporterEmail(event.target.value)}
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold text-red-900">
                Complaint message *
              </label>

              <textarea
                rows={5}
                placeholder="Write your complaint or explain why this advertisement may be misleading..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-red-700 px-6 py-3 font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Report to Admin"}
            </button>
          </form>

          {statusMessage && (
            <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-red-800">
              {statusMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}