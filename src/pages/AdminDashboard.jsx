import { useEffect, useMemo, useState } from "react";
import { supabase, BUCKETS } from "../supabaseClient";
import { LogOut, Users, Briefcase, Search, Download, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../assets/logo.png";

/* =============== Utils =============== */
const cn = (...cls) => cls.filter(Boolean).join(" ");
const fmt = (d) => new Date(d).toLocaleString();
const toMonthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};
const prettyMonth = (key) => {
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(dt);
};

// helper upsert & remove utk array by id (dipakai Realtime)
const upsertById = (arr, row) => {
  if (!row) return arr;
  const i = arr.findIndex((r) => r.id === row.id);
  if (i === -1) return [row, ...arr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const copy = [...arr];
  copy[i] = row;
  return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};
const removeById = (arr, id) => arr.filter((r) => r.id !== id);

// CSV export
function toCSV(headers, rows) {
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const head = headers.map(esc).join(",");
  const body = rows.map((r) => r.map(esc).join(",")).join("\n");
  return head + "\n" + body;
}
function downloadCSV(filename, headers, rows) {
  const blob = new Blob([toCSV(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =============== Recharts =============== */
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
  AreaChart, Area,
} from "recharts";

/* ===== Tooltip mungil untuk semua chart ===== */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0];
  return (
    <div className="rounded-md bg-white/95 shadow px-3 py-2 text-xs">
      <div className="font-medium mb-0.5">{label}</div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-gray-700">{name}:</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

/* =============== Small UI =============== */
function StatCard({ title, value }) {
  return (
    <div className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Pagination Control */
function Pager({ page, setPage, pageCount, pageSize, setPageSize, total }) {
  const canPrev = page > 1;
  const canNext = page < pageCount;
  return (
    <div className="flex items-center justify-between mt-3">
      <div className="text-xs text-gray-500">
        Halaman <span className="font-medium">{page}</span> dari{" "}
        <span className="font-medium">{pageCount || 1}</span> •{" "}
        <span className="font-medium">{total}</span> baris
      </div>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border rounded-lg px-2 py-1 text-sm"
        >
          {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / halaman</option>)}
        </select>
        <div className="flex items-center gap-1">
          <button
            onClick={() => canPrev && setPage(page - 1)}
            disabled={!canPrev}
            className={cn(
              "px-3 py-1 rounded-lg border text-sm",
              canPrev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
            )}
          >
            Prev
          </button>
          <button
            onClick={() => canNext && setPage(page + 1)}
            disabled={!canNext}
            className={cn(
              "px-3 py-1 rounded-lg border text-sm",
              canNext ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* =============== Auth UI (Modernized) =============== */
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) setErr(error.message);
  };

  const onForgot = async () => {
    if (!email) return setErr("Masukkan email terlebih dahulu untuk reset password.");
    setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // sesuaikan jika punya route khusus reset
    });
    if (error) setErr(error.message);
    else alert("Link reset password telah dikirim ke email kamu.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient + blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-pulse" />

      <div className="relative flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/60 shadow-xl rounded-2xl p-6 md:p-8
                     transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-2 mb-6">
            <img src={Logo} alt="logo" className="h-12 w-auto" />
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Masuk Admin</h1>
              <p className="text-sm text-gray-600">Silakan login untuk mengelola dashboard</p>
            </div>
          </div>

          {/* Error alert */}
          {err && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          {/* Email */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 pl-10 pr-3 py-2.5 text-sm
                         outline-none ring-blue-200 focus:ring-4 transition"
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 pl-10 pr-10 py-2.5 text-sm
                         outline-none ring-blue-200 focus:ring-4 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-blue-600 hover:text-blue-700 underline decoration-dotted"
            >
              Lupa password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white",
              "py-2.5 text-sm font-medium shadow hover:bg-blue-700 active:scale-[.99] transition",
              loading && "opacity-90 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Memproses…
              </>
            ) : (
              "Masuk"
            )}
          </button>

          {/* Footer kecil */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Dilindungi oleh autentikasi <span className="font-medium text-gray-700">Supabase</span>
          </p>
        </form>
      </div>
    </div>
  );
}

/* =============== Main =============== */
export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [contacts, setContacts] = useState([]);
  const [applications, setApps] = useState([]);
  const [counts, setCounts] = useState({ contacts: 0, applications: 0 });

  // Search dipisah per-tab:
  const [searchC, setSearchC] = useState("");
  const [searchA, setSearchA] = useState("");

  // pagination state per-tab
  const [pageC, setPageC] = useState(1);
  const [sizeC, setSizeC] = useState(10);
  const [pageA, setPageA] = useState(1);
  const [sizeA, setSizeA] = useState(10);

  // auth
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    })();
    const sub = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  // fetch awal
  useEffect(() => {
    const fetchData = async () => {
      const { data: c } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
      setContacts(c || []);
      const { data: a } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      setApps(a || []);
      setCounts({ contacts: c?.length || 0, applications: a?.length || 0 });
    };
    fetchData();
  }, [tab]);

  // Realtime
  useEffect(() => {
    const chContacts = supabase
      .channel("realtime:contacts")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setContacts((prev) => upsertById(prev, payload.new));
            setCounts((c) => ({ ...c, contacts: (c.contacts || 0) + 1 }));
          } else if (payload.eventType === "UPDATE") {
            setContacts((prev) => upsertById(prev, payload.new));
          } else if (payload.eventType === "DELETE") {
            setContacts((prev) => removeById(prev, payload.old?.id));
            setCounts((c) => ({ ...c, contacts: Math.max((c.contacts || 1) - 1, 0) }));
          }
        }
      )
      .subscribe();

    const chApps = supabase
      .channel("realtime:applications")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setApps((prev) => upsertById(prev, payload.new));
            setCounts((c) => ({ ...c, applications: (c.applications || 0) + 1 }));
          } else if (payload.eventType === "UPDATE") {
            setApps((prev) => upsertById(prev, payload.new));
          } else if (payload.eventType === "DELETE") {
            setApps((prev) => removeById(prev, payload.old?.id));
            setCounts((c) => ({ ...c, applications: Math.max((c.applications || 1) - 1, 0) }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chContacts);
      supabase.removeChannel(chApps);
    };
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };

  // ====== Aggregations for charts ======>
  const last12MonthKeys = useMemo(() => {
    const now = new Date();
    const keys = [];
    for (let i = 11; i >= 0; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(toMonthKey(d));
    }
    return keys;
  }, []);

  const contactsByMonth = useMemo(() => {
    const mcount = new Map(last12MonthKeys.map(k => [k, 0]));
    for (const c of contacts) {
      const k = toMonthKey(c.created_at);
      if (mcount.has(k)) mcount.set(k, mcount.get(k) + 1);
    }
    return last12MonthKeys.map(k => ({ key: k, label: prettyMonth(k), contacts: mcount.get(k) }));
  }, [contacts, last12MonthKeys]);

  const appsByPosition = useMemo(() => {
    const map = new Map();
    for (const a of applications) {
      const p = (a.position || "Unknown").trim();
      map.set(p, (map.get(p) || 0) + 1);
    }
    return Array.from(map, ([position, count]) => ({ position, count }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 8);
  }, [applications]);

  // ====== Filtering & Pagination (client-side) ======
  const qC = searchC.toLowerCase();
  const qA = searchA.toLowerCase();

  const filteredContacts = useMemo(() => {
    if (!qC) return contacts;
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(qC) ||
      c.email?.toLowerCase().includes(qC) ||
      c.message?.toLowerCase().includes(qC)
    );
  }, [contacts, qC]);

  const filteredApplications = useMemo(() => {
    if (!qA) return applications;
    return applications.filter(a =>
      a.name?.toLowerCase().includes(qA) ||
      a.email?.toLowerCase().includes(qA) ||
      a.position?.toLowerCase().includes(qA)
    );
  }, [applications, qA]);

  // reset page ke 1 setiap query berubah (per-tab)
  useEffect(() => { setPageC(1); }, [qC]);
  useEffect(() => { setPageA(1); }, [qA]);

  // paging contacts
  const pageCountC = Math.max(1, Math.ceil(filteredContacts.length / sizeC));
  const pageRowsC = useMemo(() => {
    const start = (pageC - 1) * sizeC;
    return filteredContacts.slice(start, start + sizeC);
  }, [filteredContacts, pageC, sizeC]);

  // paging applications
  const pageCountA = Math.max(1, Math.ceil(filteredApplications.length / sizeA));
  const pageRowsA = useMemo(() => {
    const start = (pageA - 1) * sizeA;
    return filteredApplications.slice(start, start + sizeA);
  }, [filteredApplications, pageA, sizeA]);

  if (!user) return <AdminLogin />;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow flex flex-col">
        {/* CLICKABLE LOGO → go to Dashboard */}
        <div
          onClick={() => setTab("dashboard")}
          className="px-6 py-4 border-b flex items-center justify-center cursor-pointer hover:bg-gray-50"
          title="Kembali ke Dashboard"
        >
          <img src={Logo} alt="SCU Logo" className="h-12 w-auto" />
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setTab("contacts")}
            className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg",
              tab === "contacts" ? "bg-blue-600 text-white" : "hover:bg-gray-100")}>
            <Users size={18}/> Contacts
          </button>
          <button onClick={() => setTab("applications")}
            className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg",
              tab === "applications" ? "bg-blue-600 text-white" : "hover:bg-gray-100")}>
            <Briefcase size={18}/> Applications
          </button>
        </nav>

        <div className="p-4 border-t">
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header tanpa search global */}
        <header className="bg-white px-6 py-3 shadow flex justify-between items-center">
          <h1 className="font-semibold">
            {tab === "dashboard" ? "Dashboard" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </h1>
          <div />
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {tab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Contacts" value={counts.contacts}/>
                <StatCard title="Total Applications" value={counts.applications}/>
                <StatCard title="Status" value="Online ✅"/>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Kontak per Bulan – area smooth + gradient */}
                <Card title="Kontak per Bulan (12 bln)">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={contactsByMonth} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <defs>
                          <linearGradient id="ctArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} tickMargin={6} />
                        <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area
                          type="monotone"
                          dataKey="contacts"
                          name="Contacts"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fill="url(#ctArea)"
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Aplikasi per Posisi – bar radius & layout rapih */}
                <Card title="Aplikasi per Posisi (Top 8)">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appsByPosition} margin={{ top: 8, right: 12, left: 0, bottom: 12 }} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="position"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickMargin={10}
                          interval={0}
                        />
                        <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: "#6b7280" }} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="count" name="Applications" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

          {tab === "contacts" && (
            <Card
              title="Contacts"
              right={
                <div className="flex items-center gap-2">
                  {/* Search khusus Contacts */}
                  <div className="relative">
                    <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchC}
                      onChange={(e) => setSearchC(e.target.value)}
                      placeholder="Cari nama, email, atau pesan…"
                      className="border rounded-lg pl-8 pr-3 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const headers = ["id","name","email","message","created_at"];
                      const rows = filteredContacts.map(c => [c.id, c.name, c.email, c.message, c.created_at]);
                      downloadCSV(`contacts_${Date.now()}.csv`, headers, rows);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                    title="Export hasil filter ke CSV"
                  >
                    <Download size={16}/> Export CSV
                  </button>
                </div>
              }
            >
              <Table
                columns={["Name","Email","Message","Date"]}
                rows={pageRowsC.map(c => [c.name, c.email, c.message, fmt(c.created_at)])}
              />
              <Pager
                page={pageC}
                setPage={setPageC}
                pageCount={pageCountC}
                pageSize={sizeC}
                setPageSize={setSizeC}
                total={filteredContacts.length}
              />
            </Card>
          )}

          {tab === "applications" && (
            <Card
              title="Applications"
              right={
                <div className="flex items-center gap-2">
                  {/* Search khusus Applications */}
                  <div className="relative">
                    <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchA}
                      onChange={(e) => setSearchA(e.target.value)}
                      placeholder="Cari nama, email, posisi…"
                      className="border rounded-lg pl-8 pr-3 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const headers = ["id","name","email","position","cv_path","created_at"];
                      const rows = filteredApplications.map(a => [a.id, a.name, a.email, a.position, a.cv_path ?? "", a.created_at]);
                      downloadCSV(`applications_${Date.now()}.csv`, headers, rows);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                    title="Export hasil filter ke CSV"
                  >
                    <Download size={16}/> Export CSV
                  </button>
                </div>
              }
            >
              <Table
                columns={["Name","Email","Position","CV","Date"]}
                rows={pageRowsA.map(a => [
                  a.name, a.email, a.position,
                  a.cv_path ? (
                    <a
                      href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKETS.CV}/${a.cv_path}`}
                      target="_blank" rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  ) : "-",
                  fmt(a.created_at)
                ])}
              />
              <Pager
                page={pageA}
                setPage={setPageA}
                pageCount={pageCountA}
                pageSize={sizeA}
                setPageSize={setSizeA}
                total={filteredApplications.length}
              />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
