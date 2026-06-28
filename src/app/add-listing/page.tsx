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
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddListingPage() {
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState("");

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<string>(DEFAULT_LISTING_CATEGORY);
  const [condition, setCondition] = useState<string>(DEFAULT_CONDITION);
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<string>(
    DEFAULT_PRICE_CURRENCY
  );
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

  const [legalOwnership, setLegalOwnership] = useState(false);
  const [notStolenContaminatedHazardous, setNotStolenContaminatedHazardous] =
    useState(false);
  const [regulatedDocuments, setRegulatedDocuments] = useState(false);
  const [accuracyAcknowledged, setAccuracyAcknowledged] = useState(false);
  const [adminRemovalAcknowledged, setAdminRemovalAcknowledged] =
    useState(false);
  const [sellerResponsibility, setSellerResponsibility] = useState(false);

  const [safetyNotProhibited, setSafetyNotProhibited] = useState(false);
  const [safetyBuyerCheck, setSafetyBuyerCheck] = useState(false);
  const [safetyPlatformPolicy, setSafetyPlatformPolicy] = useState(false);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUsedProduct = condition.toLowerCase().startsWith("used");

  const allSellerLegalAccepted =
    legalOwnership &&
    notStolenContaminatedHazardous &&
    regulatedDocuments &&
    accuracyAcknowledged &&
    adminRemovalAcknowledged &&
    sellerResponsibility;

  const allSafetyTermsAccepted =
    safetyNotProhibited && safetyBuyerCheck && safetyPlatformPolicy;

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    setIsLoadingUser(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setLoggedInUserId(user?.id || "");
    setIsLoadingUser(false);
  }

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

    if (!loggedInUserId) {
      setMessage("You must login before adding a listing.");
      return;
    }

    if (!title || !category || !condition || !country || !city || !price) {
      setMessage("Please fill all required product fields.");
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
      setMessage("Please upload the main product image.");
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

    if (!allSellerLegalAccepted) {
      setMessage("Please accept all seller legal responsibility confirmations.");
      return;
    }

    if (!allSafetyTermsAccepted) {
      setMessage("Please accept all safety and platform terms.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Uploading images and submitting listing for admin review...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please login first.");
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
        voucherImageUrl = await uploadListingFile(voucherImage, "documents");
      }

      if (proofImage) {
        proofImageUrl = await uploadListingFile(proofImage, "documents");
      }

      const numericPrice = Number(price);

      const { error } = await supabase.from("listings").insert({
        seller_id: user.id,
        seller_email: user.email || null,
        title: title.trim(),
        brand: brand.trim() || null,
        quantity: quantity.trim() || null,
        category,
        condition,
        country,
        city: city.trim(),
        price: Number.isNaN(numericPrice) ? null : numericPrice,
        price_currency: priceCurrency,
        expiry_date: expiryDate || null,
        storage_condition: storageCondition.trim() || null,
        description: description.trim() || null,
        seller_name: sellerName.trim(),
        seller_phone: sellerPhone.trim(),
        status: "pending",
        image_url: productImageUrl,
        product_image_url: productImageUrl,
        product_figure_1_url: figureUrls[0] || null,
        product_figure_2_url: figureUrls[1] || null,
        product_figure_3_url: figureUrls[2] || null,
        voucher_image_url: voucherImageUrl,
        proof_image_url: proofImageUrl,
        used_verification_acknowledged: isUsedProduct
          ? usedVerificationAcknowledged
          : false,
        used_verification_notes: isUsedProduct
          ? usedVerificationNotes.trim() || null
          : null,
        seller_legal_ownership_acknowledged: legalOwnership,
        seller_not_stolen_contaminated_hazardous_acknowledged:
          notStolenContaminatedHazardous,
        seller_regulated_documents_acknowledged: regulatedDocuments,
        seller_accuracy_acknowledged: accuracyAcknowledged,
        seller_admin_removal_acknowledged: adminRemovalAcknowledged,
        seller_responsibility_acknowledged: sellerResponsibility,
        safety_not_prohibited_acknowledged: safetyNotProhibited,
        safety_buyer_check_acknowledged: safetyBuyerCheck,
        safety_platform_policy_acknowledged: safetyPlatformPolicy,
        seller_legal_acknowledged_at: new Date().toISOString(),
      });

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setTitle("");
      setBrand("");
      setQuantity("");
      setCategory(DEFAULT_LISTING_CATEGORY);
      setCondition(DEFAULT_CONDITION);
      setCountry(DEFAULT_COUNTRY);
      setCity("");
      setPrice("");
      setPriceCurrency(DEFAULT_PRICE_CURRENCY);
      setExpiryDate("");
      setStorageCondition("");
      setDescription("");
      setSellerName("");
      setSellerPhone("");
      setProductImage(null);
      setProductFigures([]);
      setVoucherImage(null);
      setProofImage(null);
      setUsedVerificationNotes("");
      setUsedVerificationAcknowledged(false);
      setLegalOwnership(false);
      setNotStolenContaminatedHazardous(false);
      setRegulatedDocuments(false);
      setAccuracyAcknowledged(false);
      setAdminRemovalAcknowledged(false);
      setSellerResponsibility(false);
      setSafetyNotProhibited(false);
      setSafetyBuyerCheck(false);
      setSafetyPlatformPolicy(false);

      setMessage(
        "Listing submitted successfully. It will appear publicly after admin approval."
      );

      setIsSubmitting(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
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
          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Seller listing form
          </p>

          <h1 className="text-4xl font-black">Sell Your Item</h1>

          <p className="mt-3 leading-7 text-slate-600">
            Add accurate product details. Every listing must be reviewed and
            approved by admin before it appears publicly.
          </p>

          {isLoadingUser ? (
            <div className="mt-8 rounded-3xl bg-slate-50 p-8">
              <p className="font-bold text-slate-600">Checking login...</p>
            </div>
          ) : !loggedInUserId ? (
            <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900">
              <h2 className="text-2xl font-black">
                Login required before listing
              </h2>

              <p className="mt-3 leading-7">
                You must create an account and login before adding a listing.
                Anonymous sellers are not allowed on LabFinds.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white hover:bg-emerald-800"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-800 hover:border-emerald-600"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
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
                  options={LISTING_CATEGORIES}
                />

                <SelectField
                  label="Condition *"
                  value={condition}
                  onChange={setCondition}
                  options={CONDITION_OPTIONS}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Country *"
                  value={country}
                  onChange={handleCountryChange}
                  options={COUNTRY_OPTIONS}
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
                  placeholder="Describe product condition, storage, expiry, reason for selling, and important notes."
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

                  <CheckboxField
                    checked={usedVerificationAcknowledged}
                    onChange={setUsedVerificationAcknowledged}
                    label="I confirm that I described the used product condition honestly and clearly."
                  />
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-black">Product Images</h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Upload a clear main product image. You may also add up to 3
                  additional product figures.
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
                    Selected product figures: {productFigures.length} / 3
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FileField
                  label="Optional purchase voucher / invoice / ownership proof"
                  onChange={setVoucherImage}
                />

                <FileField
                  label="Optional scientific, regulatory, or product document"
                  onChange={setProofImage}
                />
              </div>

              <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
                <h2 className="text-xl font-black text-red-900">
                  Seller legal confirmations
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-900">
                  You must accept all confirmations before submitting the listing.
                </p>

                <div className="mt-5 grid gap-4">
                  <CheckboxField
                    checked={legalOwnership}
                    onChange={setLegalOwnership}
                    label="I confirm I legally own this item or have authority to sell it."
                  />

                  <CheckboxField
                    checked={notStolenContaminatedHazardous}
                    onChange={setNotStolenContaminatedHazardous}
                    label="I confirm this item is not stolen, contaminated, expired, prohibited, or hazardous."
                  />

                  <CheckboxField
                    checked={regulatedDocuments}
                    onChange={setRegulatedDocuments}
                    label="I confirm this item is not a medical device, diagnostic kit, IVD, chemical, biological material, drug, or regulated product unless I upload valid legal documents."
                  />

                  <CheckboxField
                    checked={accuracyAcknowledged}
                    onChange={setAccuracyAcknowledged}
                    label="I confirm all photos, price, condition, expiry, storage, and description are accurate."
                  />

                  <CheckboxField
                    checked={adminRemovalAcknowledged}
                    onChange={setAdminRemovalAcknowledged}
                    label="I understand admin may reject, freeze, hide, or remove the listing."
                  />

                  <CheckboxField
                    checked={sellerResponsibility}
                    onChange={setSellerResponsibility}
                    label="I accept that I am responsible for product accuracy and legal compliance."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-xl font-black text-amber-900">
                  Safety and platform terms
                </h2>

                <p className="mt-2 text-sm leading-6 text-amber-900">
                  These platform safety terms are also required before submitting
                  your listing.
                </p>

                <div className="mt-5 grid gap-4">
                  <CheckboxField
                    checked={safetyNotProhibited}
                    onChange={setSafetyNotProhibited}
                    label="I confirm that this item is not prohibited, dangerous, illegal, or restricted."
                  />

                  <CheckboxField
                    checked={safetyBuyerCheck}
                    onChange={setSafetyBuyerCheck}
                    label="I understand that buyers must check the product before payment and the website is only an intermediary platform."
                  />

                  <CheckboxField
                    checked={safetyPlatformPolicy}
                    onChange={setSafetyPlatformPolicy}
                    label="I accept platform policies and agree that admin can reject or remove unsafe listings."
                  />
                </div>

                <Link
                  href="/policies"
                  className="mt-5 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-black text-amber-900 shadow-sm hover:bg-amber-100"
                >
                  Read policies
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? "Submitting..." : "Submit for Admin Review"}
              </button>
            </form>
          )}

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
  options: readonly string[];
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
          <option key={item} value={item}>
            {item}
          </option>
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
        accept="image/png,image/jpeg,image/webp,application/pdf"
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

function CheckboxField({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex gap-3 text-sm leading-6 text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />

      <span>{label}</span>
    </label>
  );
}