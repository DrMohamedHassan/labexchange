import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import CountryGate from "@/components/CountryGate";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const categories = [
  "PCR Reagents",
  "qPCR Reagents",
  "Primers & Probes",
  "DNA/RNA Extraction",
  "Electrophoresis Consumables",
  "Cloning & Transformation",
  "Sequencing & NGS",
  "Cell Culture & Tissue Engineering",
  "Immunology & Protein Analysis",
  "Plasticware",
  "Standards & Controls",
  "Agricultural Biotechnology",
  "Equipment",
  "Others",
];

type PublicListing = {
  id: number;
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

export default async function Home() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, category, condition, country, city, price, price_currency, image_url, product_image_url, status, sold_expires_at"
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
      <CountryGate />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-16">
          <div>
            <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
              Global InterLab Hub Beta
            </p>

            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Buy and sell{" "}
              <span className="text-emerald-700">lab supplies</span>
              <br />
              by country.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              Select your country market, browse approved listings, sell surplus
              lab products, and contact sellers safely through reviewed ads.
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

              <Link
                href="/contact"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-bold hover:border-emerald-600"
              >
                Contact Admin
              </Link>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-xl shadow-slate-200 md:min-h-[360px]">
            <Image
              src="/images/hero-lab.png"
              alt="InterLab Hub laboratory marketplace"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">Shop by Category</h2>

          <a href="#listings" className="font-bold text-emerald-700">
            View listings →
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="font-black">{category}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Browse approved listings related to {category}.
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
              <h3 className="text-2xl font-black">No approved listings yet</h3>

              <p className="mt-3 max-w-2xl text-slate-600">
                Once sellers add real listings and admin approves them, they will
                appear here.
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

      <section id="contact" className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
                Need help?
              </p>

              <h2 className="text-3xl font-black">Contact InterLab Hub Admin</h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                Send enquiries, complaints, seller issues, buyer issues, fraud
                concerns, country mistakes, or technical problems directly to
                admin.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800"
              >
                Open Contact Form
              </Link>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <h3 className="font-black">Best for:</h3>

              <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">
                <li>• Buyer or seller complaint</li>
                <li>• Wrong country listing</li>
                <li>• Fraud or safety concern</li>
                <li>• Technical website problem</li>
                <li>• Partnership or general enquiry</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-emerald-950 to-teal-800 p-8 text-white shadow-xl">
          <h2 className="text-2xl font-black">
            InterLab Hub is expanding country by country
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50">
            Buyers and sellers should select the correct country before
            browsing, selling, or contacting other users. Admin approval remains
            mandatory for safety.
          </p>
        </div>
      </section>
    </main>
  );
}