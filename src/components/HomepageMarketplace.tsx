"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ListingCard from "@/components/ListingCard";

export type HomepageListing = {
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

const categories = [
  {
    name: "Molecular Biology",
    image: "/images/category-molecular.png",
    description:
      "PCR, qPCR, extraction, primers, probes, cloning, sequencing, and molecular biology supplies.",
  },
  {
    name: "Chemicals & Reagents",
    image: "/images/category-chemicals.png",
    description:
      "Research reagents, buffers, standards, controls, and chemical-related lab products.",
  },
  {
    name: "Cell Culture & Cell Lines",
    image: "/images/category-cell-lines.png",
    description:
      "Cell culture media, supplements, flasks, plates, cell lines, and tissue culture supplies.",
  },
  {
    name: "Lab Supplies & Equipment",
    image: "/images/category-equipment.png",
    description:
      "Plasticware, consumables, glassware, small lab equipment, and reviewed used instruments.",
  },
];

export default function HomepageMarketplace({
  listings,
  errorMessage,
}: {
  listings: HomepageListing[];
  errorMessage?: string | null;
}) {
  const router = useRouter();
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

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") || "").trim();

    if (!query) {
      router.push("/listings");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function openCategory(categoryName: string) {
    router.push(`/search?q=${encodeURIComponent(categoryName)}`);
  }

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

  const latestListings = countryListings.slice(0, 8);

  return (
    <>
      <section id="search" className="mx-auto max-w-7xl px-6 pt-12">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-black uppercase tracking-wide text-emerald-700">
                  Smart search
                </p>

                <h2 className="text-3xl font-black">Search LabFinds</h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Search by product name, category, city, country, brand, or
                  keyword. Results will match your selected country.
                </p>
              </div>

              <div className="w-full max-w-2xl">
                <label className="mb-2 block text-sm font-black text-slate-700">
                  Keyword search
                </label>

                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    name="q"
                    type="search"
                    placeholder="Search PCR, qPCR, cell culture, reagents, equipment..."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 font-semibold outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-50"
                  />

                  <button
                    type="submit"
                    className="rounded-2xl bg-emerald-700 px-8 py-4 font-black text-white hover:bg-emerald-800"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>

          {selectedCountry && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-800">
                Showing products for: {selectedCountry}
              </p>

              <button
                type="button"
                onClick={changeCountry}
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm hover:bg-emerald-100"
              >
                Change country
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-emerald-700">
              Explore categories
            </p>

            <h2 className="text-3xl font-black">Shop by Category</h2>
          </div>

          <Link
            href="/listings"
            className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white hover:bg-slate-800"
          >
            Buy Items →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => openCategory(category.name)}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
            >
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50 p-6">
                <div className="relative h-32 w-32 transition duration-300 group-hover:scale-110">
                  <Image
                    src={category.image}
                    alt={`${category.name} category icon`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-black leading-6 text-slate-950">
                  {category.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <p className="mt-5 text-sm font-black text-emerald-700">
                  Browse {category.name} →
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Latest Listings</h2>

            <p className="mt-2 text-sm text-slate-600">
              {selectedCountry
                ? `Latest approved listings in ${selectedCountry}.`
                : "Latest approved LabFinds listings."}
            </p>
          </div>

          <Link href="/listings" className="font-bold text-emerald-700">
            Buy all items →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {errorMessage ? (
            <p className="rounded-2xl bg-red-50 p-5 font-bold text-red-700">
              Database error: {errorMessage}
            </p>
          ) : latestListings.length > 0 ? (
            latestListings.map((listing) => (
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
            ))
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-2 lg:col-span-4">
              <h3 className="text-2xl font-black">
                No approved listings found
              </h3>

              <p className="mt-3 max-w-2xl text-slate-600">
                {selectedCountry
                  ? `There are no approved products in ${selectedCountry} yet. Change country or check again later.`
                  : "Once sellers add real LabFinds listings and admin approves them, they will appear here."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
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