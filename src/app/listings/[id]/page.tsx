"use client";

import Header from "@/components/Header";
import {
  CONDITION_OPTIONS,
  DEFAULT_CONDITION,
  DEFAULT_LISTING_CATEGORY,
  LISTING_CATEGORIES,
} from "@/lib/listing-options";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  DEFAULT_PRICE_CURRENCY,
  getDefaultCurrencyForCountry,
  PRICE_CURRENCY_OPTIONS,
} from "@/lib/currencies";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ListingEditData = {
  id: number;
  seller_id: string;
  title: string | null;
  brand: string | null;
  quantity: string | null;
  category: string | null;
  condition: string | null;
  country: string | null;
  city: string | null;
  price: number | string | null;
  price_currency: string | null;
  expiry_date: string | null;
  storage_condition: string | null;
  description: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  status: string | null;
  image_url: string | null;
  product_image_url: string | null;
  product_figure_1_url: string | null;
  product_figure_2_url: string | null;
  product_figure_3_url: string | null;
  voucher_image_url: string | null;
  proof_image_url: string | null;
  used_verification_acknowledged: boolean | null;
  used_verification_notes: string | null;
};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [listing, setListing] = useState<ListingEditData | null>(null);

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState(DEFAULT_LISTING_CATEGORY);
  const [condition, setCondition] = useState(DEFAULT_CONDITION);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState(DEFAULT_PRICE_CURRENCY);
  const [expiryDate, setExpiryDate] = useState("");
  const [storageCondition, setStorageCondition] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");

  const [productImage, setProductImage] = useState<File | null>(null);
  const [productFigures, setProductFigures] = useState<File[]>([]);
  const [voucherImage, setVoucherImage] = useState<File | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);

  const [usedVerificationNotes, setUsedVerificationNotes] = useState("");
  const [usedVerificationAcknowledged, setUsedVerificationAcknowledged] =
    useState(false);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUsedProduct = condition.toLowerCase().startsWith("used");

  useEffect(() => {
    async function loadListing() {
      if (Number.isNaN(listingId)) {
        setMessage("Invalid listing ID.");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, seller_id, title, brand, quantity, category, condition, country, city, price, price_currency, expiry_date, storage_condition, description, seller_name, seller_phone, status, image_url, product_image_url, product_figure_1_url, product_figure_2_url, product_figure_3_url, voucher_image_url, proof_image_url, used_verification_acknowledged, used_verification_notes"
        )
        .eq("id", listingId)
        .eq("seller_id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setMessage("Listing not found, or you do not own this listing.");
        setIsLoading(false);
        return;
      }

      const currentListing = data as ListingEditData;

      setListing(currentListing);
      setTitle(currentListing.title || "");
      setBrand(currentListing.brand || "");
      setQuantity(currentListing.quantity || "");
      setCategory(currentListing.category || DEFAULT_LISTING_CATEGORY);
      setCondition(currentListing.condition || DEFAULT_CONDITION);
      setCountry(currentListing.country || DEFAULT_COUNTRY);
      setCity(currentListing.city || "");
      setPrice(
        currentListing.price === null || currentListing.price === undefined
          ? ""
          : String(currentListing.price)
      );
      setPriceCurrency(
        currentListing.price_currency ||
          getDefaultCurrencyForCountry(currentListing.country)
      );
      setExpiryDate(currentListing.expiry_date || "");
      setStorageCondition(currentListing.storage_condition || "");
      setDescription(currentListing.description || "");
      setSellerName(currentListing.seller_name || "");
      setSellerPhone(currentListing.seller_phone || "");
      setUsedVerificationNotes(currentListing.used_verification_notes || "");
      setUsedVerificationAcknowledged(
        Boolean(currentListing.used_verification_acknowledged)
      );
      setMessage("");
      setIsLoading(false);
    }

    loadListing();
  }, [listingId]);

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setPriceCurrency(getDefaultCurrencyForCountry(newCountry));
    localStorage.setItem("labfinds_country", newCountry);
  }

  function handleProductFigures(files: FileList | null) {
    if (!files) {
      setProductFigures([]);
      return;
    }

    const selectedFiles = Array.from(files);

    if (selectedFiles.length > 3) {
      setMessage("You can upload maximum 3 additional product figures.");
      setProductFigures(selectedFiles.slice(0, 3));
      return;
    }

    setMessage("");
    setProductFigures(selectedFiles);
  }

  async function uploadListingFile(file: File, folder: string) {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;

    const { error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!listing) {
      setMessage("Listing is not loaded yet.");
      return;
    }

    if (!title || !category || !condition || !country || !city || !price) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (!priceCurrency) {
      setMessage("Please select the price currency.");
      return;
    }

    if (!sellerName || !sellerPhone) {
      setMessage("Please add seller name and WhatsApp phone.");
      return;
    }

    if (productFigures.length > 3) {
      setMessage("You can upload maximum 3 additional product figures.");
      return;
    }

    if (isUsedProduct && !usedVerificationAcknowledged) {
      setMessage("Please confirm the used-product verification declaration.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Saving edits and sending listing back to admin review...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
        setIsSubmitting(false);
        return;
      }

      let productImageUrl =
        listing.product_image_url ||
        listing.image_url ||
        "/images/product-placeholder.png";

      if (productImage) {
        productImageUrl = await uploadListingFile(productImage, "products");
      }

      let figure1Url = listing.product_figure_1_url || null;
      let figure2Url = listing.product_figure_2_url || null;
      let figure3Url = listing.product_figure_3_url || null;

      if (productFigures.length > 0) {
        const figureUrls = await Promise.all(
          productFigures.map((file) => uploadListingFile(file, "product-figures"))
        );

        figure1Url = figureUrls[0] || null;
        figure2Url = figureUrls[1] || null;
        figure3Url = figureUrls[2] || null;
      }

      let voucherImageUrl = listing.voucher_image_url || null;
      let proofImageUrl = listing.proof_image_url || null;

      if (voucherImage) {
        voucherImageUrl = await uploadListingFile(voucherImage, "vouchers");
      }

      if (proofImage) {
        proofImageUrl = await uploadListingFile(proofImage, "proofs");
      }

      const numericPrice = Number(price);

      const { error } = await supabase
        .from("listings")
        .update({
          title,
          brand,
          quantity,
          category,
          condition,
          country,
          city,
          price: Number.isNaN(numericPrice) ? null : numericPrice,
          price_currency: priceCurrency,
          expiry_date: expiryDate || null,
          storage_condition: storageCondition,
          description,
          seller_name: sellerName,
          seller_phone: sellerPhone,
          image_url: productImageUrl,
          product_image_url: productImageUrl,
          product_figure_1_url: figure1Url,
          product_figure_2_url: figure2Url,
          product_figure_3_url: figure3Url,
          voucher_image_url: voucherImageUrl,
          proof_image_url: proofImageUrl,
          used_verification_acknowledged: isUsedProduct
            ? usedVerificationAcknowledged
            : false,
          used_verification_notes: isUsedProduct ? usedVerificationNotes : null,
          status: "pending",
          admin_feedback: null,
        })
        .eq("id", listingId)
        .eq("seller_id", user.id);

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setMessage(
        "Edits saved successfully. Your listing is now pending admin approval again."
      );

      setTimeout(() => {
        router.push("/my-listings");
        router.refresh();
      }, 1400);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-bold text-slate-600">Loading listing...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <Header />

        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black">Cannot edit listing</h1>

            <p className="mt-4 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>

            <Link
              href="/my-listings"
              className="mt-6 inline-block font-bold text-emerald-700"
            >
              ← Back to my listings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/my-listings"
          className="mb-6 inline-block font-bold text-emerald-700"
        >
          ← Back to my listings
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">Edit Listing</h1>

          <p className="mt-3 text-slate-600">
            Any edit will send this listing back to admin review before it is
            published again.
          </p>

          {listing.status === "approved" && (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <h2 className="font-black">Admin approval required</h2>

              <p className="mt-2 text-sm leading-6">
                This listing is currently approved. After saving edits, it will
                become pending and will not appear publicly until admin approves
                it again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <InputField
              label="Product Title *"
              value={title}
              onChange={setTitle}
              placeholder="Example: qPCR Master Mix 2X"
            />

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Brand"
                value={brand}
                onChange={setBrand}
                placeholder="Example: Thermo Fisher"
              />

              <InputField
                label="Quantity"
                value={quantity}
                onChange={setQuantity}
                placeholder="Example: 2 boxes / 5 packs"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Category *"
                value={category}
                onChange={setCategory}
                options={LISTING_CATEGORIES as unknown as string[]}
              />

              <SelectField
                label="Condition *"
                value={condition}
                onChange={setCondition}
                options={CONDITION_OPTIONS as unknown as string[]}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                label="Country *"
                value={country}
                onChange={handleCountryChange}
                options={COUNTRY_OPTIONS as unknown as string[]}
              />

              <InputField
                label="City *"
                value={city}
                onChange={setCity}
                placeholder="Example: Cairo / Riyadh / Dubai"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Price *"
                value={price}
                onChange={setPrice}
                placeholder="Example: 2500"
                type="number"
              />

              <div>
                <label className="mb-2 block font-bold">
                  Price Currency *
                </label>

                <select
                  value={priceCurrency}
                  onChange={(event) => setPriceCurrency(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {PRICE_CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <InputField
              label="Expiry Date"
              value={expiryDate}
              onChange={setExpiryDate}
              placeholder=""
              type="date"
            />

            <InputField
              label="Storage Condition"
              value={storageCondition}
              onChange={setStorageCondition}
              placeholder="Example: Stored at 2-8°C / room temperature"
            />

            <div>
              <label className="mb-2 block font-bold">Description</label>

              <textarea
                rows={6}
                placeholder="Describe the product condition, storage, expiry, reason for selling, and important notes."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Seller Name *"
                value={sellerName}
                onChange={setSellerName}
                placeholder="Your name or company name"
              />

              <InputField
                label="WhatsApp Phone *"
                value={sellerPhone}
                onChange={setSellerPhone}
                placeholder="Example: 201001234567"
              />
            </div>

            {isUsedProduct && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="font-black text-amber-900">
                  Used Product Verification
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Because this item is used, you must honestly declare its
                  working condition and any defects.
                </p>

                <textarea
                  rows={4}
                  placeholder="Write notes about working condition, defects, usage period, calibration, or testing."
                  value={usedVerificationNotes}
                  onChange={(event) =>
                    setUsedVerificationNotes(event.target.value)
                  }
                  className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600"
                />

                <label className="mt-4 flex gap-3 text-sm leading-6 text-amber-950">
                  <input
                    type="checkbox"
                    checked={usedVerificationAcknowledged}
                    onChange={(event) =>
                      setUsedVerificationAcknowledged(event.target.checked)
                    }
                    className="mt-1"
                  />

                  <span>
                    I confirm that I described the used product condition
                    honestly and clearly.
                  </span>
                </label>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-black">Replace Product Images Optional</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Leave image fields empty to keep the existing images. Upload new
                files only if you want to replace them.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FileField
                  label="Replace Main Product Image"
                  onChange={setProductImage}
                />

                <MultipleFileField
                  label="Replace Additional Figures — maximum 3"
                  onChange={handleProductFigures}
                />
              </div>

              {productFigures.length > 0 && (
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700">
                  Selected replacement figures: {productFigures.length} / 3
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FileField
                label="Replace Voucher / Invoice Optional"
                onChange={setVoucherImage}
              />

              <FileField
                label="Replace Scientific Proof Optional"
                onChange={setProofImage}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting
                ? "Saving..."
                : "Save Edits and Send to Admin Review"}
            </button>
          </form>

          {message && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      >
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}

function FileField({
  label,
  onChange,
}: {
  label: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
      />
    </div>
  );
}

function MultipleFileField({
  label,
  onChange,
}: {
  label: string;
  onChange: (files: FileList | null) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">{label}</label>

      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => onChange(event.target.files)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
      />
    </div>
  );
}