"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ListingCard from "@/components/ListingCard";

export type CountryListing = {
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

export default function ListingsCountryView({
  listings,
  errorMessage,
}: {
  listings: CountryListing[];
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

  const filteredListings = useMemo(() => {
    if (!selectedCountry) {
      return listings;
    }

    return listings.filter((listing) =>
      isSameCountry(listing.country, selectedCountry)
    );
  }, [listings, selectedCountry]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">
            {selectedCountry
              ? `Approved items in ${selectedCountry}`
              : "All approved items"}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Total items: {filteredListings.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedCountry && (
            <button
              type="button"
              onClick={changeCountry}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-black text-slate-700 hover:border-emerald-600"
            >
              Change country
            </button>
          )}

          <Link
            href="/add-listing"
            className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
          >
            + Sell Your Item
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl bg-red-50 p-6 font-bold text-red-700">
          Database error: {errorMessage}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {filteredListings.map((listing) => (
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
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-black">No approved items found</h3>

          <p className="mt-3 text-slate-600">
            {selectedCountry
              ? `There are no approved products in ${selectedCountry} yet.`
              : "Once admin approves seller listings, they will appear here."}
          </p>
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