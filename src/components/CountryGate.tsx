"use client";

import { useEffect, useState } from "react";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY } from "@/lib/countries";

export default function CountryGate() {
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCountry = localStorage.getItem("labexchange_country");

    if (savedCountry) {
      setSelectedCountry(savedCountry);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }

    setIsLoaded(true);
  }, []);

  function saveCountry(country: string) {
    setSelectedCountry(country);
    localStorage.setItem("labexchange_country", country);
    window.dispatchEvent(
      new CustomEvent("labexchange-country-change", {
        detail: country,
      })
    );
    setIsOpen(false);
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      <div className="border-b border-emerald-100 bg-emerald-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
          <p className="font-bold text-emerald-900">
            Current market country:{" "}
            <span className="font-black">{selectedCountry}</span>
          </p>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-xl bg-white px-4 py-2 font-black text-emerald-700 shadow-sm hover:bg-emerald-100"
          >
            Change Country
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-5">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
            <h2 className="text-3xl font-black text-slate-950">
              Choose your country
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Select the country market before browsing, buying, or selling lab
              supplies. You can change it later.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {COUNTRY_OPTIONS.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => saveCountry(country)}
                  className={
                    country === selectedCountry
                      ? "rounded-2xl border border-emerald-700 bg-emerald-700 px-4 py-3 text-left font-black text-white"
                      : "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-bold text-slate-800 hover:border-emerald-600 hover:bg-emerald-50"
                  }
                >
                  {country}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => saveCountry(selectedCountry)}
              className="mt-7 w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white hover:bg-slate-800"
            >
              Continue to LabExchange
            </button>
          </div>
        </div>
      )}
    </>
  );
}