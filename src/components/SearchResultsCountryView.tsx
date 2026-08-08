"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
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
  exactCategoryName = "",
  exactCategoryValues = [],
  errorMessage,
}: {
  query: string;
  listings: SearchListing[];
  exactCategoryName?: string;
  exactCategoryValues?: string[];
  errorMessage?: string | null;
}) {
  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState("");

  useEffect(() => {
    function syncSelectedCountry() {
      const savedCountry =
        localStorage.getItem(
          "labfinds_country"
        ) || "";

      const normalized =
        savedCountry
          .trim()
          .toLowerCase();

      if (
        savedCountry &&
        normalized !==
          "all countries" &&
        normalized !== "all"
      ) {
        setSelectedCountry(
          savedCountry
        );
      } else {
        setSelectedCountry("");
      }
    }

    syncSelectedCountry();

    window.addEventListener(
      "storage",
      syncSelectedCountry
    );

    window.addEventListener(
      "focus",
      syncSelectedCountry
    );

    const interval =
      window.setInterval(
        syncSelectedCountry,
        1000
      );

    return () => {
      window.removeEventListener(
        "storage",
        syncSelectedCountry
      );

      window.removeEventListener(
        "focus",
        syncSelectedCountry
      );

      window.clearInterval(interval);
    };
  }, []);

  function changeCountry() {
    localStorage.removeItem(
      "labfinds_country"
    );

    setSelectedCountry("");

    window.location.reload();
  }

  const isExactCategoryMode =
    exactCategoryValues.length > 0;

  const results = useMemo(() => {
    let filtered = listings;

    /*
     * COUNTRY FILTER
     */
    if (selectedCountry) {
      filtered = filtered.filter(
        (listing) =>
          normalize(
            listing.country
          ) ===
          normalize(
            selectedCountry
          )
      );
    }

    /*
     * EXACT CATEGORY FILTER
     *
     * Smart search is completely
     * disabled here.
     */
    if (isExactCategoryMode) {
      return filtered.filter(
        (listing) =>
          exactCategoryValues.some(
            (allowedCategory) =>
              normalize(
                listing.category
              ) ===
              normalize(
                allowedCategory
              )
          )
      );
    }

    /*
     * ORDINARY SMART SEARCH ONLY
     */
    const normalizedQuery =
      normalizeSearch(query);

    if (!normalizedQuery) {
      return filtered;
    }

    const queryWords =
      normalizedQuery
        .split(" ")
        .filter(
          (word) =>
            word.length > 1
        );

    return filtered
      .map((listing) => {
        const title =
          normalizeSearch(
            listing.title
          );

        const searchableText =
          normalizeSearch(
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

        let score = 0;

        if (
          title ===
          normalizedQuery
        ) {
          score += 100;
        }

        if (
          title.includes(
            normalizedQuery
          )
        ) {
          score += 60;
        }

        if (
          searchableText.includes(
            normalizedQuery
          )
        ) {
          score += 40;
        }

        for (
          const word
          of queryWords
        ) {
          if (
            searchableText.includes(
              word
            )
          ) {
            score += 10;
          }
        }

        return {
          listing,
          score,
        };
      })
      .filter(
        (item) =>
          item.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .map(
        (item) =>
          item.listing
      );
  }, [
    listings,
    selectedCountry,
    query,
    isExactCategoryMode,
    exactCategoryValues,
  ]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {selectedCountry && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-emerald-50 p-5">
          <p className="font-black text-emerald-800">
            Showing results in:{" "}
            {selectedCountry}
          </p>

          <button
            type="button"
            onClick={
              changeCountry
            }
            className="rounded-2xl bg-white px-5 py-3 font-black text-emerald-700 shadow-sm hover:bg-emerald-100"
          >
            Change country
          </button>
        </div>
      )}

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 font-bold text-red-700">
          Database error:{" "}
          {errorMessage}
        </div>
      ) : results.length >
        0 ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">
                {isExactCategoryMode
                  ? exactCategoryName
                  : "Matching products"}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Found{" "}
                {
                  results.length
                }{" "}
                product
                {results.length ===
                1
                  ? ""
                  : "s"}
                {selectedCountry
                  ? ` in ${selectedCountry}`
                  : ""}
                .
              </p>

              {isExactCategoryMode && (
                <p className="mt-2 text-sm font-bold text-emerald-700">
                  Exact category
                  filtering is active.
                  Products from other
                  categories are
                  excluded.
                </p>
              )}
            </div>

            <Link
              href="/listings"
              className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white hover:bg-slate-800"
            >
              View all buy items
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {results.map(
              (listing) => (
                <ListingCard
                  key={
                    listing.id
                  }
                  id={
                    listing.id
                  }
                  sellerId={
                    listing.seller_id
                  }
                  sellerPhone={
                    listing.seller_phone
                  }
                  title={
                    listing.title ||
                    "Untitled item"
                  }
                  category={`${
                    listing.category ||
                    "General"
                  } · ${
                    listing.country ||
                    "Country not set"
                  }`}
                  condition={
                    listing.condition ||
                    "Condition not provided"
                  }
                  city={
                    listing.city ||
                    "City not provided"
                  }
                  price={
                    listing.price
                  }
                  priceCurrency={
                    listing.price_currency
                  }
                  imageUrl={
                    listing.product_image_url ||
                    listing.image_url
                  }
                  status={
                    listing.status ||
                    "approved"
                  }
                />
              )
            )}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black">
            {isExactCategoryMode
              ? `No ${exactCategoryName} listings have been published yet.`
              : "No related products found"}
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {isExactCategoryMode
              ? selectedCountry
                ? `There are currently no approved ${exactCategoryName} products in ${selectedCountry}.`
                : `There are currently no approved products published in the ${exactCategoryName} category.`
              : selectedCountry
                ? `No products related to “${query}” were found in ${selectedCountry}.`
                : `No products related to “${query}” were found.`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/listings"
              className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
            >
              Browse all items
            </Link>

            <Link
              href="/#categories"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 font-black text-emerald-700 hover:bg-emerald-100"
            >
              Shop by Category
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function normalize(
  value:
    | string
    | null
    | undefined
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );
}

function normalizeSearch(
  value:
    | string
    | null
    | undefined
) {
  return String(
    value || ""
  )
    .toLowerCase()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9\u0600-\u06ff]+/gi,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}