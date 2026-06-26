import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import CountryGate from "@/components/CountryGate";
import HomepageMarketplace, {
  HomepageListing,
} from "@/components/HomepageMarketplace";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, seller_id, seller_phone, title, category, condition, country, city, description, brand, price, price_currency, image_url, product_image_url, status, sold_expires_at"
    )
    .in("status", ["approved", "sold"])
    .order("created_at", { ascending: false });

  const now = new Date();

  const listings = ((data || []) as HomepageListing[]).filter((listing) => {
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

            <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
              Buy and sell{" "}
              <span className="text-emerald-700">used and unused</span>
              <br />
              lab supplies with more confidence.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              LabFinds helps labs, researchers, suppliers, and verified sellers
              list and discover reviewed lab supplies, reagents, consumables,
              equipment, and biotechnology products through admin-reviewed
              listings, seller profiles, and buyer safety checks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/add-listing"
                className="rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800"
              >
                Sell Your Items
              </Link>

              <Link
                href="/listings"
                className="rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white hover:bg-slate-800"
              >
                Buy Items
              </Link>

              <Link
                href="/verify-seller"
                className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 font-black text-amber-700 hover:border-amber-500"
              >
                🛡️ Verify Seller
              </Link>

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

      <HomepageMarketplace
        listings={listings}
        errorMessage={error ? error.message : null}
      />

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
            LabFinds is built for safer lab-supply exchange
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50">
            Buyers and sellers should check product identity, storage, expiry,
            documents, and seller profile before completing any transaction.
            Admin approval remains mandatory for public listings.
          </p>
        </div>
      </section>
    </main>
  );
}