"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SellerReviewBox({
  listingId,
  sellerId,
  isSold,
}: {
  listingId: number;
  sellerId: string;
  isSold: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [confirmedPurchase, setConfirmedPurchase] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSold) {
      setMessage("Reviews are allowed only after the product is marked as sold.");
      return;
    }

    if (!confirmedPurchase) {
      setMessage("Please confirm that you bought this product before reviewing.");
      return;
    }

    if (!comment || comment.trim().length < 10) {
      setMessage("Please write a clear review with at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting review...");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please login first before submitting a seller review.");
      setIsSubmitting(false);
      return;
    }

    if (user.id === sellerId) {
      setMessage("Sellers cannot review themselves.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("seller_reviews").insert({
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: user.id,
      buyer_email: user.email || null,
      rating,
      comment,
      status: "pending",
    });

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        setMessage("You already submitted a review for this listing.");
      } else {
        setMessage(error.message);
      }

      setIsSubmitting(false);
      return;
    }

    setRating(5);
    setComment("");
    setConfirmedPurchase(false);
    setMessage(
      "Review submitted successfully. It will appear after admin approval."
    );
    setIsSubmitting(false);
  }

  if (!isSold) {
    return (
      <div className="mt-8 rounded-3xl bg-slate-50 p-5">
        <h2 className="text-xl font-black">Seller Review</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Buyer reviews are available only after the seller marks the product as
          sold.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-xl font-black text-emerald-900">
        Review this seller after buying
      </h2>

      <p className="mt-2 text-sm leading-6 text-emerald-900">
        Submit your seller rating only if you actually bought this product. Your
        review will be checked by admin before it appears publicly.
      </p>

      <form onSubmit={submitReview} className="mt-5 grid gap-4">
        <div>
          <label className="mb-2 block font-black text-emerald-950">
            Seller rating
          </label>

          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={
                  star <= rating
                    ? "text-4xl text-amber-500"
                    : "text-4xl text-slate-300"
                }
                aria-label={`${star} star rating`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-black text-emerald-950">
            Your review
          </label>

          <textarea
            rows={5}
            placeholder="Write your honest experience after buying..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 outline-none focus:border-emerald-700"
          />
        </div>

        <label className="flex gap-3 text-sm leading-6 text-emerald-950">
          <input
            type="checkbox"
            checked={confirmedPurchase}
            onChange={(event) => setConfirmedPurchase(event.target.checked)}
            className="mt-1"
          />

          <span>
            I confirm that I bought this product and this review reflects my
            real experience.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {message && (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-emerald-900">
          {message}
        </p>
      )}
    </div>
  );
}