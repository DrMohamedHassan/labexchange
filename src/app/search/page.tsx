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

  const visibleListings = ((data || []) as PublicListing[]).filter((listing) => {
    if (listing.status === "approved") return true;

    if (listing.status === "sold" && listing.sold_expires_at) {
      return new Date(listing.sold_expires_at) > now;
    }

    return false;
  });

  const results = query
    ? rankListingsBySmartSearch(visibleListings, query)
    : visibleListings;

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

          <h1 className="text-4xl font-black md:text-5xl">
            Search Results
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Results for:{" "}
            <span className="font-black text-slate-950">
              {query || "All approved items"}
            </span>
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Search is case-insensitive and tries to find close matches even if
            there is a small spelling mistake.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {error ? (
          <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
            Database error: {error.message}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">
                  Matching products
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Found {results.length} related product
                  {results.length === 1 ? "" : "s"}.
                </p>
              </div>

              <Link
                href="/listings"
                className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white hover:bg-slate-800"
              >
                View all items
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {results.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  sellerId={listing.seller_id}
                  sellerPhone={listing.seller_phone}
                  title={listing.title || "Untitled item"}
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
          </>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black">No related products found</h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Try another keyword, category, city, country, brand, or shorter
              search word.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/listings"
                className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
              >
                Browse all items
              </Link>

              <Link
                href="/"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-black text-slate-800 hover:border-emerald-600"
              >
                Back home
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function rankListingsBySmartSearch(
  listings: PublicListing[],
  rawQuery: string
): PublicListing[] {
  const query = normalizeText(rawQuery);

  if (!query) return listings;

  const queryWords = getWords(query);

  const ranked = listings
    .map((listing) => {
      const searchableText = normalizeText(
        [
          listing.title,
          listing.category,
          listing.condition,
          listing.country,
          listing.city,
          listing.description,
          listing.brand,
        ]
          .filter(Boolean)
          .join(" ")
      );

      const searchableWords = getWords(searchableText);

      const score = getSearchScore(query, queryWords, searchableText, searchableWords);

      return {
        listing,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked.map((item) => item.listing);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(value: string) {
  return value
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

function getSearchScore(
  query: string,
  queryWords: string[],
  searchableText: string,
  searchableWords: string[]
) {
  let score = 0;

  if (searchableText === query) {
    score += 100;
  }

  if (searchableText.includes(query)) {
    score += 80;
  }

  for (const queryWord of queryWords) {
    if (queryWord.length <= 1) continue;

    for (const searchableWord of searchableWords) {
      if (searchableWord.includes(queryWord)) {
        score += 18;
        continue;
      }

      if (queryWord.includes(searchableWord) && searchableWord.length >= 4) {
        score += 10;
        continue;
      }

      const similarity = getSimilarity(queryWord, searchableWord);

      if (similarity >= 0.78) {
        score += 14;
      } else if (similarity >= 0.68 && queryWord.length >= 5) {
        score += 8;
      }
    }
  }

  const compactQuery = query.replace(/\s+/g, "");
  const compactText = searchableText.replace(/\s+/g, "");

  if (compactQuery.length >= 4 && compactText.includes(compactQuery)) {
    score += 25;
  }

  return score;
}

function getSimilarity(first: string, second: string) {
  if (!first || !second) return 0;
  if (first === second) return 1;

  const distance = levenshteinDistance(first, second);
  const maxLength = Math.max(first.length, second.length);

  return 1 - distance / maxLength;
}

function levenshteinDistance(first: string, second: string) {
  const matrix: number[][] = [];

  for (let i = 0; i <= second.length; i += 1) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= first.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= second.length; i += 1) {
    for (let j = 1; j <= first.length; j += 1) {
      if (second.charAt(i - 1) === first.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[second.length][first.length];
}