import Header from "@/components/Header";
import ListingsCountryView, {
  CountryListing,
} from "@/components/ListingsCountryView";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PublicListing = {
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

export default async function AllListingsPage() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, price, price_currency, image_url, product_image_url, status, sold_expires_at"
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
            Approved marketplace items
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Buy LabFinds Items
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Browse approved used and unused lab supplies. Results will be shown
            according to your selected country.
          </p>
        </div>
      </section>

      <ListingsCountryView
        listings={listings as CountryListing[]}
        errorMessage={error ? error.message : null}
      />
    </main>
  );
}