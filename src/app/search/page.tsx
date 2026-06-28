import Header from "@/components/Header";
import SearchResultsCountryView, {
  SearchListing,
} from "@/components/SearchResultsCountryView";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
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
  const params = await searchParams;
  const query = String(params.q || "").trim();

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, description, brand, price, price_currency, image_url, product_image_url, status, sold_expires_at"
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
            Smart search
          </p>

          <h1 className="text-4xl font-black md:text-5xl">Search Results</h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Results for:{" "}
            <span className="font-black text-slate-950">
              {query || "All approved items"}
            </span>
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Search is case-insensitive and tries to find close matches. Results
            are filtered by the user selected country.
          </p>
        </div>
      </section>

      <SearchResultsCountryView
        query={query}
        listings={listings as SearchListing[]}
        errorMessage={error ? error.message : null}
      />
    </main>
  );
}