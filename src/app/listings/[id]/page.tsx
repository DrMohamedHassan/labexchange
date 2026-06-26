import BuyerContactBox from "@/components/BuyerContactBox";
import Header from "@/components/Header";
import ReportListingBox from "@/components/ReportListingBox";
import Link from "next/link";
import { formatPriceWithCurrency } from "@/lib/currencies";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ListingDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SellerProfile = {
  id: string;
  full_name: string | null;
  organization: string | null;
  country: string | null;
  avatar_url: string | null;
  is_verified_seller: boolean | null;
  verification_status: string | null;
};

export default async function ListingDetailsPage({
  params,
}: ListingDetailsPageProps) {
  const { id } = await params;
  const listingId = Number(id);

  if (Number.isNaN(listingId)) {
    return <ListingNotFound />;
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      "id, seller_id, title, brand, quantity, category, condition, country, city, price, price_currency, expiry_date, storage_condition, description, seller_name, seller_phone, status, image_url, product_image_url, product_figure_1_url, product_figure_2_url, product_figure_3_url, voucher_image_url, proof_image_url, used_verification_acknowledged, used_verification_notes"
    )
    .eq("id", listingId)
    .in("status", ["approved", "sold"])
    .maybeSingle();

  if (error || !listing) {
    return <ListingNotFound />;
  }

  let sellerProfile: SellerProfile | null = null;

  if (listing.seller_id) {
    const { data: profileData } = await supabase
      .from("public_profiles")
      .select(
        "id, full_name, organization, country, avatar_url, is_verified_seller, verification_status"
      )
      .eq("id", listing.seller_id)
      .maybeSingle();

    sellerProfile = profileData as SellerProfile | null;
  }

  const productImage =
    listing.product_image_url ||
    listing.image_url ||
    "/images/product-placeholder.png";

  const productFigures = [
    listing.product_figure_1_url,
    listing.product_figure_2_url,
    listing.product_figure_3_url,
  ].filter(Boolean) as string[];

  const cleanPhone = String(listing.seller_phone || "").replace(/\D/g, "");
  const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

  const isSold = listing.status === "sold";

  const isUsedProduct = String(listing.condition || "")
    .toLowerCase()
    .startsWith("used");

  const isVerifiedSeller = Boolean(sellerProfile?.is_verified_seller);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/listings"
          className="mb-6 inline-block font-bold text-emerald-700"
        >
          ← Back to items
        </Link>

        {isSold && (
          <div className="mb-6 rounded-3xl bg-red-50 p-5 text-red-800">
            <h2 className="text-xl font-black">This product has been sold</h2>

            <p className="mt-2 text-sm">
              This advertisement is shown temporarily for transparency.
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-[420px] bg-slate-100">
              <img
                src={productImage}
                alt={listing.title || "Listing image"}
                className="h-full w-full object-cover"
              />

              <span className="absolute left-5 top-5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                {listing.condition || "Condition not provided"}
              </span>

              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                  <span className="rounded-full bg-white px-6 py-3 text-lg font-black text-slate-950">
                    Sold
                  </span>
                </div>
              )}
            </div>

            {productFigures.length > 0 && (
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                {productFigures.map((figureUrl, index) => (
                  <a
                    key={figureUrl}
                    href={figureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-2xl bg-slate-100"
                  >
                    <img
                      src={figureUrl}
                      alt={`Product figure ${index + 1}`}
                      className="h-32 w-full object-cover transition hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-700">
                {listing.category || "General"} ·{" "}
                {listing.country || "Country not set"}
              </p>

              {isVerifiedSeller && (
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">
                  ✓ Verified Seller
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-black leading-tight">
              {listing.title || "Untitled listing"}
            </h1>

            <p className="mt-4 text-3xl font-black text-slate-950">
              {formatPriceWithCurrency(listing.price, listing.price_currency)}
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              {listing.description || "No description added."}
            </p>

            <div className="mt-8 grid gap-4 rounded-3xl bg-slate-50 p-6 md:grid-cols-2">
              <InfoItem label="Country" value={listing.country || "Not set"} />
              <InfoItem label="City" value={listing.city || "Not provided"} />
              <InfoItem label="Brand" value={listing.brand || "Not provided"} />
              <InfoItem
                label="Quantity"
                value={listing.quantity || "Not provided"}
              />
              <InfoItem
                label="Condition"
                value={listing.condition || "Not provided"}
              />
              <InfoItem
                label="Expiry Date"
                value={listing.expiry_date || "Not applicable"}
              />
              <InfoItem
                label="Storage"
                value={listing.storage_condition || "Not provided"}
              />
              <InfoItem
                label="Seller"
                value={listing.seller_name || "Seller"}
              />
            </div>

            {sellerProfile && (
              <Link
                href={`/users/${sellerProfile.id}`}
                className="mt-8 block rounded-3xl border border-emerald-100 bg-emerald-50 p-5 transition hover:border-emerald-400 hover:bg-emerald-100"
              >
                <div className="flex items-center gap-4">
                  {sellerProfile.avatar_url ? (
                    <img
                      src={sellerProfile.avatar_url}
                      alt={sellerProfile.full_name || "Seller"}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl">
                      👤
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
                      Seller profile
                    </p>

                    <h2 className="text-xl font-black">
                      {sellerProfile.full_name || listing.seller_name || "Seller"}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {sellerProfile.organization || "Organization not provided"}
                    </p>

                    {sellerProfile.is_verified_seller ? (
                      <p className="mt-2 text-sm font-black text-emerald-700">
                        ✅ Verified User
                      </p>
                    ) : (
                      <p className="mt-2 text-sm font-black text-slate-500">
                        Not verified
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {isUsedProduct && (
              <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                <h2 className="text-xl font-black">
                  Seller Verified Used Declaration
                </h2>

                {listing.used_verification_acknowledged ? (
                  <>
                    <p className="mt-3 text-sm leading-6">
                      The seller declared that this used product condition was
                      checked and described honestly.
                    </p>

                    {listing.used_verification_notes && (
                      <div className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6">
                        <p className="font-black">Seller notes</p>
                        <p className="mt-2">
                          {listing.used_verification_notes}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6">
                    No used-condition verification notes were provided.
                  </p>
                )}
              </div>
            )}

            {(listing.voucher_image_url || listing.proof_image_url) && (
              <div className="mt-8 rounded-3xl bg-slate-50 p-6">
                <h2 className="font-black">Supporting credibility files</h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {listing.voucher_image_url && (
                    <SupportImage
                      title="Purchase voucher / invoice"
                      imageUrl={listing.voucher_image_url}
                    />
                  )}

                  {listing.proof_image_url && (
                    <SupportImage
                      title="Scientific / productivity proof"
                      imageUrl={listing.proof_image_url}
                    />
                  )}
                </div>
              </div>
            )}

            <BuyerContactBox
              whatsappLink={whatsappLink}
              isSold={isSold}
              listingId={Number(listing.id)}
              country={listing.country}
            />

            <ReportListingBox listingId={Number(listing.id)} />
          </div>
        </div>
      </div>
    </main>
  );
}

function ListingNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Listing not found</h1>

          <p className="mt-3 text-slate-600">
            This listing may be pending, rejected, expired, removed, or does not
            exist.
          </p>

          <Link
            href="/listings"
            className="mt-6 inline-block font-bold text-emerald-700"
          >
            ← Back to items
          </Link>
        </div>
      </div>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="block text-sm font-bold text-slate-500">{label}</span>
      <span className="font-bold text-slate-950">{value}</span>
    </p>
  );
}

function SupportImage({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-slate-600">{title}</p>

      <div className="h-40 overflow-hidden rounded-2xl bg-white">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}