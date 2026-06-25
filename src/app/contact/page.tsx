"use client";

import Header from "@/components/Header";
import { COUNTRY_OPTIONS, DEFAULT_COUNTRY } from "@/lib/countries";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [messageType, setMessageType] = useState("General enquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedCountry = localStorage.getItem("InterLab Hub_country");

    if (savedCountry) {
      setCountry(savedCountry);
    }

    async function loadUserEmail() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }
    }

    loadUserEmail();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setStatusMessage("Please write your name.");
      return;
    }

    if (!email.trim()) {
      setStatusMessage("Please write your email.");
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setStatusMessage("Please write a clear message with at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Sending your message...");

    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      country,
      message_type: messageType,
      subject: subject.trim() || null,
      message: message.trim(),
      status: "new",
    });

    if (error) {
      setStatusMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setName("");
    setSubject("");
    setMessage("");
    setMessageType("General enquiry");
    setStatusMessage(
      "Your message has been sent successfully. Admin will review it as soon as possible."
    );
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          â† Back to homepage
        </Link>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Contact InterLab Hub
          </p>

          <h1 className="text-4xl font-black">Contact Us</h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Send us any enquiry, complaint, safety concern, seller issue, buyer
            issue, country availability request, or technical problem. Your
            message will appear privately to the admin.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Your Name *"
                value={name}
                onChange={setName}
                placeholder="Your full name"
              />

              <InputField
                label="Email *"
                value={email}
                onChange={setEmail}
                placeholder="email@example.com"
                type="email"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold">Country</label>

                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  {COUNTRY_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold">Message Type *</label>

                <select
                  value={messageType}
                  onChange={(event) => setMessageType(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
                >
                  <option>General enquiry</option>
                  <option>Buyer complaint</option>
                  <option>Seller complaint</option>
                  <option>Fraud or safety concern</option>
                  <option>Wrong country listing</option>
                  <option>Technical problem</option>
                  <option>Partnership request</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <InputField
              label="Subject"
              value={subject}
              onChange={setSubject}
              placeholder="Example: Complaint about a listing from another country"
            />

            <div>
              <label className="mb-2 block font-bold">Message *</label>

              <textarea
                rows={7}
                placeholder="Write your enquiry or complaint clearly..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Sending..." : "Send Message to Admin"}
            </button>
          </form>

          {statusMessage && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="text-xl font-black">For safety complaints</h2>

          <p className="mt-2 text-sm leading-6">
            If your complaint is about a specific listing, also use the report
            button inside the listing page. This helps admin connect the
            complaint to the correct product.
          </p>
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
