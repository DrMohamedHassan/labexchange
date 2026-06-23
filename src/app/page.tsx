import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const categories = [
  {
    name: "PCR Reagents",
    desc: "PCR master mixes, enzymes, buffers, and related reagents.",
    image: "/images/category-pcr.png",
  },
  {
    name: "qPCR Reagents",
    desc: "qPCR master mixes, probes, dyes, and detection reagents.",
    image: "/images/category-pcr.png",
  },
  {
    name: "Primers & Probes",
    desc: "Primers, probes, oligos, and custom molecular biology tools.",
    image: "/images/category-primers.png",
  },
  {
    name: "DNA/RNA Extraction",
    desc: "DNA, RNA, and nucleic acid extraction kits and consumables.",
    image: "/images/category-extraction.png",
  },
  {
    name: "Electrophoresis Consumables",
    desc: "Gels, ladders, stains, buffers, and electrophoresis supplies.",
    image: "/images/category-plasticware.png",
  },
  {
    name: "Cloning & Transformation",
    desc: "Cloning kits, competent cells, vectors, and transformation tools.",
    image: "/images/category-cell-culture.png",
  },
  {
    name: "Sequencing & NGS",
    desc: "Sequencing reagents, NGS kits, and related consumables.",
    image: "/images/category-pcr.png",
  },
  {
    name: "Cell Culture & Tissue Engineering",
    desc: "Media, sera, culture reagents, and tissue engineering supplies.",
    image: "/images/category-cell-culture.png",
  },
  {
    name: "Immunology & Protein Analysis",
    desc: "Antibodies, ELISA tools, protein reagents, and assay supplies.",
    image: "/images/category-antibodies.png",
  },
  {
    name: "Plasticware",
    desc: "Tips, tubes, plates, flasks, dishes, and lab plastic consumables.",
    image: "/images/category-plasticware.png",
  },
  {
    name: "Standards & Controls",
    desc: "Reference standards, controls, calibrators, and QC materials.",
    image: "/images/product-placeholder.png",
  },
  {
    name: "Agricultural Biotechnology",
    desc: "Agriculture, plant, crop, and biotechnology research supplies.",
    image: "/images/category-extraction.png",
  },
];

const trustItems = [
  {
    title: "Admin Reviewed Listings",
    desc: "Listings are reviewed before they appear publicly.",
    image: "/images/product-placeholder.png",
  },
  {
    title: "Clear Item Condition",
    desc: "Sellers must declare whether the item is new, unused, or used.",
    image: "/images/category-pcr.png",
  },
  {
    title: "Storage Declared",
    desc: "Sellers can add storage and handling information.",
    image: "/images/category-cell-culture.png",
  },
  {
    title: "Optional Seller Verification",
    desc: "Sellers can submit ID verification for more buyer trust.",
    image: "/images/seller-lab-supply.png",
  },
  {
    title: "Report & Safety Tools",
    desc: "Buyers can report misleading or unsafe advertisements.",
    image: "/images/category-plasticware.png",
  },
];

type PublicListing = {
  id: number;
  title: string | null;
  category: string | null;
  condition: string | null;
  city: string | null;
  price: number | string | null;
  image_url: string | null;
  product_image_url: string | null;
  status: string | null;
  sold_expires_at: string | null;
};

export default async function Home() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, category, condition, city, price, image_url, product_image_url, status, sold_expires_at"
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
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-16">
          <div>
            <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
              LabExchange Beta
            </p>

            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Buy verified{" "}
              <span className="text-emerald-700">lab supplies.</span>
              <br />
              Sell unused or used stock safely.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              A trusted marketplace for researchers, labs, and suppliers to buy
              and sell new, unused, and used lab products with clear condition,
              expiry, storage, seller details, and admin review.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/add-listing"
                className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800"
              >
                Sell Your Items
              </Link>

              <a
                href="#listings"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-bold hover:border-emerald-600"
              >
                Browse Listings
              </a>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl shadow-slate-200 md:min-h-[360px]">
            <Image
              src="/images/hero-lab.png"
              alt="Laboratory marketplace"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-10">
          <div className="rounded-3xl bg-white p-3 shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search by product name, brand, catalog number, category, city..."
                className="w-full rounded-2xl px-5 py-4 text-sm outline-none"
              />

              <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">
                ⌕
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold">Popular categories:</span>

            {[
              "PCR Reagents",
              "qPCR Reagents",
              "Primers & Probes",
              "DNA/RNA Extraction",
              "Plasticware",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 rounded-[2rem] bg-white p-5 shadow-sm md:grid-cols-2">
          <div className="overflow-hidden rounded-[1.6rem] bg-gradient-to-r from-emerald-50 to-white p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
              <div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-lg font-black text-white">
                  $
                </div>

                <h2 className="text-2xl font-black">
                  Have surplus
                  <br />
                  lab supplies?
                </h2>

                <p className="mt-4 text-slate-700">
                  List your new, unused, or used lab items and submit them for
                  admin review.
                </p>

                <Link
                  href="/add-listing"
                  className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  Sell Your Items →
                </Link>
              </div>

              <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                <Image
                  src="/images/seller-lab-supply.png"
                  alt="Seller lab supply"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.6rem] bg-gradient-to-r from-sky-50 to-white p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
              <div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sky-800 text-lg font-black text-white">
                  ✓
                </div>

                <h2 className="text-2xl font-black">
                  Looking for
                  <br />
                  quality supplies?
                </h2>

                <p className="mt-4 text-slate-700">
                  Browse approved listings with clear condition, seller details,
                  and safety guidance.
                </p>

                <a
                  href="#listings"
                  className="mt-6 inline-block rounded-xl bg-sky-800 px-5 py-3 font-bold text-white hover:bg-sky-900"
                >
                  Browse Listings →
                </a>
              </div>

              <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                <Image
                  src="/images/category-cell-culture.png"
                  alt="Buyer lab supplies"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-7xl px-6 py-5">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-center text-2xl font-black">
            Why researchers trust LabExchange
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {trustItems.map((item) => (
              <div key={item.title} className="text-center">
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-2xl bg-emerald-50 shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <h3 className="mt-4 font-black">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Shop by Category</h2>

          <a href="#listings" className="font-bold text-emerald-700">
            View listings →
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-2xl bg-emerald-50 shadow-sm">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="mt-4 font-black">{category.name}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {category.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Latest Listings</h2>

          <Link href="/add-listing" className="font-bold text-emerald-700">
            Add listing →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {error ? (
            <p className="text-red-600">Database error: {error.message}</p>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title || "Untitled listing"}
                category={listing.category || "General"}
                condition={listing.condition || "Condition not provided"}
                city={listing.city || "City not provided"}
                price={listing.price}
                imageUrl={listing.product_image_url || listing.image_url}
                status={listing.status || "approved"}
              />
            ))
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-2 lg:col-span-4">
              <h3 className="text-2xl font-black">
                No approved listings yet
              </h3>

              <p className="mt-3 max-w-2xl text-slate-600">
                LabExchange is ready for real sellers. Once a seller submits a
                real listing and admin approves it, it will appear here.
              </p>

              <Link
                href="/add-listing"
                className="mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800"
              >
                Add First Real Listing
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-950 to-teal-800 p-8 text-white shadow-xl">
          <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-xl font-black">
              LX
            </div>

            <div>
              <h2 className="text-2xl font-black">
                A safer way to reuse lab resources
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50">
                LabExchange helps labs reduce waste, reuse available supplies,
                and connect through a reviewed listing process.
              </p>
            </div>

            <Link
              href="/policies"
              className="rounded-2xl bg-white px-6 py-3 text-center font-bold text-emerald-900"
            >
              Read Policies
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}