import Header from "@/components/Header";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ReviewsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  buyer_email: string | null;
  created_at: string;
};

export default async function SellerReviewsPage({ params }: ReviewsPageProps) {
  const { id } = await params;

  const { data: profile } = await supabase
    .from("public_profiles")
    .select("full_name, avatar_url, is_verified_seller")
    .eq("id", id)
    .maybeSingle();

  const { data: reviewsData } = await supabase
    .from("seller_reviews")
    .select("id, rating, comment, buyer_email, created_at")
    .eq("seller_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const reviews = (reviewsData || []) as Review[];

  return (
    <main className="min-h-screen bg-[#f6fafb] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <Link
            href={`/users/${id}`}
            className="mb-6 inline-block font-bold text-emerald-700"
          >
            ← Back to seller profile
          </Link>

          <div className="flex items-center gap-5">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || "Seller"}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-3xl">
                👤
              </div>
            )}

            <div>
              <h1 className="text-4xl font-black">
                Reviews for {profile?.full_name || "Seller"}
              </h1>

              {profile?.is_verified_seller && (
                <p className="mt-2 font-black text-emerald-700">
                  ✅ Verified User
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-5">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xl font-black text-amber-500">
                  {"★".repeat(review.rating)}
                  <span className="text-slate-300">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </p>

                <p className="mt-4 leading-8 text-slate-700">{review.comment}</p>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  Verified reviewer ·{" "}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black">No approved reviews yet</h2>

              <p className="mt-3 text-slate-600">
                Approved seller reviews will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}