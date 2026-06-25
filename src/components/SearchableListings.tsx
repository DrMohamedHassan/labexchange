"use client";

import { useMemo, useState } from "react";
import ListingCard from "@/components/ListingCard";

export type SearchableListing = {
  id: number;
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

export default function SearchableListings({
  listings,
  errorMessage,
}: {
  listings: SearchableListing[];
  errorMessage?: string | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return listings;
    }

    return listings.filter((listing) => {
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

      return searchableText.includes(normalizedSearch);
    });
  }, [listings, searchTerm]);

  return (
    <section id="listings" className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">Latest Listings</h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search by product name, category, city, country, brand, or keyword.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <label className="mb-2 block text-sm font-black text-slate-700">
            Search LabFinds
          </label>

          <div className="flex gap-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search qPCR, PCR, extraction, equipment, Cairo..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 font-semibold outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black text-slate-700 shadow-sm hover:border-emerald-600"
              >
                Clear
              </button>
            )}
          </div>

          {searchTerm && (
            <p className="mt-3 text-sm font-bold text-emerald-700">
              Showing {filteredListings.length} result
              {filteredListings.length === 1 ? "" : "s"} for “{searchTerm}”
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {errorMessage ? (
          <p className="rounded-2xl bg-red-50 p-5 font-bold text-red-700">
            Database error: {errorMessage}
          </p>
        ) : filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={listing.id}
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
          ))
        ) : searchTerm ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-2 lg:col-span-4">
            <h3 className="text-2xl font-black">No matching listings</h3>

            <p className="mt-3 max-w-2xl text-slate-600">
              No approved listings match “{searchTerm}”. Try another keyword
              like PCR, qPCR, extraction, primers, equipment, or your city.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-2 lg:col-span-4">
            <h3 className="text-2xl font-black">No approved listings yet</h3>

            <p className="mt-3 max-w-2xl text-slate-600">
              Once sellers add real LabFinds listings and admin approves them,
              they will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}