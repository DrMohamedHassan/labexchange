import Link from "next/link";
import { formatPriceWithCurrency } from "@/lib/currencies";

export default function ListingCard({
  id,
  title,
  category,
  condition,
  city,
  price,
  priceCurrency,
  imageUrl,
  status,
}: {
  id: number;
  title: string;
  category: string;
  condition: string;
  city: string;
  price: number | string | null;
  priceCurrency?: string | null;
  imageUrl?: string | null;
  status?: string | null;
}) {
  const isSold = status === "sold";

  return (
    <Link
      href={`/listings/${id}`}
      className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-56 bg-slate-100">
        <img
          src={imageUrl || "/images/product-placeholder.png"}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
          {condition}
        </span>

        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-950">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          {category}
        </p>

        <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-slate-950">
          {title}
        </h3>

        <p className="mt-3 text-sm font-bold text-slate-500">{city}</p>

        <p className="mt-4 text-xl font-black text-slate-950">
          {formatPriceWithCurrency(price, priceCurrency)}
        </p>
      </div>
    </Link>
  );
}