"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PublicSellerReviewBox({
  sellerId,
}: {
  sellerId: string;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);
    setCurrentUserId(user.id);
    setBuyerEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_verified_seller")
      .eq("id", user.id)
      .maybeSingle();

    setIsVerifiedUser(Boolean(profile?.is_verified_seller));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      setMessage("Please login first to write a review.");
      return;
    }

    if (!isVerifiedUser) {
      setMessage("Only verified users can submit seller reviews.");
      return;
    }

    if (currentUserId === sellerId) {
      setMessage("You cannot review your own seller profile.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Please write a comment.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting review for admin approval...");

    const { error } = await supabase.from("seller_reviews").insert({
      seller_id: sellerId,
      buyer_id: currentUserId,
      buyer_email: buyerEmail || null,
      rating: Number(rating),
      comment: comment.trim(),
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setRating("5");
    setComment("");
    setMessage("Review submitted successfully. It will appear after admin approval.");
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-2xl font-black">Write a Seller Review</h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Reviews are accepted only from verified users and must be approved by
        admin before appearing publicly.
      </p>

      {!isLoggedIn ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <p className="font-bold text-slate-700">
            Please login to submit a review.
          </p>

          <Link
            href="/login"
            className="mt-4 inline-block rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
          >
            Login
          </Link>
        </div>
      ) : !isVerifiedUser ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-amber-900">
          <p className="font-black">Verification required</p>

          <p className="mt-2 text-sm leading-6">
            You must verify your account before writing seller reviews.
          </p>

          <Link
            href="/verify-seller"
            className="mt-4 inline-block rounded-2xl bg-amber-600 px-5 py-3 font-black text-white hover:bg-amber-700"
          >
            Verify Account
          </Link>
        </div>
      ) : currentUserId === sellerId ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5 font-bold text-slate-700">
          You cannot review your own seller profile.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block font-bold">Rating</label>

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
            >
              <option value="5">5 Stars — Excellent</option>
              <option value="4">4 Stars — Very Good</option>
              <option value="3">3 Stars — Good</option>
              <option value="2">2 Stars — Fair</option>
              <option value="1">1 Star — Poor</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-bold">Comment</label>

            <textarea
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write your experience with this seller."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Review for Approval"}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-5 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}