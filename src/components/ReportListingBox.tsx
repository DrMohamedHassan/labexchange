"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportListingBox({ listingId }: { listingId: number }) {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userId, setUserId] = useState("");

  const [reportType, setReportType] = useState("Misleading information");
  const [message, setMessage] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    setIsLoadingUser(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || "");
    setIsLoadingUser(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      setPageMessage("You must login before reporting a listing.");
      return;
    }

    if (!message.trim()) {
      setPageMessage("Please write report details.");
      return;
    }

    setIsSubmitting(true);
    setPageMessage("Submitting report...");

    const { error } = await supabase.from("listing_reports").insert({
      listing_id: listingId,
      user_id: userId,
      report_type: reportType,
      message: message.trim(),
      status: "pending",
    });

    if (error) {
      setPageMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setMessage("");
    setReportType("Misleading information");
    setPageMessage("Report submitted successfully. Admin will review it.");
    setIsSubmitting(false);
  }

  return (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-900">
      <h2 className="text-xl font-black">Report this listing</h2>

      <p className="mt-3 text-sm leading-6">
        Use this form if the product information is misleading, unsafe,
        suspicious, prohibited, expired, contaminated, or legally concerning.
      </p>

      {isLoadingUser ? (
        <p className="mt-5 rounded-2xl bg-white p-4 font-bold text-slate-600">
          Checking login...
        </p>
      ) : !userId ? (
        <div className="mt-5 rounded-2xl bg-white p-5">
          <p className="font-black text-red-900">Login required</p>

          <p className="mt-2 text-sm leading-6 text-red-800">
            You must create an account and login before reporting a listing.
            Anonymous reports are not accepted.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 hover:border-emerald-600"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block font-bold">Report type</label>

            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
            >
              <option>Misleading information</option>
              <option>Unsafe product</option>
              <option>Expired product</option>
              <option>Contaminated product</option>
              <option>Prohibited or regulated product</option>
              <option>Suspicious seller</option>
              <option>Wrong category or country</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-bold">Report details</label>

            <textarea
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explain why this listing should be reviewed."
              className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-red-600 px-6 py-3 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      )}

      {pageMessage && (
        <p className="mt-5 rounded-2xl bg-white p-4 font-bold text-red-800">
          {pageMessage}
        </p>
      )}
    </div>
  );
}