"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ListingCard from "@/components/ListingCard";

export type SearchListing = {
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

export default function SearchResultsCountryView({
  query,
  listings,
  errorMessage,
}: {
  query: string;
  listings: SearchListing[];
  errorMessage?: string | null;
}) {
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    function syncSelectedCountry() {
      const savedCountry = localStorage.getItem("labfinds_country") || "";

      if (
        savedCountry &&
        savedCountry.toLowerCase() !== "all countries" &&
        savedCountry.toLowerCase() !== "all"
      ) {
        setSelectedCountry(savedCountry);
      } else {
        setSelectedCountry("");
      }
    }

    syncSelectedCountry();

    window.addEventListener("storage", syncSelectedCountry);
    window.addEventListener("focus", syncSelectedCountry);

    const interval = window.setInterval(syncSelectedCountry, 1000);

    return () => {
      window.removeEventListener("storage", syncSelectedCountry);
      window.removeEventListener("focus", syncSelectedCountry);
      window.clearInterval(interval);
    };
  }, []);

  function changeCountry() {
    localStorage.removeItem("labfinds_country");
    setSelectedCountry("");
    window.location.reload();
  }

  const countryListings = useMemo(() => {
    if (!selectedCountry) {
      return listings;
    }

    return listings.filter((listing) =>
      isSameCountry(listing.country, selectedCountry)
    );
  }, [listings, selectedCountry]);

  const results = useMemo(() => {
    if (!query) {
      return countryListings;
    }

    return rankListingsBySmartSearch(countryListings, query);
  }, [countryListings, query]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {selectedCountry && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-emerald-50 p-5">
          <p className="font-black text-emerald-800">
            Showing search results in: {selectedCountry}
          </p>

          <button
            type="button"
            onClick={changeCountry}
            className="rounded-2xl bg-white px-5 py-3 font-black text-emerald-700 shadow-sm hover:bg-emerald-100"
          >
            Change country
          </button>
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
          Database error: {errorMessage}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Matching products</h2>

              <p className="mt-2 text-sm text-slate-600">
                Found {results.length} related product
                {results.length === 1 ? "" : "s"}
                {selectedCountry ? ` in ${selectedCountry}` : ""}.
              </p>
            </div>

            <Link
              href="/listings"
              className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white hover:bg-slate-800"
            >
              View buy items
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
            {selectedCountry
              ? `No related products were found in ${selectedCountry}. Try another keyword or change country.`
              : "Try another keyword, category, city, country, brand, or shorter search word."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/listings"
              className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              Browse items
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
  );
}

function normalizeCountry(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isSameCountry(
  listingCountry: string | null | undefined,
  selectedCountry: string
) {
  return normalizeCountry(listingCountry) === normalizeCountry(selectedCountry);
}

function rankListingsBySmartSearch(
  listings: SearchListing[],
  rawQuery: string
): SearchListing[] {
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

      const score = getSearchScore(
        query,
        queryWords,
        searchableText,
        searchableWords
      );

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