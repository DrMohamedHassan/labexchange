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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setIsVerifiedUser(false);
        setCurrentUserId("");
        setBuyerEmail("");
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setCurrentUserId(user.id);
      setBuyerEmail(user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_verified_seller")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setIsVerifiedUser(false);
        setIsLoading(false);
        return;
      }

      setIsVerifiedUser(Boolean(profile?.is_verified_seller));
      setIsLoading(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      setMessage("Please login first to write a review.");
      return;
    }

    if (!isVerifiedUser) {
      setMessage("Only verified LabFinds users can submit seller reviews.");
      return;
    }

    if (currentUserId === sellerId) {
      setMessage("You cannot review your own seller profile.");
      return;
    }

    if (!comment.trim()) {
      setMessage("Please write your review comment.");
      return;
    }

    if (comment.trim().length < 10) {
      setMessage("Please write a more useful review comment.");
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
    setMessage(
      "Review submitted successfully. It will appear on this seller profile after admin approval."
    );
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-2xl font-black">Write a Seller Review</h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Verified LabFinds users can rate sellers with stars and write a comment.
        Reviews are not published immediately; admin must approve them first.
      </p>

      {isLoading ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5 font-bold text-slate-600">
          Checking your account...
        </div>
      ) : !isLoggedIn ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <p className="font-bold text-slate-700">
            Please login to submit a seller review.
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
            You must verify your account before writing seller reviews. This
            helps reduce fake reviews and fraud.
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
              <option value="5">★★★★★ — Excellent</option>
              <option value="4">★★★★☆ — Very Good</option>
              <option value="3">★★★☆☆ — Good</option>
              <option value="2">★★☆☆☆ — Fair</option>
              <option value="1">★☆☆☆☆ — Poor</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-bold">Comment</label>

            <textarea
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write your experience with this seller. Example: communication, product accuracy, documents, storage, delivery, and overall trust."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Review for Admin Approval"}
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