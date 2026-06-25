"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportListingBox({ listingId }: { listingId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("Misleading or inaccurate listing");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!details.trim() || details.trim().length < 10) {
      setMessage("Please write report details with at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting report...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please login first before submitting a report.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("listing_reports").insert({
      listing_id: listingId,
      reporter_id: user.id,
      reporter_email: user.email || null,
      reason,
      details: details.trim(),
      status: "new",
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    await supabase.from("notifications").insert({
      recipient_role: "admin",
      recipient_id: null,
      title: "New listing report submitted",
      message: `A user submitted a report for listing #${listingId}. Reason: ${reason}.`,
      link_url: "/admin/reports",
      is_read: false,
    });

    await supabase.from("notifications").insert({
      recipient_id: user.id,
      recipient_role: null,
      title: "Report submitted successfully",
      message:
        "Your report was submitted successfully and will be reviewed by the LabFinds admin team.",
      link_url: `/listings/${listingId}`,
      is_read: false,
    });

    setDetails("");
    setReason("Misleading or inaccurate listing");
    setMessage("Report submitted successfully.");
    setIsSubmitting(false);
  }

  return (
    <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="font-black text-red-700"
      >
        Report this listing
      </button>

      <p className="mt-2 text-sm leading-6 text-red-700">
        Use this if the product looks misleading, unsafe, incorrect, fake, or
        suspicious.
      </p>

      {isOpen && (
        <form onSubmit={submitReport} className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block font-black text-red-900">
              Report reason
            </label>

            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
            >
              <option>Misleading or inaccurate listing</option>
              <option>Wrong product information</option>
              <option>Unsafe or prohibited item</option>
              <option>Suspicious seller</option>
              <option>Wrong country or location</option>
              <option>Fake image or copied image</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-black text-red-900">
              Details
            </label>

            <textarea
              rows={5}
              placeholder="Write what is wrong with this listing..."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-red-700 px-5 py-3 font-black text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}