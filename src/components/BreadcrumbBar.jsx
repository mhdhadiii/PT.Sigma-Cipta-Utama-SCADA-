// src/components/BreadcrumbBar.jsx
import { Link, useLocation } from "react-router-dom";

/** Alias segment → label (dirender uppercase di bawah) */
const ALIASES = {
  // Halaman perusahaan
  about: "Tentang Kami",
  profile: "Profil Perusahaan",
  structure: "Struktur Organisasi",
  "vision-mission": "Visi & Misi",

  // Layanan
  services: "Produk & Jasa",
  ict: "ICT Services",
  avts: "Automatic Vessel Tracking (AVTS)",
  ndr: "National Data Repository (NDR)",
  retina: "RETINA Monitoring",
  "data-asset": "Data & Asset Management",
  scada: "SCADA — Supervisory Control and Data Acquisition",

  // Lainnya
  clients: "Klien",
  contact: "Kontak",
  career: "Karir",
  feedback: "Feedback",
  admin: "Admin",

  // === Certificates page (EN as requested) ===
  awards: "Certificates & Awards",
  penghargaan: "Certificates & Awards", // jaga-jaga kalau path-nya /penghargaan
};

function segToLabel(seg = "") {
  if (ALIASES[seg]) return ALIASES[seg];
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** child → parent virtual (paksa tampil parent walau path tidak mengandungnya) */
const PARENT_OF = {
  // group About
  profile: "about",
  structure: "about",
  "vision-mission": "about",

  // group Services
  scada: "services",
  ict: "services",
  avts: "services",
  ndr: "services",
  retina: "services",
  "data-asset": "services",

  // === Paksa Awards berada di bawah About (Tentang Kami) ===
  awards: "about",
  penghargaan: "about",
};

export default function BreadcrumbBar({
  titleMap = {},
  labelOverride,
  showOnHome = false,
  inHero = false,
  solid = false, // default transparan
  className = "",
  parent, // opsional: paksa segmen parent manual (tidak dibutuhkan untuk awards karena sudah di PARENT_OF)
}) {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  // Sembunyikan di home jika tidak diminta tampil
  if (!showOnHome && parts.length === 0) return null;

  // Bangun segmen dari path
  const segs = [...parts];

  // 1) Sisipkan parent virtual (berdasarkan PARENT_OF)
  if (segs.length > 0) {
    const first = segs[0];
    const virtualParent = PARENT_OF[first];
    if (virtualParent && first !== virtualParent) {
      segs.unshift(virtualParent);
    }
  }

  // 2) Jika prop `parent` diberikan, paksa parent paling depan
  if (parent && segs[0] !== parent) {
    segs.unshift(parent);
  }

  // Buat crumbs {href, label}
  let crumbs = segs.map((_, i) => {
    const href = "/" + segs.slice(0, i + 1).join("/");
    const seg = segs[i];
    const label = titleMap[href] || segToLabel(seg);
    return { href, label };
  });

  // Override label terakhir bila ada
  if (crumbs.length && labelOverride) {
    crumbs[crumbs.length - 1].label = labelOverride;
  }

  // Styling
  const wrapperCls = inHero
    ? `absolute bottom-0 left-0 right-0 z-20 ${className}`
    : `w-full ${className}`;
  const barBgCls = solid
    ? inHero
      ? "bg-[#0076C6]/90 backdrop-blur-sm"
      : "bg-[#0076C6]"
    : "";

  return (
    <div className={wrapperCls}>
      <div className={barBgCls}>
        <div className="container mx-auto px-6 py-1.5 md:py-2 text-xs md:text-sm tracking-wide drop-shadow">
          <Link to="/" className="font-semibold text-white">
            BERANDA
          </Link>

          {crumbs.length > 0 && (
            <>
              <span className="text-white/80">&nbsp;/&nbsp;</span>
              {crumbs.map((c, i) => {
                const isLast = i === crumbs.length - 1;
                const labelUpper = (c.label || "").toUpperCase();
                return isLast ? (
                  <span key={c.href} className="font-semibold text-[#E73431]">
                    {labelUpper}
                  </span>
                ) : (
                  <span key={c.href}>
                    <Link to={c.href} className="text-white hover:underline">
                      {labelUpper}
                    </Link>
                    <span className="text-white/80">&nbsp;/&nbsp;</span>
                  </span>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
