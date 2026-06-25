import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type SearchListing = {
  id: number;
  seller_id: string | null;
  seller_phone: string | null;
  title: string | null;
  category: string | null;
  condition: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  brand: string | null;
  price: number | string | null;
  price_currency: string | null;
  image_url: string | null;
  product_image_url: string | null;
  status: string | null;
  sold_expires_at: string | null;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q || "").trim();
  const normalizedQuery = query.toLowerCase();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, description, brand, price, price_currency, image_url, product_image_url, status, sold_expires_at"
    )
    .in("status", ["approved", "sold"])
    .order("created_at", { ascending: false });

  const now = new Date();

  const allListings = ((data || []) as SearchListing[]).filter((listing) => {
    if (listing.status === "approved") return true;

    if (listing.status === "sold" && listing.sold_expires_at) {
      return new Date(listing.sold_expires_at) > now;
    }

    return false;
  });

  const matchedListings = normalizedQuery
    ? allListings.filter((listing) => {
        const searchableText = [
          listing.title,
          listing.category,
          listing.condition,
          listing.country,
          listing.city,
          listing.description,
          listing.brand,
          listing.price_currency,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
    : allListings;

  return (
    <main className="min-h-screen bg-[#f6fafb] text-slate-950">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
            ← Back to homepage
          </Link>

          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Search results
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            {query ? `Results for “${query}”` : "Search LabFinds"}
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Find approved listings by product title, category, country, city,
            brand, condition, or keyword.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <form action="/search" className="rounded-3xl bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Search keyword
          </label>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search qPCR, PCR, extraction, equipment, Cairo..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 font-semibold outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
            />

            <button
              type="submit"
              className="rounded-2xl bg-emerald-700 px-8 py-4 font-black text-white hover:bg-emerald-800"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {query ? "Related listings" : "All listings"}
            </h2>

            <p className="mt-2 text-sm font-bold text-slate-600">
              {matchedListings.length} result
              {matchedListings.length === 1 ? "" : "s"} found
            </p>
          </div>

          <Link
            href="/listings"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-black text-slate-800 shadow-sm hover:border-emerald-600"
          >
            Browse all listings
          </Link>
        </div>

        {error ? (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            Database error: {error.message}
          </div>
        ) : matchedListings.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {matchedListings.map((listing) => (
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
            <h3 className="text-2xl font-black">No found result</h3>

            <p className="mt-3 max-w-2xl text-slate-600">
              No approved LabFinds listings match “{query}”. Try another keyword
              like PCR, qPCR, extraction, primers, equipment, Egypt, Cairo, or
              your city.
            </p>

            <Link
              href="/listings"
              className="mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              Browse all listings
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}