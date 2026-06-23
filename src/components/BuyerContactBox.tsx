"use client";

import { useState } from "react";
import Link from "next/link";

export default function BuyerContactBox({
  whatsappLink,
  isSold,
}: {
  whatsappLink: string;
  isSold: boolean;
}) {
  const [accepted, setAccepted] = useState(false);

  if (isSold) {
    return (
      <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800">
        <p className="font-black">This product has been marked as sold.</p>
        <p className="mt-2 text-sm">
          This advertisement is kept temporarily for transparency and may be
          removed later.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-black text-amber-900">Buyer safety advice</h2>

      <p className="mt-3 text-sm leading-6 text-amber-900">
        For your safety, it is better to meet the seller in a trusted and safe
        place, such as a research center, laboratory, university, or official
        workplace. Check the product condition, expiry, storage, documents, and
        seller identity before payment.
      </p>

      <p className="mt-3 text-sm leading-6 text-amber-900">
        من أجل سلامتك، الأفضل مقابلة البائع في مكان آمن وموثوق مثل مركز بحثي،
        معمل، جامعة، أو مكان عمل رسمي. تأكد من حالة المنتج، تاريخ الصلاحية،
        التخزين، المستندات، وهوية البائع قبل الدفع.
      </p>

      <label className="mt-5 flex gap-3 text-sm leading-6 text-amber-950">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1"
        />

        <span>
          I understand that the website is only a platform and intermediary. I
          am responsible for checking the product and completing the transaction
          safely. أقر أن الموقع مجرد منصة ووسيط، وأنني مسؤول عن فحص المنتج
          وإتمام المعاملة بأمان.{" "}
          <Link href="/policies" className="font-bold underline">
            Read policies
          </Link>
        </span>
      </label>

      <a
        href={accepted ? whatsappLink : undefined}
        target="_blank"
        rel="noreferrer"
        className={
          accepted
            ? "mt-6 inline-block rounded-2xl bg-emerald-700 px-6 py-4 font-bold text-white hover:bg-emerald-800"
            : "mt-6 inline-block cursor-not-allowed rounded-2xl bg-slate-300 px-6 py-4 font-bold text-slate-600"
        }
      >
        Contact Seller on WhatsApp
      </a>
    </div>
  );
}