"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileBadge,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Network,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Store,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useAdminPreferences } from "./admin-preferences";
import { useDemo } from "@/lib/demo-context";

export const ADMIN_ROLES = [
  "Baş administrator",
  "Maliyyə administratoru",
  "Ərazi rəisi",
  "Operator",
  "Sənəd mütəxəssisi",
  "Auditor",
] as const;
type AdminContextValue = {
  role: string;
  setRole: (role: string) => void;
  can: (permission: string) => boolean;
};
const AdminContext = createContext<AdminContextValue>({
  role: ADMIN_ROLES[0],
  setRole: () => {},
  can: () => true,
});
export const useAdminRole = () => useContext(AdminContext);
export const adminNavigation = [
  {
    path: "dashboard",
    title: "Ümumi baxış",
    icon: LayoutDashboard,
    group: "İDARƏETMƏ",
  },
  { path: "buildings", title: "Binalar", icon: Building2 },
  { path: "properties", title: "Mənzillər", icon: Landmark },
  {
    path: "residents",
    title: "Sakinlər və dövr məlumatları",
    icon: UsersRound,
  },
  {
    path: "commercial-objects",
    title: "Qeyri-yaşayış obyektləri",
    icon: Store,
  },
  { path: "tariffs", title: "Tariflər", icon: WalletCards },
  {
    path: "billing",
    title: "Hesablamalar",
    icon: ReceiptText,
    group: "MALİYYƏ VƏ SƏNƏDLƏR",
  },
  { path: "invoices", title: "Hesab reyestri", icon: ClipboardList },
  { path: "payments", title: "Ödənişlər", icon: CreditCard },
  { path: "reconciliation", title: "Üzləşdirmə", icon: ClipboardList },
  { path: "certificates", title: "Arayışlar", icon: FileBadge },
  {
    path: "reports",
    title: "Hesabatlar və statistika",
    icon: ChartNoAxesCombined,
  },
  {
    path: "users-roles",
    title: "İstifadəçilər və rollar",
    icon: UsersRound,
    group: "SİSTEM",
  },
  { path: "audit-log", title: "Audit jurnalı", icon: Activity },
  { path: "settings", title: "Tənzimləmələr", icon: Settings2 },
  { path: "system-architecture", title: "Sistem arxitekturası", icon: Network },
];

const permissions: Record<string, string[]> = {
  "Baş administrator": [
    "buildings",
    "commercial",
    "billing",
    "payments",
    "reconciliation",
    "certificates",
  ],
  "Maliyyə administratoru": [
    "billing",
    "payments",
    "reconciliation",
    "commercial",
  ],
  "Ərazi rəisi": ["buildings", "commercial"],
  Operator: ["buildings", "payments"],
  "Sənəd mütəxəssisi": ["certificates"],
  Auditor: [],
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { preferences } = useAdminPreferences();
  const { data } = useDemo();
  const pendingCertificates =
    data?.certificates.filter((item) => item.status === "pending").length || 0;
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>(ADMIN_ROLES[0]);
  const current = adminNavigation.find(
    (item) => pathname === `/admin/${item.path}`,
  );
  return (
    <AdminContext.Provider
      value={{
        role,
        setRole,
        can: (permission) => permissions[role]?.includes(permission) ?? false,
      }}
    >
      <div className={`admin-shell density-${preferences.density}`}>
        {open && (
          <button
            className="admin-sidebar-overlay"
            aria-label="Menyunu bağla"
            onClick={() => setOpen(false)}
          />
        )}
        <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
          <Link className="admin-brand" href="/">
            <span className="admin-brand-emblem">
              <Landmark size={27} />
            </span>
            <span>
              <strong>SUMQAYIT</strong>
              <small>KOMMUNAL İDARƏETMƏ</small>
            </span>
          </Link>
          <button
            className="admin-sidebar-close admin-icon-button"
            onClick={() => setOpen(false)}
            aria-label="Menyunu bağla"
          >
            <X size={20} />
          </button>
          <div className="admin-workspace">
            <span className="admin-workspace-icon">
              <Building2 size={19} />
            </span>
            <span>
              <strong>Şəhər idarəetməsi</strong>
              <small>Sumqayıt MKTİB</small>
            </span>
            <ChevronDown size={15} />
          </div>
          <nav aria-label="İdarəetmə bölmələri">
            {adminNavigation.map(({ path, title, icon: Icon, group }) => (
              <div key={path}>
                {group && <p className="admin-nav-group">{group}</p>}
                <Link
                  href={`/admin/${path}`}
                  aria-current={
                    pathname === `/admin/${path}` ? "page" : undefined
                  }
                  className={`admin-nav-item ${pathname === `/admin/${path}` ? "active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  <span>{title}</span>
                  {path === "certificates" && pendingCertificates > 0 && (
                    <span className="admin-nav-count">
                      {pendingCertificates}
                    </span>
                  )}
                </Link>
              </div>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <div className="admin-security">
              <ShieldCheck size={19} />
              <span>
                <strong>İdarəetmə prototipi</strong>
                <small>Demo məlumatları ilə təqdimat</small>
              </span>
              <i />
            </div>
            <Link href="/">
              <ArrowUpRight size={16} /> Vətəndaş portalına keç
            </Link>
            <div className="admin-sidebar-version">
              Sumqayıt MKTİB <span>v1.0 demo</span>
            </div>
          </div>
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button
                className="admin-menu-button admin-icon-button"
                onClick={() => setOpen(true)}
                aria-label="Menyunu aç"
                aria-expanded={open}
              >
                <Menu size={22} />
              </button>
              <span className="admin-breadcrumb">
                <span>İdarəetmə paneli</span>
                <span>/</span>
                <strong>{current?.title || "Ümumi baxış"}</strong>
              </span>
            </div>
            <div className="admin-topbar-right">
              <span className="admin-demo-tag">
                <span /> DEMO MÜHİTİ
              </span>
              <Link
                className="admin-icon-button admin-help"
                href="/admin/system-architecture"
                aria-label="Sistem haqqında"
              >
                <CircleHelp size={20} />
              </Link>
              <span className="admin-topbar-divider" />
              <span className="admin-avatar">AA</span>
              <label className="admin-role-switch">
                <span>Demo rol seçimi</span>
                <select
                  aria-label="Demo istifadəçi rolunu seç"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  {ADMIN_ROLES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          </header>
          <main className="admin-content" id="admin-main-content">
            {children}
          </main>
          <footer className="admin-footer">
            <span>© 2026 Sumqayıt Şəhər Mənzil-Kommunal Təsərrüfatı</span>
            <span className="admin-partner-wordmark">
              FerstacLabs <i>·</i> 1Muhasib
            </span>
            <span>
              <LockKeyhole size={12} /> Bütün məlumatlar nümayiş üçündür
            </span>
          </footer>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
