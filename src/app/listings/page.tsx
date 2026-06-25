import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
  sold_expires_at: string | null;
};

export default async function AllListingsPage() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, price, price_currency, image_url, product_image_url, status, sold_expires_at"
    )
    .in("status", ["approved", "sold"])
    .order("created_at", { ascending: false });

  const now = new Date();

  const listings = ((data || []) as PublicListing[]).filter((listing) => {
    if (listing.status === "approved") return true;

    if (listing.status === "sold" && listing.sold_expires_at) {
      return new Date(listing.sold_expires_at) > now;
    }

    return false;
  });

  return (
    <main className="min-h-screen bg-[#f6fafb] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
            ← Back to homepage
          </Link>

          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Approved marketplace listings
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Browse all LabFinds listings
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            This page shows all approved listings available on LabFinds.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">All approved listings</h2>

            <p className="mt-2 text-sm text-slate-600">
              Total listings: {listings.length}
            </p>
          </div>

          <Link
            href="/add-listing"
            className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
          >
            + Add Listing
          </Link>
        </div>

        {error ? (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            Database error: {error.message}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
            <h3 className="text-2xl font-black">No approved listings yet</h3>

            <p className="mt-3 text-slate-600">
              Once admin approves seller listings, they will appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}