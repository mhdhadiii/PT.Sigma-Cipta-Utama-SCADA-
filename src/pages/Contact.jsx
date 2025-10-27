// src/pages/Contact.jsx
import { useEffect, useMemo, useState } from "react";
import Section from "../components/ui/Section";
import PageHero from "../components/ui/PageHero";
import { supabase } from "../supabaseClient";
import {
  MapPin,
  Phone,
  Building2,
  Loader2,
  Send,
  Mail,
  Printer,
  Copy,
  Check,
  Clock,
} from "lucide-react";

import slide2 from "../assets/slide2.jpg";

/* ---------- Small helpers ---------- */
const telHref = (num) => `tel:${num.replace(/[^+\d]/g, "")}`;
const mailHref = (e) => `mailto:${e}`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/* ---------- Office Card ---------- */
function OfficeCard({ title, address, phone, fax }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <p className="flex items-start gap-2 text-gray-700">
        <MapPin className="w-4 h-4 mt-1 text-gray-500 shrink-0" />
        <span>{address}</span>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <a
          href={telHref(phone)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50"
        >
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{phone}</span>
        </a>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          title="Copy number"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
        {fax && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-50">
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Fax: {fax}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Office Hours ---------- */
function HoursCard() {
  const rows = [
    ["Monday–Friday", "08:00 – 17:00 WIB"],
    ["Saturday", "08:00 – 12:00 WIB"],
    ["Sunday / Public Holidays", "Closed"],
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Operating Hours</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map(([d, h]) => (
          <li key={d} className="flex items-center justify-between">
            <span className="text-gray-600">{d}</span>
            <span className="font-medium">{h}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", msg: "" });
  const [showAlert, setShowAlert] = useState(false);

  const MAX = 2000;
  const used = form.message.length;
  const left = useMemo(() => clamp(MAX - used, 0, MAX), [used]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (status.type !== "idle") {
      setShowAlert(true);
      const t = setTimeout(() => setShowAlert(false), 2500);
      return () => clearTimeout(t);
    }
  }, [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "idle", msg: "" });

    // Honeypot anti-bot
    if (form.website) {
      setStatus({
        type: "success",
        msg: "Thank you! Your message has been sent.",
      });
      setForm({ name: "", email: "", message: "", website: "" });
      return;
    }

    // Basic validation
    if (!/.+@.+\..+/.test(form.email)) {
      setStatus({ type: "error", msg: "Invalid email format." });
      return;
    }
    if (form.name.trim().length < 2) {
      setStatus({ type: "error", msg: "Name must be at least 2 characters." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      };
      const { error } = await supabase.from("contacts").insert([payload]);
      if (error) throw error;

      setStatus({
        type: "success",
        msg: "Thank you! Your message has been sent successfully.",
      });
      setForm({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        msg: "Sorry, something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <PageHero
        title="Contact Us"
        subtitle="Reach out to our head office or operational site — we’re ready to assist you."
        image={slide2}
      />

      {/* Content */}
      <Section>
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Office Info (2 columns) */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
            <OfficeCard
              title="Head Office (Jakarta)"
              address="Graha Elnusa, 7th Floor, Jl. TB. Simatupang Kav. 1B, South Jakarta, DKI Jakarta"
              phone="(62-21) 7883 0856"
              fax="(62-21) 7883 0857"
            />
            <OfficeCard
              title="Operational Office (BSD)"
              address="Jl. Tekno I Blok B5–B7, Sektor XI Taman Tekno BSD, Setu, South Tangerang, Banten"
              phone="(62-21) 7587 1955"
              fax="(62-21) 7587 1933"
            />
            <HoursCard />
            {/* Direct Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Direct Contact</h3>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <a
                  href={mailHref("info@scu.co.id")}
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <Mail className="w-4 h-4 text-gray-500" />
                  info@scu.co.id
                </a>
                <a
                  href={telHref("(62-21) 7883 0856")}
                  className="inline-flex items-center gap-2 hover:underline"
                >
                  <Phone className="w-4 h-4 text-gray-500" />
                  (62-21) 7883 0856
                </a>
              </div>
            </div>
          </div>

          {/* Form (1 column) */}
          <div className="lg:col-span-1">
            {/* Floating Alert */}
            {showAlert && status.type !== "idle" && (
              <div
                role="alert"
                className={`mb-4 rounded-lg px-4 py-2 text-sm ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {status.msg}
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition h-fit"
            >
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Send a Message</h3>
              </div>

              <label className="block mb-3">
                <span className="block text-sm font-medium text-gray-700">
                  Full Name
                </span>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  autoComplete="name"
                  minLength={2}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                  required
                />
              </label>

              <label className="block mb-3">
                <span className="block text-sm font-medium text-gray-700">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@domain.com"
                  required
                />
              </label>

              <label className="block mb-4">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-gray-700">
                    Message
                  </span>
                  <span
                    className={`text-xs ${
                      left < 100 ? "text-amber-600" : "text-gray-500"
                    }`}
                  >
                    {left} characters left
                  </span>
                </div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={5}
                  maxLength={MAX}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message here"
                  required
                />
              </label>

              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                name="website"
                value={form.website}
                onChange={onChange}
                className="hidden"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold">
              Office Location — PT. Sigma Cipta Utama (SCADA)
            </h3>
          </div>
          <div className="w-full h-[440px]">
            <iframe
              title="Office Location — PT. Sigma Cipta Utama"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d912.8138258519042!2d101.18610522787137!3d1.2600072144595735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d37c9f31a8ab4d%3A0xe93a90f2641c67f6!2sJl.%20Asrama%20Tribrata%20No.22%2C%20Pematang%20Pudu%2C%20Kec.%20Mandau%2C%20Kabupaten%20Bengkalis%2C%20Riau%2028784!5e1!3m2!1sen!2sid!4v1761034343475!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </Section>
    </div>
  );
}
