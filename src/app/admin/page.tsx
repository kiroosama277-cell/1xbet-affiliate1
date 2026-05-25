"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";



// --- Types ---
type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  promoCode: string;
  trafficSource: string;
  channelDesc: string | null;
  refCode: string | null;
  salesRefId: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  salesRef?: { id: string; code: string; name: string } | null;
  commissions?: { id: string; amount: number; status: string }[];
};

type SalesRef = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  target: number;
  isActive: boolean;
  createdAt: string;
  _count: { registrations: number; commissions: number };
};

type Commission = {
  id: string;
  salesRefId: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: string;
  month: string;
  paidAt: string | null;
  createdAt: string;
  salesRef: { id: string; code: string; name: string };
  registration: { id: string; name: string; country: string };
};

type Activity = {
  id: string;
  action: string;
  details: string | null;
  salesRefId: string | null;
  createdAt: string;
  salesRef?: { id: string; code: string; name: string } | null;
};

type Stats = {
  overview: {
    totalRegistrations: number;
    totalSalesRefs: number;
    activeSalesRefs: number;
    todayRegistrations: number;
    weekRegistrations: number;
    monthRegistrations: number;
    refRegistrations: number;
    conversionRate: number;
  };
  commissions: { total: number; pending: number; approved: number; paid: number };
  salesStats: {
    id: string; code: string; name: string; email: string | null; phone: string | null;
    target: number; isActive: boolean; totalRegs: number; monthRegs: number;
    totalCommissions: number; progress: number;
  }[];
  countryStats: { country: string; count: number }[];
  sourceStats: { source: string; count: number }[];
  daily: { date: string; count: number }[];
  recentRegs: { id: string; name: string; country: string; createdAt: string; salesRef: { name: string; code: string } | null }[];
};

type Notification = { id: string; message: string; time: string; read: boolean };

// --- Icon helpers ---
const Icons = {
  dashboard: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  users: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  money: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  team: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  activity: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  settings: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  bell: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  download: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  contacted: "bg-yellow-500/15 text-yellow-400",
  active: "bg-green-500/15 text-green-400",
  inactive: "bg-red-500/15 text-red-400",
  pending: "bg-orange-500/15 text-orange-400",
  approved: "bg-green-500/15 text-green-400",
  paid: "bg-emerald-500/15 text-emerald-400",
};

const statusLabels: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  active: "نشط",
  inactive: "غير نشط",
  pending: "معلَّق",
  approved: "مُعتمَد",
  paid: "مدفوع",
};

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [salesRefs, setSalesRefs] = useState<SalesRef[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [commissionSummary, setCommissionSummary] = useState({ total: 0, pending: 0, approved: 0, paid: 0, count: 0 });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // UI state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddRef, setShowAddRef] = useState(false);
  const [newRef, setNewRef] = useState({ code: "", name: "", email: "", phone: "", target: "50" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingReg, setEditingReg] = useState<Registration | null>(null);
  const [editingRef, setEditingRef] = useState<SalesRef | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSiteUrl(window.location.origin); }, []);

  // --- Data fetching ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, regRes, refRes, commRes, actRes, setRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/registrations"),
        fetch("/api/admin/refs"),
        fetch("/api/admin/commissions"),
        fetch("/api/admin/activities?limit=50"),
        fetch("/api/admin/settings"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (regRes.ok) { const d = await regRes.json(); setRegistrations(d.registrations || d); }
      if (refRes.ok) setSalesRefs(await refRes.json());
      if (commRes.ok) { const d = await commRes.json(); setCommissions(d.commissions); setCommissionSummary(d.summary); }
      if (actRes.ok) { const d = await actRes.json(); setActivities(d.activities); }
      if (setRes.ok) setSettings(await setRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Poll for new registrations
  useEffect(() => {
    if (!isAuthed) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/registrations");
        if (res.ok) {
          const d = await res.json();
          const newRegs: Registration[] = d.registrations || d;
          if (newRegs.length > registrations.length && registrations.length > 0) {
            const newOnes = newRegs.filter((nr) => !registrations.some((or) => or.id === nr.id));
            newOnes.forEach((reg) => {
              addNotif(`تسجيل جديد: ${reg.name} — ${reg.salesRef?.name || "بدون مندوب"}`);
            });
          }
          setRegistrations(newRegs);
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthed, registrations]);

  const addNotif = (message: string) => {
    setNotifications((prev) => [{ id: Date.now().toString(), message, time: new Date().toLocaleTimeString("ar-EG"), read: false }, ...prev]);
  };
  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Auth ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, accessCode }),
      });
      if (res.ok) { setIsAuthed(true); setAuthError(""); fetchAllData(); }
      else { const d = await res.json(); setAuthError(d.error || "بيانات الدخول غير صحيحة"); }
    } catch {
      setAuthError("تعذَّر تسجيل الدخول، يرجى التحقق من البيانات");
    }
  };

  // --- Actions ---
  const handleAddRef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/refs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRef),
      });
      if (res.ok) { addNotif(`تمت إضافة المندوب: ${newRef.name}`); setNewRef({ code: "", name: "", email: "", phone: "", target: "50" }); setShowAddRef(false); fetchAllData(); }
      else { const d = await res.json(); alert(d.error || "حدث خطأ"); }
    } catch {}
  };

  const handleUpdateRef = async (data: any) => {
    try {
      await fetch("/api/admin/refs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setEditingRef(null);
      fetchAllData();
    } catch {}
  };

  const handleDeleteRef = async (id: string, name: string) => {
    if (!confirm(`هل ترغب في حذف المندوب ${name}؟`)) return;
    try { await fetch(`/api/admin/refs?id=${id}`, { method: "DELETE" }); addNotif(`تم حذف المندوب ${name}`); fetchAllData(); } catch {}
  };

  const handleUpdateReg = async (id: string, data: { status?: string; notes?: string }) => {
    try {
      await fetch("/api/admin/registrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
      setEditingReg(null);
      fetchAllData();
    } catch {}
  };

  const handleCommissionStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/commissions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      addNotif("تم تحديث حالة العمولة بنجاح");
      fetchAllData();
    } catch {}
  };

  const copyLink = (code: string, refId: string) => {
    navigator.clipboard.writeText(`${siteUrl}?ref=${code}`);
    setCopiedId(refId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Export ---
  const exportCSV = (type: "registrations" | "commissions") => {
    const BOM = "\uFEFF";
    let csv: string;
    if (type === "registrations") {
      const headers = ["الاسم", "البريد", "الهاتف", "الدولة", "البروموكود", "المصدر", "المندوب", "الحالة", "التاريخ"];
      const rows = filteredRegs.map((r) => [r.name, r.email, r.phone, r.country, r.promoCode, r.trafficSource, r.salesRef?.name || r.refCode || "—", statusLabels[r.status] || r.status, new Date(r.createdAt).toLocaleDateString("ar-EG")]);
      csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    } else {
      const headers = ["المندوب", "العميل", "المبلغ", "العملة", "الحالة", "الشهر", "التاريخ"];
      const rows = commissions.map((c) => [c.salesRef.name, c.registration.name, c.amount, c.currency, statusLabels[c.status] || c.status, c.month, new Date(c.createdAt).toLocaleDateString("ar-EG")]);
      csv = BOM + [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `1xbet-${type}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); addNotif("تم تصدير البيانات بنجاح");
  };

  // --- Filtered data ---
  const filteredRegs = registrations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.includes(q) || r.promoCode.toLowerCase().includes(q);
    }
    return true;
  });

  // --- LOGIN ---
  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] px-4">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f1f3d] p-8">
          <div className="mb-6 text-center">
            <div className="text-3xl font-bold mb-2"><span className="text-[#2db8ff]">1X</span><span className="text-white">BET</span></div>
            <p className="text-sm text-white/70">لوحة تحكم المدير</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/80 mb-1.5">اسم المستخدم</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="أدخل اسم المستخدم" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-[#2db8ff]/50" />
            </div>
            <div>
              <label className="block text-xs text-white/80 mb-1.5">كود الدخول</label>
              <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="أدخل كود الدخول" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-[#2db8ff]/50" />
            </div>
          </div>
          {authError && <p className="mt-3 text-center text-sm text-red-400">{authError}</p>}
          <button type="submit" className="mt-5 w-full rounded-lg bg-gradient-to-r from-[#d4a017] to-[#e8b84d] py-3 text-sm font-bold text-[#0a1628] hover:shadow-lg hover:shadow-[#d4a017]/20">دخول</button>
        </motion.form>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "نظرة عامة", icon: Icons.dashboard },
    { key: "registrations", label: "التسجيلات", icon: Icons.users },
    { key: "commissions", label: "العمولات", icon: Icons.money },
    { key: "sales", label: "فريق المبيعات", icon: Icons.team },
    { key: "activities", label: "سجل الأنشطة", icon: Icons.activity },
    { key: "settings", label: "الإعدادات", icon: Icons.settings },
  ];

  const maxDaily = Math.max(...(stats?.daily.map((d) => d.count) || [1]), 1);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 lg:z-auto top-0 right-0 h-full ${sidebarOpen ? "w-60 translate-x-0" : "w-60 translate-x-full lg:translate-x-0 lg:w-[68px]"} transition-all duration-300 border-l border-white/5 bg-[#0b1a30] flex flex-col`}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5 min-h-[60px]">
          {sidebarOpen && <span className="text-lg font-bold whitespace-nowrap"><span className="text-[#2db8ff]">1X</span><span>BET</span></span>}
          {!sidebarOpen && <span className="hidden lg:inline text-lg font-bold"><span className="text-[#2db8ff]">1X</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-auto text-white/70 hover:text-white p-1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          {/* Close button for mobile */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white p-1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-[#2db8ff]/10 text-[#2db8ff]" : "text-white/70 hover:text-white hover:bg-white/5"} ${!sidebarOpen ? "lg:justify-center lg:px-0" : ""}`}>
              <span className="flex-shrink-0">{tab.icon}</span>
              {sidebarOpen && <span className="whitespace-nowrap">{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/5">
          <button onClick={() => setIsAuthed(false)} className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:text-red-400 hover:bg-red-500/5 ${!sidebarOpen ? "lg:justify-center lg:px-0" : ""}`}>
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            {sidebarOpen && <span className="whitespace-nowrap">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-white/5 bg-[#0b1a30] px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile / toggle for desktop */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden rounded-lg bg-white/5 p-2 text-white/80 hover:text-white hover:bg-white/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white/80">{tabs.find((t) => t.key === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setNotifications((p) => p.map((n) => ({ ...n, read: true }))); }}
                className="relative rounded-lg bg-white/5 p-2 text-white/80 hover:text-white hover:bg-white/10">
                {Icons.bell}
                {unreadCount > 0 && <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-xl border border-white/10 bg-[#0f1f3d] shadow-2xl z-50">
                    <div className="border-b border-white/5 px-4 py-3 flex justify-between items-center">
                      <h4 className="text-sm font-bold">الإشعارات</h4>
                      {notifications.length > 0 && <button onClick={() => setNotifications([])} className="text-[10px] text-white/70 hover:text-white/80">مسح الجميع</button>}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? <p className="px-4 py-6 text-center text-xs text-white/80">لا توجد إشعارات حاليًا</p> :
                        notifications.slice(0, 20).map((n) => (
                          <div key={n.id} className={`border-b border-white/5 px-4 py-2.5 ${n.read ? "" : "bg-[#2db8ff]/5"}`}>
                            <p className="text-xs text-white/70">{n.message}</p>
                            <p className="mt-0.5 text-[9px] text-white/80">{n.time}</p>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <AnimatePresence mode="wait">

            {/* ===== OVERVIEW ===== */}
            {activeTab === "overview" && stats && (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "إجمالي التسجيلات", value: stats.overview.totalRegistrations, sub: `+${stats.overview.todayRegistrations} اليوم`, color: "text-[#2db8ff]" },
                    { label: "تسجيلات الشهر", value: stats.overview.monthRegistrations, sub: `+${stats.overview.weekRegistrations} الأسبوع`, color: "text-purple-400" },
                    { label: "فريق المبيعات", value: stats.overview.totalSalesRefs, sub: `${stats.overview.activeSalesRefs} نشط`, color: "text-[#d4a017]" },
                    { label: "نسبة التحويل", value: `${stats.overview.conversionRate}%`, sub: `${stats.overview.refRegistrations} عبر مندوب`, color: "text-green-400" },
                  ].map((card, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                      <p className="text-[10px] sm:text-xs text-white/70 mb-1">{card.label}</p>
                      <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
                      <p className="mt-1 text-[9px] sm:text-[10px] text-white/80">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Commission cards */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "إجمالي العمولات", value: `$${stats.commissions.total.toFixed(2)}`, color: "text-white" },
                    { label: "معلقة", value: `$${stats.commissions.pending.toFixed(2)}`, color: "text-orange-400" },
                    { label: "معتمدة", value: `$${stats.commissions.approved.toFixed(2)}`, color: "text-yellow-400" },
                    { label: "مدفوعة", value: `$${stats.commissions.paid.toFixed(2)}`, color: "text-emerald-400" },
                  ].map((card, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-4">
                      <p className="text-[9px] sm:text-[10px] text-white/70 mb-0.5">{card.label}</p>
                      <p className={`text-base sm:text-lg font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Daily chart */}
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-white/90">التسجيلات آخر 14 يوم</h3>
                    <div className="flex items-end gap-1 h-36">
                      {stats.daily.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <span className="text-[8px] text-white/70">{day.count || ""}</span>
                          <div className="w-full rounded-t bg-gradient-to-t from-[#2db8ff] to-[#2db8ff]/20 transition-all" style={{ height: `${Math.max((day.count / maxDaily) * 100, day.count > 0 ? 4 : 0)}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {stats.daily.map((day, i) => (
                        <div key={i} className="flex-1 text-center"><span className="text-[7px] text-white/40">{day.date.split(" ")[0]}</span></div>
                      ))}
                    </div>
                  </div>

                  {/* Top sales */}
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-white/90">أفضل المبيعات هذا الشهر</h3>
                    {stats.salesStats.length === 0 ? <p className="text-xs text-white/80 py-8 text-center">لا يوجد مندوبو مبيعات مسجَّلون</p> : (
                      <div className="space-y-3">
                        {stats.salesStats.slice(0, 6).map((s, i) => (
                          <div key={s.id} className="flex items-center gap-2 sm:gap-3">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${i === 0 ? "bg-[#d4a017]/20 text-[#d4a017]" : i === 1 ? "bg-gray-400/20 text-gray-300" : i === 2 ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-white/80"}`}>{i + 1}</span>
                            <span className="flex-1 text-xs sm:text-sm text-white/80 truncate">{s.name}</span>
                            <span className="text-[10px] sm:text-xs text-white/70">{s.monthRegs}/{s.target}</span>
                            <div className="w-12 sm:w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-[#2db8ff] transition-all" style={{ width: `${Math.min(s.progress, 100)}%` }} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-[#2db8ff] w-7 sm:w-8 text-left">{s.progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Country & Source */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-white/90">حسب الدولة</h3>
                    <div className="space-y-2">
                      {stats.countryStats.map((c) => (
                        <div key={c.country} className="flex items-center gap-2">
                          <span className="flex-1 text-xs text-white/80">{c.country}</span>
                          <span className="text-xs font-bold text-[#2db8ff]">{c.count}</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-green-400/60" style={{ width: `${(c.count / stats.overview.totalRegistrations) * 100}%` }} /></div>
                        </div>
                      ))}
                      {stats.countryStats.length === 0 && <p className="text-xs text-white/80 text-center py-4">لا توجد بيانات متاحة</p>}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                    <h3 className="mb-4 text-sm font-bold text-white/90">حسب المصدر</h3>
                    <div className="space-y-2">
                      {stats.sourceStats.map((s) => (
                        <div key={s.source} className="flex items-center gap-2">
                          <span className="flex-1 text-xs text-white/80">{s.source}</span>
                          <span className="text-xs font-bold text-purple-400">{s.count}</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-purple-400/60" style={{ width: `${(s.count / stats.overview.totalRegistrations) * 100}%` }} /></div>
                        </div>
                      ))}
                      {stats.sourceStats.length === 0 && <p className="text-xs text-white/80 text-center py-4">لا توجد بيانات متاحة</p>}
                    </div>
                  </div>
                </div>

                {/* Recent registrations */}
                <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-3 sm:p-5">
                  <h3 className="mb-4 text-sm font-bold text-white/90">آخر التسجيلات</h3>
                  <div className="space-y-2">
                    {stats.recentRegs.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                        <div className="h-8 w-8 rounded-full bg-[#2db8ff]/10 flex items-center justify-center text-[#2db8ff] text-xs font-bold">{r.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-white/70">{r.name}</p>
                          <p className="text-[10px] text-white/70">{r.country} — {new Date(r.createdAt).toLocaleDateString("ar-EG")}</p>
                        </div>
                        {r.salesRef && <span className="text-[10px] text-[#d4a017]">{r.salesRef.name}</span>}
                      </div>
                    ))}
                    {stats.recentRegs.length === 0 && <p className="text-xs text-white/80 text-center py-4">لا توجد تسجيلات حاليًا</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ===== REGISTRATIONS ===== */}
            {activeTab === "registrations" && (
              <motion.div key="regs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between">
                  <div className="flex gap-2 items-center flex-1 min-w-0">
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث بالاسم أو البريد..." className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/80 outline-none focus:border-[#2db8ff]/50" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none">
                      <option value="all">جميع الحالات</option>
                      <option value="new">جديد</option>
                      <option value="contacted">تم التواصل</option>
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                  <button onClick={() => exportCSV("registrations")} disabled={filteredRegs.length === 0} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-30">
                    {Icons.download} تصدير Excel
                  </button>
                </div>
                <p className="text-xs text-white/80">{filteredRegs.length} من {registrations.length} تسجيل</p>

                {filteredRegs.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center"><p className="text-white/70">لا توجد نتائج مطابقة</p></div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0f1f3d]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-white/70 text-xs">
                          <th className="px-4 py-3 text-right">الاسم</th>
                          <th className="px-4 py-3 text-right">البريد</th>
                          <th className="px-4 py-3 text-right">الهاتف</th>
                          <th className="px-4 py-3 text-right">الدولة</th>
                          <th className="px-4 py-3 text-right">البرومو</th>
                          <th className="px-4 py-3 text-right">المصدر</th>
                          <th className="px-4 py-3 text-right">المندوب</th>
                          <th className="px-4 py-3 text-right">الحالة</th>
                          <th className="px-4 py-3 text-right">التاريخ</th>
                          <th className="px-4 py-3 text-right">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegs.map((reg) => (
                          <tr key={reg.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-white/80 font-medium">{reg.name}</td>
                            <td className="px-4 py-3 text-white/80 text-xs">{reg.email}</td>
                            <td className="px-4 py-3 text-white/80 text-xs" dir="ltr">{reg.phone}</td>
                            <td className="px-4 py-3 text-white/80 text-xs">{reg.country}</td>
                            <td className="px-4 py-3 font-mono text-[#2db8ff] text-xs">{reg.promoCode}</td>
                            <td className="px-4 py-3 text-white/80 text-xs">{reg.trafficSource}</td>
                            <td className="px-4 py-3 text-xs">{reg.salesRef?.name ? <span className="text-[#d4a017]">{reg.salesRef.name}</span> : <span className="text-white/40">—</span>}</td>
                            <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[reg.status] || "bg-white/5 text-white/70"}`}>{statusLabels[reg.status] || reg.status}</span></td>
                            <td className="px-4 py-3 text-white/70 text-[10px]" dir="ltr">{new Date(reg.createdAt).toLocaleDateString("ar-EG")}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => setEditingReg(reg)} className="text-white/80 hover:text-[#2db8ff] transition-colors">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Edit Registration Modal */}
                <AnimatePresence>
                  {editingReg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditingReg(null)}>
                      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1f3d] p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">تعديل تسجيل: {editingReg.name}</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs text-white/70 mb-1">الحالة</label>
                            <select id="reg-status" defaultValue={editingReg.status} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                              <option value="new">جديد</option>
                              <option value="contacted">تم التواصل</option>
                              <option value="active">نشط</option>
                              <option value="inactive">غير نشط</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-white/70 mb-1">ملاحظات</label>
                            <textarea id="reg-notes" defaultValue={editingReg.notes || ""} rows={3} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/80" placeholder="أضف ملاحظة..." />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => {
                              const status = (document.getElementById("reg-status") as HTMLSelectElement).value;
                              const notes = (document.getElementById("reg-notes") as HTMLTextAreaElement).value;
                              handleUpdateReg(editingReg.id, { status, notes });
                            }} className="flex-1 rounded-lg bg-[#2db8ff] py-2 text-sm font-bold text-white hover:bg-[#2db8ff]/80">حفظ</button>
                            <button onClick={() => setEditingReg(null)} className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/80 hover:text-white">إلغاء</button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ===== COMMISSIONS ===== */}
            {activeTab === "commissions" && (
              <motion.div key="commissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Summary cards */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "إجمالي العمولات", value: `$${commissionSummary.total.toFixed(2)}`, color: "text-white" },
                    { label: "معلقة", value: `$${commissionSummary.pending.toFixed(2)}`, color: "text-orange-400" },
                    { label: "معتمدة", value: `$${commissionSummary.approved.toFixed(2)}`, color: "text-yellow-400" },
                    { label: "مدفوعة", value: `$${commissionSummary.paid.toFixed(2)}`, color: "text-emerald-400" },
                  ].map((c, i) => (
                    <div key={i} className="rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                      <p className="text-[10px] text-white/70">{c.label}</p>
                      <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/80">{commissions.length} عمولة</p>
                  <button onClick={() => exportCSV("commissions")} disabled={commissions.length === 0} className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-30">
                    {Icons.download} تصدير Excel
                  </button>
                </div>
                {commissions.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center"><p className="text-white/70">لا توجد عمولات مسجَّلة بعد</p></div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0f1f3d]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-white/70 text-xs">
                          <th className="px-4 py-3 text-right">المندوب</th>
                          <th className="px-4 py-3 text-right">العميل</th>
                          <th className="px-4 py-3 text-right">المبلغ</th>
                          <th className="px-4 py-3 text-right">الشهر</th>
                          <th className="px-4 py-3 text-right">الحالة</th>
                          <th className="px-4 py-3 text-right">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map((c) => (
                          <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-white/70">{c.salesRef.name}</td>
                            <td className="px-4 py-3 text-white/80">{c.registration.name}</td>
                            <td className="px-4 py-3 font-bold text-[#2db8ff]">${c.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-white/70 text-xs" dir="ltr">{c.month}</td>
                            <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[c.status]}`}>{statusLabels[c.status] || c.status}</span></td>
                            <td className="px-4 py-3">
                              {c.status === "pending" && (
                                <button onClick={() => handleCommissionStatus(c.id, "approved")} className="text-[10px] text-yellow-400 hover:text-yellow-300 ml-2">اعتماد</button>
                              )}
                              {c.status === "approved" && (
                                <button onClick={() => handleCommissionStatus(c.id, "paid")} className="text-[10px] text-emerald-400 hover:text-emerald-300">دفع</button>
                              )}
                              {c.status === "paid" && <span className="text-[10px] text-white/40">تم الدفع</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== SALES TEAM ===== */}
            {activeTab === "sales" && (
              <motion.div key="sales" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/80">{salesRefs.length} مندوب</p>
                  <button onClick={() => setShowAddRef(!showAddRef)} className="rounded-lg bg-gradient-to-r from-[#d4a017] to-[#e8b84d] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#0a1628] hover:shadow-lg hover:shadow-[#d4a017]/20">+ إضافة مندوب جديد</button>
                </div>

                {/* Add ref form */}
                <AnimatePresence>
                  {showAddRef && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddRef} className="overflow-hidden rounded-xl border border-[#d4a017]/20 bg-[#0f1f3d] p-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div><label className="mb-1 block text-xs text-white/70">الكود *</label><input value={newRef.code} onChange={(e) => setNewRef((p) => ({ ...p, code: e.target.value.replace(/\s/g, "").toLowerCase() }))} placeholder="ahmed" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none focus:border-[#2db8ff]/50" required /></div>
                        <div><label className="mb-1 block text-xs text-white/70">الاسم *</label><input value={newRef.name} onChange={(e) => setNewRef((p) => ({ ...p, name: e.target.value }))} placeholder="أحمد محمد" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none" required /></div>
                        <div><label className="mb-1 block text-xs text-white/70">البريد</label><input type="email" value={newRef.email} onChange={(e) => setNewRef((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none" /></div>
                        <div><label className="mb-1 block text-xs text-white/70">الهاتف</label><input value={newRef.phone} onChange={(e) => setNewRef((p) => ({ ...p, phone: e.target.value }))} placeholder="+20 xxx" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none" /></div>
                        <div><label className="mb-1 block text-xs text-white/70">الهدف الشهري</label><input type="number" value={newRef.target} onChange={(e) => setNewRef((p) => ({ ...p, target: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" /></div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button type="submit" className="rounded-lg bg-[#2db8ff] px-5 py-2 text-sm font-bold text-white hover:bg-[#2db8ff]/80">إضافة المندوب</button>
                        <button type="button" onClick={() => setShowAddRef(false)} className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/80">إلغاء</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {salesRefs.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center"><p className="text-white/70">لا يوجد مندوبو مبيعات مسجَّلون</p></div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {salesRefs.map((ref) => {
                      const salesData = stats?.salesStats.find((s) => s.id === ref.id);
                      return (
                        <div key={ref.id} className={`rounded-xl border bg-[#0f1f3d] p-5 transition-all ${ref.isActive ? "border-white/5" : "border-red-500/10 opacity-60"}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="h-9 w-9 rounded-full bg-[#2db8ff]/10 flex items-center justify-center text-[#2db8ff] font-bold text-sm">{ref.name.charAt(0)}</div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{ref.name}</h4>
                                <p className="text-[10px] text-white/80">@{ref.code}</p>
                              </div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${ref.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{ref.isActive ? "نشط" : "متوقف"}</span>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="rounded-lg bg-white/[0.02] p-2 text-center">
                              <p className="text-[10px] text-white/80">تسجيلات</p>
                              <p className="text-sm font-bold text-[#2db8ff]">{ref._count.registrations}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.02] p-2 text-center">
                              <p className="text-[10px] text-white/80">الشهر</p>
                              <p className="text-sm font-bold text-purple-400">{salesData?.monthRegs || 0}</p>
                            </div>
                            <div className="rounded-lg bg-white/[0.02] p-2 text-center">
                              <p className="text-[10px] text-white/80">عمولات</p>
                              <p className="text-sm font-bold text-[#d4a017]">{ref._count.commissions}</p>
                            </div>
                          </div>

                          {/* Progress */}
                          {salesData && (
                            <div className="mb-3">
                              <div className="flex justify-between text-[10px] text-white/70 mb-1">
                                <span>تقدم الهدف</span>
                                <span>{salesData.monthRegs}/{salesData.target}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${salesData.progress >= 100 ? "bg-green-400" : "bg-[#2db8ff]"}`} style={{ width: `${Math.min(salesData.progress, 100)}%` }} />
                              </div>
                            </div>
                          )}

                          {/* Contact info */}
                          <div className="mb-3 space-y-1 text-[10px] text-white/50">
                            {ref.email && <p>📧 {ref.email}</p>}
                            {ref.phone && <p dir="ltr">📱 {ref.phone}</p>}
                          </div>

                          {/* Link */}
                          <div className="mb-3 rounded-lg bg-white/[0.02] p-2.5">
                            <p className="text-[9px] text-white/80 mb-0.5">رابط المندوب:</p>
                            <p className="font-mono text-[11px] text-[#d4a017] break-all" dir="ltr">{siteUrl}?ref={ref.code}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1.5">
                            <button onClick={() => copyLink(ref.code, ref.id)} className="flex-1 rounded-lg bg-[#2db8ff]/10 py-1.5 text-[10px] font-medium text-[#2db8ff] hover:bg-[#2db8ff]/20">{copiedId === ref.id ? "تم!" : "نسخ"}</button>
                            <button onClick={() => setEditingRef(ref)} className="rounded-lg bg-white/5 py-1.5 px-2.5 text-[10px] text-white/70 hover:text-white">تعديل</button>
                            <button onClick={() => handleDeleteRef(ref.id, ref.name)} className="rounded-lg bg-red-500/10 py-1.5 px-2.5 text-[10px] text-red-400 hover:bg-red-500/20">حذف المندوب</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Edit Sales Ref Modal */}
                <AnimatePresence>
                  {editingRef && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditingRef(null)}>
                      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1f3d] p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">تعديل: {editingRef.name}</h3>
                        <div className="space-y-3">
                          <div><label className="block text-xs text-white/70 mb-1">الاسم</label><input id="edit-ref-name" defaultValue={editingRef.name} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" /></div>
                          <div><label className="block text-xs text-white/70 mb-1">البريد</label><input id="edit-ref-email" type="email" defaultValue={editingRef.email || ""} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" /></div>
                          <div><label className="block text-xs text-white/70 mb-1">الهاتف</label><input id="edit-ref-phone" defaultValue={editingRef.phone || ""} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" /></div>
                          <div><label className="block text-xs text-white/70 mb-1">الهدف الشهري</label><input id="edit-ref-target" type="number" defaultValue={editingRef.target} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" /></div>
                          <div className="flex items-center gap-2">
                            <input id="edit-ref-active" type="checkbox" defaultChecked={editingRef.isActive} className="accent-[#2db8ff]" />
                            <label className="text-xs text-white/80">نشط</label>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => {
                              handleUpdateRef({
                                id: editingRef.id,
                                name: (document.getElementById("edit-ref-name") as HTMLInputElement).value,
                                email: (document.getElementById("edit-ref-email") as HTMLInputElement).value,
                                phone: (document.getElementById("edit-ref-phone") as HTMLInputElement).value,
                                target: (document.getElementById("edit-ref-target") as HTMLInputElement).value,
                                isActive: (document.getElementById("edit-ref-active") as HTMLInputElement).checked,
                              });
                            }} className="flex-1 rounded-lg bg-[#2db8ff] py-2 text-sm font-bold text-white hover:bg-[#2db8ff]/80">حفظ</button>
                            <button onClick={() => setEditingRef(null)} className="rounded-lg bg-white/5 px-5 py-2 text-sm text-white/80">إلغاء</button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ===== ACTIVITIES ===== */}
            {activeTab === "activities" && (
              <motion.div key="activities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-xs text-white/80">{activities.length} نشاط</p>
                {activities.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-12 text-center"><p className="text-white/70">لا توجد أنشطة مسجَّلة بعد</p></div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act) => {
                      const icon = act.action.includes("registration") ? "📝" : act.action.includes("sales") ? "👤" : act.action.includes("commission") ? "💰" : act.action.includes("setting") ? "⚙️" : "📋";
                      return (
                        <div key={act.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#0f1f3d] p-4">
                          <span className="text-lg">{icon}</span>
                          <div className="flex-1">
                            <p className="text-sm text-white/70">{act.details || act.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-white/80">{new Date(act.createdAt).toLocaleString("ar-EG")}</span>
                              {act.salesRef && <span className="text-[10px] text-[#d4a017]">{act.salesRef.name}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== SETTINGS ===== */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl">
                <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-6 space-y-5">
                  <h3 className="text-base font-bold text-white/90">إعدادات العمولات</h3>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">مبلغ العمولة لكل تسجيل (USD)</label>
                    <input id="setting-commission" type="number" step="0.01" defaultValue={settings.commission_amount || "5"} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2db8ff]/50" />
                  </div>
                  <button onClick={async () => {
                    const val = (document.getElementById("setting-commission") as HTMLInputElement).value;
                    await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "commission_amount", value: val }) });
                    addNotif("تم حفظ الإعدادات بنجاح");
                    fetchAllData();
                  }} className="rounded-lg bg-[#2db8ff] px-6 py-2 text-sm font-bold text-white hover:bg-[#2db8ff]/80">حفظ الإعدادات</button>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#0f1f3d] p-6 space-y-5">
                  <h3 className="text-base font-bold text-white/90">معلومات النظام</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-white/70">إجمالي التسجيلات</span><p className="font-bold text-white mt-1">{registrations.length}</p></div>
                    <div><span className="text-white/70">إجمالي المندوب</span><p className="font-bold text-white mt-1">{salesRefs.length}</p></div>
                    <div><span className="text-white/70">إجمالي العمولات</span><p className="font-bold text-white mt-1">{commissions.length}</p></div>
                    <div><span className="text-white/70">سجل الأنشطة</span><p className="font-bold text-white mt-1">{activities.length}</p></div>
                  </div>
                </div>

                <div className="rounded-xl border border-red-500/10 bg-[#0f1f3d] p-6 space-y-3">
                  <h3 className="text-base font-bold text-red-400">منطقة الخطر</h3>
                  <p className="text-xs text-white/70">تحذير: هذه الإجراءات لا يمكن التراجع عنها</p>
                  <button onClick={async () => {
                    if (!confirm("هل أنت متأكد من حذف جميع التسجيلات؟ لا يمكن التراجع عن هذا الإجراء!")) return;
                    try {
                      const res = await fetch("/api/admin/registrations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteAll" }) });
                      if (res.ok) { addNotif("تم مسح جميع التسجيلات بنجاح"); fetchAllData(); }
                      else { addNotif("حدث خطأ أثناء مسح التسجيلات"); }
                    } catch { addNotif("حدث خطأ أثناء مسح التسجيلات"); }
                  }} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">مسح كل التسجيلات</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
