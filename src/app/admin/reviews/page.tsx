"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Review = {
  id: number;
  listing_id: number | null;
  seller_id: string | null;
  buyer_id: string | null;
  buyer_email: string | null;
  rating: number;
  comment: string;
  status: string | null;
  admin_note: string | null;
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("Loading reviews...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    async function loadReviews() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        setMessage("You are not an admin.");
        return;
      }

      setIsAdmin(true);

      const { data, error } = await supabase
        .from("seller_reviews")
        .select(
          "id, listing_id, seller_id, buyer_id, buyer_email, rating, comment, status, admin_note, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        return;
      }

      setReviews((data || []) as Review[]);
      setMessage("");
    }

    loadReviews();
  }, []);

  async function updateReview(reviewId: number, status: "approved" | "rejected") {
    setMessage("Updating review...");

    const { error } = await supabase
      .from("seller_reviews")
      .update({
        status,
        admin_note: adminNotes[reviewId] || null,
      })
      .eq("id", reviewId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status,
              admin_note: adminNotes[reviewId] || null,
            }
          : review
      )
    );

    setMessage(`Review marked as ${status}.`);
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Seller Reviews</h1>

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
        <h1 className="text-4xl font-black">Seller Reviews</h1>

        <p className="mt-3 text-slate-600">
          Approve or reject buyer reviews before they appear publicly.
        </p>

        {message && (
          <p className="mt-6 rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
            {message}
          </p>
        )}

        <div className="mt-8 grid gap-5">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">
                    Listing #{review.listing_id || "-"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Buyer: {review.buyer_email || "-"} ·{" "}
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black capitalize">
                  {review.status || "pending"}
                </span>
              </div>

              <p className="mt-5 text-2xl font-black text-amber-500">
                {"★".repeat(review.rating)}
                <span className="text-slate-300">
                  {"★".repeat(5 - review.rating)}
                </span>
              </p>

              <p className="mt-4 rounded-2xl bg-slate-50 p-5 leading-7 text-slate-700">
                {review.comment}
              </p>

              <textarea
                rows={3}
                placeholder="Admin note optional"
                value={adminNotes[review.id] || ""}
                onChange={(event) =>
                  setAdminNotes((current) => ({
                    ...current,
                    [review.id]: event.target.value,
                  }))
                }
                className="mt-5 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateReview(review.id, "approved")}
                  className="rounded-2xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  Approve Review
                </button>

                <button
                  type="button"
                  onClick={() => updateReview(review.id, "rejected")}
                  className="rounded-2xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800"
                >
                  Reject Review
                </button>
              </div>
            </div>
          ))}

          {reviews.length === 0 && !message && (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              No seller reviews yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}