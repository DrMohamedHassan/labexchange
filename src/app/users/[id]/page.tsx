import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SellerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type PublicProfile = {
  id: string;
  full_name: string | null;
  organization: string | null;
  country: string | null;
  avatar_url: string | null;
  is_verified_seller: boolean | null;
  verification_status: string | null;
};

type PublicListing = {
  id: number;
  seller_id: string | null;
  seller_phone: string | null;
  title: string | null;
  category: string | null;
  condition: string | null;
  country: string | null;
  city: string | null;
  price: number | string | null;
  price_currency: string | null;
  image_url: string | null;
  product_image_url: string | null;
  status: string | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export default async function PublicSellerPage({ params }: SellerPageProps) {
  const { id } = await params;

  const { data: profile } = await supabase
    .from("public_profiles")
    .select(
      "id, full_name, organization, country, avatar_url, is_verified_seller, verification_status"
    )
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    return <SellerNotFound />;
  }

  const sellerProfile = profile as PublicProfile;

  const { data: listingsData } = await supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, price, price_currency, image_url, product_image_url, status"
    )
    .eq("seller_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const listings = (listingsData || []) as PublicListing[];

  const { data: reviewsData, count: reviewsCount } = await supabase
    .from("seller_reviews")
    .select("id, rating, comment, created_at", {
      count: "exact",
    })
    .eq("seller_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  const reviews = (reviewsData || []) as Review[];

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return (
    <main className="min-h-screen bg-[#f6fafb] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link href="/listings" className="mb-6 inline-block font-bold text-emerald-700">
            ← Back to listings
          </Link>

          <div className="grid gap-8 rounded-[2rem] bg-slate-50 p-8 md:grid-cols-[140px_1fr] md:items-center">
            {sellerProfile.avatar_url ? (
              <img
                src={sellerProfile.avatar_url}
                alt={sellerProfile.full_name || "Seller"}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 text-5xl ring-4 ring-white">
                👤
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black">
                  {sellerProfile.full_name || "LabFinds Seller"}
                </h1>

                {sellerProfile.is_verified_seller ? (
                  <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">
                    ✅ Verified User
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-600 ring-1 ring-slate-200">
                    Not verified
                  </span>
                )}
              </div>

              <p className="mt-3 text-lg leading-8 text-slate-600">
                {sellerProfile.organization || "Organization not provided"}
              </p>

              <p className="mt-1 font-bold text-slate-500">
                {sellerProfile.country || "Country not provided"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-2xl bg-white px-5 py-3 font-black shadow-sm">
                  Listings: {listings.length}
                </span>

                <span className="rounded-2xl bg-white px-5 py-3 font-black shadow-sm">
                  Reviews: {reviewsCount || 0}
                </span>

                <span className="rounded-2xl bg-white px-5 py-3 font-black shadow-sm">
                  Rating:{" "}
                  {averageRating ? `${averageRating.toFixed(1)} ★` : "No rating yet"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="mb-5 text-3xl font-black">Published Listings</h2>

          {listings.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  sellerId={listing.seller_id}
                  sellerPhone={listing.seller_phone}
                  title={listing.title || "Untitled listing"}
                  category={`${listing.category || "General"} · ${
                    listing.country || "Country not set"
                  }`}
                  condition={listing.condition || "Condition not provided"}
                  city={listing.city || "City not provided"}
                  price={listing.price}
                  priceCurrency={listing.price_currency}
                  imageUrl={listing.product_image_url || listing.image_url}
                  status={listing.status || "approved"}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-black">No published listings</h3>

              <p className="mt-3 text-slate-600">
                This seller has no approved public listings yet.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">Seller Reviews</h2>

            {(reviewsCount || 0) > 3 && (
              <Link
                href={`/users/${id}/reviews`}
                className="font-black text-emerald-700"
              >
                See more →
              </Link>
            )}
          </div>

          <div className="mt-5 grid gap-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-lg font-black text-amber-500">
                    {"★".repeat(review.rating)}
                    <span className="text-slate-300">
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </p>

                  <p className="mt-2 leading-7 text-slate-700">
                    {review.comment}
                  </p>

                  <p className="mt-3 text-xs font-bold text-slate-500">
                    Verified reviewer ·{" "}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No approved reviews yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SellerNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Seller profile not found</h1>

          <p className="mt-3 text-slate-600">
            This seller profile may not exist, or this user profile row is not
            created yet.
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block font-bold text-emerald-700"
          >
            ← Back to listings
          </Link>
        </div>
      </div>
    </main>
  );
}