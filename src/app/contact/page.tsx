"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messageType, setMessageType] = useState("Complaint");
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);
    setEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    setName(profile?.full_name || "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setPageMessage("Please write your name.");
      return;
    }

    if (!email.trim()) {
      setPageMessage("Please write your email.");
      return;
    }

    if (!subject.trim()) {
      setPageMessage("Please write the subject.");
      return;
    }

    if (!messageBody.trim()) {
      setPageMessage("Please write your message.");
      return;
    }

    setIsSubmitting(true);
    setPageMessage("Sending your message...");

    const { error } = await supabase.from("contact_messages").insert({
      user_id: userId || null,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message_type: messageType,
      message: messageBody.trim(),
      status: "new",
    });

    if (error) {
      setPageMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSubject("");
    setMessageBody("");
    setMessageType("Complaint");

    setPageMessage(
      userId
        ? "Your message was sent successfully. You will receive a notification when admin replies."
        : "Your message was sent successfully. Login before sending next time if you want to receive in-app notifications."
    );

    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="mb-6 inline-block font-bold text-emerald-700">
          ← Back to homepage
        </Link>

        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
            Contact LabFinds Admin
          </p>

          <h1 className="text-4xl font-black">Send a Request</h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Use this form for complaints, misleading product reports, help
            requests, seller issues, buyer issues, or general enquiries.
          </p>

          {userId ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <h2 className="font-black">You are logged in</h2>

              <p className="mt-2 text-sm leading-6">
                Admin replies will appear in your notifications and in My
                Requests.
              </p>

              <Link
                href="/my-requests"
                className="mt-4 inline-block font-black text-emerald-700 underline"
              >
                Open My Requests
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <h2 className="font-black">Login recommended</h2>

              <p className="mt-2 text-sm leading-6">
                You can send anonymously, but you will not receive in-app
                notifications unless you login first.
              </p>

              <Link
                href="/login"
                className="mt-4 inline-block font-black text-amber-700 underline"
              >
                Login first
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
              <InputField
                label="Name *"
                value={name}
                onChange={setName}
                placeholder="Your name"
              />

              <InputField
                label="Email *"
                value={email}
                onChange={setEmail}
                placeholder="your@email.com"
                type="email"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">Request Type *</label>

              <select
                value={messageType}
                onChange={(event) => setMessageType(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              >
                <option>Complaint</option>
                <option>Misleading product report</option>
                <option>Help request</option>
                <option>Buyer issue</option>
                <option>Seller issue</option>
                <option>General enquiry</option>
              </select>
            </div>

            <InputField
              label="Subject *"
              value={subject}
              onChange={setSubject}
              placeholder="Example: Misleading product information"
            />

            <div>
              <label className="mb-2 block font-bold">Message *</label>

              <textarea
                rows={7}
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Write your complaint, request, or report clearly."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          {pageMessage && (
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
              {pageMessage}
            </p>
          )}
        </section>
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700"
      />
    </div>
  );
}