// src/pages/Home.jsx
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { memo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Cpu,
  Ship,
  ShieldCheck,
  Server,
  LineChart,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Gauge,
} from "lucide-react";

import HeroVideo from "../components/HeroVideo";
import Section from "../components/ui/Section";

// client logos
import pertaminaLogo from "../assets/pertamina.png";
import elnusaLogo from "../assets/elnusa.png";
import chevronLogo from "../assets/chevron.png";
import skkmigasLogo from "../assets/skkmigas.png";
import exxonLogo from "../assets/exxon.png";
import bpLogo from "../assets/bp.png";
import plnLogo from "../assets/pln.png";

// AKHLAK image
import akhlakSide from "../assets/akhlak_side.jpg";

/* ===== Helpers (less empty space, but normal element sizes) ===== */
const Stripe = ({ bg = "bg-white", children }) => (
  <div className={bg}>
    {/* slightly tighter than default, but not tiny */}
    <div className="py-10 md:py-14">{children}</div>
  </div>
);

Stripe.propTypes = {
  bg: PropTypes.string,
  children: PropTypes.node,
};

/* ===== Data ===== */
const SERVICES = [
  {
    icon: Database,
    title: "Data & Asset Management",
    desc:
      "End-to-end management of data and assets: intake, storage, traceability, through disposal — audit-ready.",
    to: "/services/data-asset",
    bullets: ["Records & Warehouse", "Governance", "Reporting"],
  },
  {
    icon: Cpu,
    title: "ICT Services",
    desc:
      "Digital solutions & infrastructure: applications, IoT & automation, up to data center & managed services.",
    to: "/services/ict",
    bullets: ["App Dev", "IoT/Network", "Managed Services"],
  },
  {
    icon: Ship,
    title: "Automatic Vessel Tracking (AVTS)",
    desc:
      "Real-time vessel tracking with geofencing and alerts for operational efficiency and safety.",
    to: "/services/avts",
    bullets: ["Real-time", "Geofence", "Reporting"],
  },
  {
    icon: Gauge,
    title: "SCADA",
    desc:
      "Supervisory Control & Data Acquisition — monitoring, control, and data acquisition for industrial processes.",
    to: "/scada",
    bullets: ["Real-time Monitoring", "Alarms", "Historian"],
  },
];

const CLIENT_LOGOS = [
  { src: pertaminaLogo, alt: "Pertamina" },
  { src: elnusaLogo, alt: "Elnusa" },
  { src: chevronLogo, alt: "Chevron" },
  { src: skkmigasLogo, alt: "SKK Migas" },
  { src: exxonLogo, alt: "ExxonMobil" },
  { src: bpLogo, alt: "BP" },
  { src: plnLogo, alt: "PLN" },
];

/* ===== Animations ===== */
const gridStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.08, staggerChildren: 0.12 },
  },
};
const cardVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

/* ===== Small UI ===== */
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
    <CheckCircle2 className="h-3.5 w-3.5" /> {children}
  </span>
);
Badge.propTypes = { children: PropTypes.node };

const Pill = ({ children }) => (
  <span className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
    {children}
  </span>
);
Pill.propTypes = { children: PropTypes.node };

const StatCard = memo(function StatCard({ value, label, accent = "blue" }) {
  const map = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    amber: "text-amber-600 bg-amber-50",
  };
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-6" role="group" aria-label={label}>
      <div className={`text-3xl sm:text-4xl font-extrabold ${map[accent] ?? map.blue} mb-2`}>{value}</div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
});
StatCard.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  accent: PropTypes.oneOf(["blue", "green", "amber"]),
};

const ServiceCard = memo(function ServiceCard({ icon: Icon, title, desc, to, bullets = [] }) {
  return (
    <Link
      to={to}
      className="group relative flex h-full flex-col rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`${title} — View details`}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(59,130,246,.12), transparent 40%)",
        }}
        aria-hidden="true"
      />
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-xl bg-blue-50" aria-hidden="true">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex-1 flex flex-col">
        <p className="text-gray-600 leading-relaxed mb-3 text-sm sm:text-[15px]">{desc}</p>
        {bullets.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {bullets.map((b) => (
              <Pill key={b}>{b}</Pill>
            ))}
          </div>
        )}
        <div className="mt-auto">
          <span className="inline-flex items-center gap-2 text-blue-600 font-medium">
            View details <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
});
ServiceCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  bullets: PropTypes.arrayOf(PropTypes.string),
};

/* ===== Page ===== */
export default function Home() {
  /** ====== DRAG-TO-SCROLL for AKHLAK STRIPE ====== */
  const trackRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  const dragStart = (e) => {
    const el = trackRef.current;
    if (!el) return;
    isDown.current = true;
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    startX.current = pageX - el.getBoundingClientRect().left;
    scrollStart.current = el.scrollLeft;
    el.classList.add("cursor-grabbing");
  };
  const dragMove = (e) => {
    const el = trackRef.current;
    if (!el || !isDown.current) return;
    e.preventDefault();
    const pageX = e.touches ? e.touches[0].pageX : e.pageX;
    const x = pageX - el.getBoundingClientRect().left;
    const walk = x - startX.current;
    el.scrollLeft = scrollStart.current - walk;
  };
  const dragEnd = () => {
    isDown.current = false;
    trackRef.current?.classList.remove("cursor-grabbing");
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* HERO */}
      <div className="relative">
        <HeroVideo />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="mx-auto max-w-6xl px-4">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2" />
          </div>
        </div>
      </div>

      {/* STRIPE 1: About */}
      <Stripe bg="bg-white">
        <Section
          title="About Us"
          subtitle="PT Sigma Cipta Utama (SCU) — a total solutions provider in Data Management and ICT Services."
          center
        >
          <div className="relative">
            <div className="pointer-events-none absolute -inset-x-8 -top-6 h-24 bg-gradient-to-b from-blue-50/60 to-transparent blur-2xl" />
            <div className="relative max-w-3xl mx-auto space-y-5 bg-white/90 rounded-2xl p-6 sm:p-8 shadow border">
              <p className="text-gray-700 leading-relaxed text-center text-[15px] sm:text-base">
                With deep experience in energy and enterprise, we help organizations build
                <b> clean data governance</b>, <b> efficient operations</b>, and <b> secure infrastructure</b> — from physical warehousing to applications and data centers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  to="/services"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white shadow text-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Explore Services
                </Link>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-center bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </Stripe>

      {/* STRIPE 2: Core Services */}
      <Stripe bg="bg-slate-50">
        <div id="services">
          <Section title="Core Services" center>
            <motion.div
              variants={gridStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch"
            >
              {SERVICES.map((s) => (
                <motion.div
                  key={s.title}
                  variants={cardVariant}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="h-full"
                >
                  <ServiceCard {...s} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                <div>
                  <div className="font-medium">Standards & Compliance</div>
                  <p className="text-gray-600 text-sm">Measured SOPs, audit-ready, best practices.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Server className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                <div>
                  <div className="font-medium">Reliable Infrastructure</div>
                  <p className="text-gray-600 text-sm">Data centers & warehouses with layered security controls.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LineChart className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
                <div>
                  <div className="font-medium">Outcome-Focused</div>
                  <p className="text-gray-600 text-sm">Clear ROI, SLAs, and day-to-day operational KPIs.</p>
                </div>
              </div>
            </motion.div>
          </Section>
        </div>
      </Stripe>

      {/* STRIPE 3: AKHLAK — mobile: image kiri + cards kanan + tombol geser */}
      <Stripe bg="bg-white">
        <Section
          title="AKHLAK Values"
          subtitle="Amanah • Kompeten • Harmonis • Loyal • Adaptif • Kolaboratif"
          center
          className="mt-1"
        />

        <div className="w-full overflow-x-hidden">
          {/* ===== MOBILE & TABLET (<= lg): image kiri + cards kanan ===== */}
          <div className="flex lg:hidden flex-nowrap w-full relative">

            {/* LEFT IMAGE */}
            <div className="basis-[44%] shrink-0">
              <div className="relative w-full h-[240px] xs:h-[260px] sm:h-[300px] overflow-hidden">
                <img
                  src={akhlakSide}
                  alt="AKHLAK Values"
                  className="absolute inset-0 w-full h-full object-cover object-left"
                  loading="lazy"
                />
              </div>
            </div>

            {/* RIGHT TRACK */}
            <div className="basis-[56%] shrink-0 bg-white relative">
              <div
                ref={trackRef}
                className="
            h-full flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden px-3 sm:px-4 py-4
            scroll-smooth snap-x snap-mandatory
            select-none touch-pan-x overscroll-x-contain
          "
                style={{ scrollbarWidth: "none" }}
              >
                {[
                  {
                    title: "Amanah",
                    desc: "Upholding the trust that has been given.",
                    pts: [
                      "Keep company and state secrets.",
                      "Honor promises and commitments.",
                      "Take responsibility for the trust given.",
                    ],
                  },
                  {
                    title: "Kompeten",
                    desc: "Continuously learn and build capabilities.",
                    pts: [
                      "Improve competencies to meet challenges.",
                      "Help others learn and grow.",
                      "Deliver tasks with the best quality.",
                    ],
                  },
                  {
                    title: "Harmonis",
                    desc: "Care for others and respect differences.",
                    pts: [
                      "Respect everyone regardless of background.",
                      "Be willing to help others.",
                      "Foster an inclusive work environment.",
                    ],
                  },
                  {
                    title: "Loyal",
                    desc: "Dedicated and prioritizing the nation’s interests.",
                    pts: [
                      "Protect the good name of colleagues and the company.",
                      "Be willing to sacrifice for bigger goals.",
                      "Obey leadership within ethics.",
                    ],
                  },
                  {
                    title: "Adaptif",
                    desc: "Keep innovating and be enthusiastic about change.",
                    pts: [
                      "Be open to new ideas.",
                      "Adopt new tech enthusiastically.",
                      "Adjust quickly to change.",
                    ],
                  },
                  {
                    title: "Kolaboratif",
                    desc: "Build synergistic teamwork.",
                    pts: [
                      "Enable others to contribute.",
                      "Collaborate for shared goals.",
                      "Encourage cross-team synergy.",
                    ],
                  },
                ].map(({ title, desc, pts }) => (
                  <div
                    key={title}
                    className="
                snap-start shrink-0
                w-[260px] xs:w-[280px] sm:w-[300px] min-h-[300px]
                rounded-[16px] p-4 sm:p-5 border border-gray-200 bg-white
                shadow-sm
              "
                  >
                    <h3 className="text-[17px] xs:text-[18px] sm:text-[20px] font-semibold">
                      {title}
                    </h3>
                    <div className="w-[24px] h-[3px] bg-red-500 rounded mt-3 mb-4" />
                    <p className="text-[13.5px] sm:text-[14px] leading-relaxed">{desc}</p>
                    <ul className="mt-3 list-disc list-inside space-y-1.5 text-[13.5px] sm:text-[14px]">
                      {pts.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <span className="shrink-0 w-2" />
              </div>

              {/* ==== BUTTON NEXT / PREV (HP ONLY) ==== */}
              <button
                onClick={() => {
                  trackRef.current.scrollLeft -= 260;
                }}
                className="
            absolute left-1 top-1/2 -translate-y-1/2
            w-7 h-7 flex items-center justify-center
            bg-white/90 border rounded-full shadow-sm
            text-gray-700 text-lg
          "
              >
                ◀
              </button>

              <button
                onClick={() => {
                  trackRef.current.scrollLeft += 260;
                }}
                className="
            absolute right-1 top-1/2 -translate-y-1/2
            w-7 h-7 flex items-center justify-center
            bg-white/90 border rounded-full shadow-sm
            text-gray-700 text-lg
          "
              >
                ▶
              </button>
            </div>
          </div>

          {/* ========== DESKTOP (>= lg): layout normal 5/7 ========== */}
          <div className="hidden lg:grid grid-cols-12 gap-0 items-stretch">
            <div className="col-span-5">
              <div className="relative min-h-[420px] w-full overflow-hidden">
                <img
                  src={akhlakSide}
                  className="w-full h-full object-cover object-left"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="col-span-7 bg-white relative">
              <div
                ref={trackRef}
                className="
            lg:-ml-16 xl:-ml-20 2xl:-ml-24
            flex gap-4 overflow-x-auto py-7 px-5
            scroll-smooth snap-x snap-mandatory
            touch-pan-x select-none
          "
                style={{ scrollbarWidth: "none" }}
              >
                {/* Card desktop sama seperti sebelumnya */}
                {/* … card mapping tetap … */}
              </div>
            </div>
          </div>
        </div>
      </Stripe>


      {/* STRIPE 4: Achievements */}
      <Stripe bg="bg-slate-50">
        <Section title="Achievements & Certifications" center>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <StatCard value="29,616 m²" label="Warehouse Area" accent="blue" />
            <StatCard value="ISO Certified" label="9001 · 14001 · 45001 · 20000-1 · 27001" accent="green" />
            <StatCard value="100+" label="National Clients & Partners" accent="amber" />
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border bg-white p-4 text-center">
              <Sparkles className="w-5 h-5 text-blue-600 mx-auto" />
              <div className="mt-1 text-sm font-semibold">Rapid Implementation</div>
              <p className="text-xs text-gray-600">Modular architecture, start with a pilot.</p>
            </div>
            <div className="rounded-xl border bg-white p-4 text-center">
              <Gauge className="w-5 h-5 text-blue-600 mx-auto" />
              <div className="mt-1 text-sm font-semibold">Clear SLAs & KPIs</div>
              <p className="text-xs text-gray-600">Transparent, measurable, and accountable.</p>
            </div>
            <div className="rounded-xl border bg-white p-4 text-center">
              <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto" />
              <div className="mt-1 text-sm font-semibold">Layered Security</div>
              <p className="text-xs text-gray-600">RBAC, audit logs, and continuous hardening.</p>
            </div>
          </div>
        </Section>
      </Stripe>

      {/* STRIPE 5: Clients */}
      <Stripe bg="bg-white">
        <Section title="Our Clients" subtitle="Delivered solutions for these companies and many more." center>
          <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            <div className="relative">
              <ul className="flex items-center gap-8 sm:gap-12 py-5 sm:py-6 animate-marquee will-change-transform">
                {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map(({ src, alt }, i) => (
                  <li key={alt + i} className="shrink-0">
                    <img
                      src={src}
                      alt={`${alt} — logo`}
                      loading="lazy"
                      width={160}
                      height={56}
                      className="h-7 md:h-10 lg:h-12 object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </li>
                ))}
              </ul>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-14 bg-gradient-to-l from-white to-transparent" />
            </div>
          </div>
        </Section>
      </Stripe>
    </div>
  );
}
