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
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddListingPage() {
  const router = useRouter();

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

  const [sellerTermsAccepted, setSellerTermsAccepted] = useState(false);
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [
    prohibitedItemsAcknowledged,
    setProhibitedItemsAcknowledged,
  ] = useState(false);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUsedProduct = condition.toLowerCase().startsWith("used");

  useEffect(() => {
    const savedCountry = localStorage.getItem("labfinds_country");

    if (savedCountry) {
      setCountry(savedCountry);
      setPriceCurrency(getDefaultCurrencyForCountry(savedCountry));
    }
  }, []);

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

    if (!productImage) {
      setMessage("Please upload a real main product image.");
      return;
    }

    if (productFigures.length > 3) {
      setMessage("You can upload maximum 3 additional product figures.");
      return;
    }

    if (
      !sellerTermsAccepted ||
      !safetyAcknowledged ||
      !prohibitedItemsAcknowledged
    ) {
      setMessage("Please accept all safety and platform terms.");
      return;
    }

    if (isUsedProduct && !usedVerificationAcknowledged) {
      setMessage("Please confirm the used-product verification declaration.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Submitting listing...");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please login first before adding a listing.");
        setIsSubmitting(false);
        return;
      }

      const productImageUrl = await uploadListingFile(productImage, "products");

      const figureUrls = await Promise.all(
        productFigures.map((file) => uploadListingFile(file, "product-figures"))
      );

      let voucherImageUrl: string | null = null;
      let proofImageUrl: string | null = null;

      if (voucherImage) {
        voucherImageUrl = await uploadListingFile(voucherImage, "vouchers");
      }

      if (proofImage) {
        proofImageUrl = await uploadListingFile(proofImage, "proofs");
      }

      const numericPrice = Number(price);

      const { error } = await supabase.from("listings").insert({
        seller_id: user.id,
        seller_email: user.email || null,
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
        product_figure_1_url: figureUrls[0] || null,
        product_figure_2_url: figureUrls[1] || null,
        product_figure_3_url: figureUrls[2] || null,
        voucher_image_url: voucherImageUrl,
        proof_image_url: proofImageUrl,
        seller_terms_accepted: sellerTermsAccepted,
        safety_acknowledged: safetyAcknowledged,
        prohibited_items_acknowledged: prohibitedItemsAcknowledged,
        used_verification_acknowledged: isUsedProduct
          ? usedVerificationAcknowledged
          : false,
        used_verification_notes: isUsedProduct ? usedVerificationNotes : null,
        status: "pending",
      });

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("labfinds_country", country);

      setMessage(
        "Listing submitted successfully. It will appear after admin approval."
      );

      setTimeout(() => {
        router.push("/my-listings");
        router.refresh();
      }, 1200);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-black">Add a Listing</h1>

          <p className="mt-3 text-slate-600">
            Add your lab item. It will be reviewed by admin before appearing
            publicly.
          </p>

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
              <div>
                <label className="mb-2 block font-bold">Category *</label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {LISTING_CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold">Condition *</label>

                <select
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {CONDITION_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold">Country *</label>

                <select
                  value={country}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {COUNTRY_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

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
              <h2 className="font-black">Product Images</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Upload one required main product image, and up to 3 additional
                figures. Allowed formats: PNG, JPG, WEBP.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FileField
                  label="Main Product Image *"
                  onChange={setProductImage}
                />

                <MultipleFileField
                  label="Additional Product Figures — maximum 3"
                  onChange={handleProductFigures}
                />
              </div>

              {productFigures.length > 0 && (
                <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700">
                  Selected additional figures: {productFigures.length} / 3
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FileField
                label="Voucher / Invoice Optional"
                onChange={setVoucherImage}
              />

              <FileField
                label="Scientific Proof Optional"
                onChange={setProofImage}
              />
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <h2 className="font-black">Safety and platform terms</h2>

              <CheckField
                checked={prohibitedItemsAcknowledged}
                onChange={setProhibitedItemsAcknowledged}
                text="I confirm that this item is not prohibited, dangerous, illegal, or restricted."
              />

              <CheckField
                checked={safetyAcknowledged}
                onChange={setSafetyAcknowledged}
                text="I understand that buyers must check the product before payment and the website is only an intermediary platform."
              />

              <CheckField
                checked={sellerTermsAccepted}
                onChange={setSellerTermsAccepted}
                text="I accept platform policies and agree that admin can reject or remove unsafe listings."
              />

              <Link
                href="/policies"
                className="mt-4 inline-block font-bold text-emerald-700 underline"
              >
                Read policies
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Listing for Review"}
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

function CheckField({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  text: string;
}) {
  return (
    <label className="mt-4 flex gap-3 text-sm leading-6 text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />

      <span>{text}</span>
    </label>
  );
}