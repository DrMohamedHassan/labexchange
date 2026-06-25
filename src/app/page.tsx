import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import CountryGate from "@/components/CountryGate";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const categories = [
  {
    name: "PCR Reagents",
    image: "/images/category-pcr.png",
    description: "PCR mixes, enzymes, buffers, tubes, and related reagents.",
  },
  {
    name: "qPCR Reagents",
    image: "/images/category-reagents.PNG",
    description: "qPCR master mixes, probes, dyes, controls, and kits.",
  },
  {
    name: "Primers & Probes",
    image: "/images/category-primers.png",
    description: "Primers, probes, oligos, and molecular detection materials.",
  },
  {
    name: "DNA/RNA Extraction",
    image: "/images/category-extraction.png",
    description: "Extraction kits, columns, buffers, and purification supplies.",
  },
  {
    name: "Electrophoresis Consumables",
    image: "/images/category-electrophoresis.PNG",
    description: "Gels, ladders, buffers, loading dyes, and gel accessories.",
  },
  {
    name: "Cloning & Transformation",
    image: "/images/category-cloning.PNG",
    description: "Cloning kits, competent cells, vectors, and transformation items.",
  },
  {
    name: "Sequencing & NGS",
    image: "/images/category-sequencing.PNG",
    description: "Sequencing kits, NGS library materials, and related supplies.",
  },
  {
    name: "Cell Culture & Tissue Engineering",
    image: "/images/category-cell-culture.png",
    description: "Culture plates, media, flasks, supplements, and cell culture tools.",
  },
  {
    name: "Immunology & Protein Analysis",
    image: "/images/category-immunology.PNG",
    description: "Antibodies, ELISA materials, protein assays, and immunology tools.",
  },
  {
    name: "Plasticware",
    image: "/images/category-plasticware.png",
    description: "Tubes, tips, plates, bottles, and general lab plasticware.",
  },
  {
    name: "Standards & Controls",
    image: "/images/category-reagents.PNG",
    description: "Reference standards, controls, calibrators, and quality materials.",
  },
  {
    name: "Agricultural Biotechnology",
    image: "/images/category-agriculture.PNG",
    description: "Plant biotech, crop testing, agricultural molecular biology supplies.",
  },
  {
    name: "Equipment",
    image: "/images/category-equipment.PNG",
    description: "Reviewed lab devices, small equipment, and verified used instruments.",
  },
  {
    name: "Others",
    image: "/images/product-placeholder.png",
    description: "Other approved laboratory and research supplies.",
  },
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
              Global LabFinds Beta
            </p>

            <h1 className="max-w-xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Find, buy, and sell{" "}
              <span className="text-emerald-700">lab supplies</span>
              <br />
              by country.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              LabFinds helps labs, researchers, suppliers, and verified sellers
              list and discover reviewed lab supplies, reagents, consumables,
              equipment, and biotechnology products by country.
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
              alt="LabFinds laboratory supplies marketplace"
              fill
              priority
              className="object-cover"
            />
          </div>
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

          <a href="#listings" className="font-bold text-emerald-700">
            View listings →
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.name}
              href="#listings"
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
            >
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50 p-6">
                <div className="relative h-28 w-28 transition duration-300 group-hover:scale-110">
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
            </a>
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
                Once sellers add real LabFinds listings and admin approves them,
                they will appear here.
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

              <h2 className="text-3xl font-black">Contact LabFinds Admin</h2>

              <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                Send enquiries, complaints, seller issues, buyer issues, fraud
                concerns, country mistakes, or technical problems directly to
                the LabFinds admin team.
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
            LabFinds is expanding country by country
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