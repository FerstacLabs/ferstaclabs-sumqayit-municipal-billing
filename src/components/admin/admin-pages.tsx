"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  Database,
  FileBadge,
  FileText,
  History,
  Info,
  Landmark,
  LockKeyhole,
  Network,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Store,
  TrendingUp,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { useDemo } from "@/lib/demo-context";
import {
  formatDate,
  formatMoney as formatCurrency,
  parseMoneyInput,
} from "@/lib/format";
import type {
  ActionResult,
  Building,
  CommercialObject,
  DemoAction,
  DemoState,
  Invoice,
  Property,
  ReconciliationRow,
  Role,
} from "@/lib/types";
import { ADMIN_ROLES, useAdminRole } from "./admin-shell";
import {
  defaultPreferences,
  useAdminPreferences,
  type AdminPreferences,
} from "./admin-preferences";

const labels: Record<string, string> = {
  active: "Aktiv",
  inactive: "Deaktiv",
  pending: "Gözləmədə",
  approved: "Təsdiqlənib",
  rejected: "İmtina edilib",
  issued: "Verilib",
  expired: "Müddəti bitib",
  unpaid: "Ödənilməyib",
  partial: "Qismən ödənilib",
  paid: "Ödənilib",
  success: "Uğurlu",
  failed: "Uğursuz",
  matched: "Uyğun gəlib",
  unmatched: "Üzləşdirilməyib",
  mismatch: "Fərq var",
  missing: "Tapılmayıb",
  duplicate: "Təkrar əməliyyat",
  open: "Açıq dövr",
  generated: "Hesablanıb",
  closed: "Bağlanıb",
  sms: "SMS OTP",
  sima: "SİMA",
  asan: "ASAN Login",
  residential: "Yaşayış",
  commercial: "Qeyri-yaşayış",
};
const roleNames: Record<Role, string> = {
  super_admin: "Baş administrator",
  finance_admin: "Maliyyə administratoru",
  area_manager: "Ərazi rəisi",
  operator: "Operator",
  document_officer: "Sənəd mütəxəssisi",
  auditor: "Auditor",
};
const monthNames = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "İyun",
  "İyul",
  "Avqust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];
function periodLabel(period: string) {
  const [year, month] = period.split("-");
  return `${monthNames[Number(month) - 1]} ${year}`;
}
function number(value: number) {
  return value.toLocaleString("az-AZ");
}
function formatMoney(cents: number) {
  return formatCurrency(cents).replace(" ₼", "");
}
function Badge({
  status,
  children,
}: {
  status?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`admin-badge status-${status || "neutral"}`}>
      <span />
      {children || labels[status || ""] || status}
    </span>
  );
}
function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        {eyebrow && <p className="admin-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="admin-page-actions">{action}</div>}
    </div>
  );
}
function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-panel ${className}`}>
      {title && (
        <div className="admin-panel-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
function Note({
  children,
  icon: Icon = Info,
}: {
  children: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="admin-note">
      <Icon size={18} />
      <div>{children}</div>
    </div>
  );
}
function Metric({
  title,
  value,
  note,
  icon: Icon,
  tone = "teal",
}: {
  title: string;
  value: ReactNode;
  note: string;
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <div className="admin-metric">
      <div className="admin-metric-top">
        <span>{title}</span>
        <span className={`admin-metric-icon tone-${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function SearchBox({
  value,
  onChange,
  placeholder = "Axtarış...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="admin-search">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button aria-label="Axtarışı təmizlə" onClick={() => onChange("")}>
          <X size={14} />
        </button>
      )}
    </label>
  );
}
function SelectFilter({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="admin-select"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
function exportCSV(
  name: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  const csv =
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(quote).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Column<T> = {
  title: string;
  cell: (row: T) => ReactNode;
  className?: string;
};
function DataTable<T>({
  rows,
  columns,
  rowKey,
  pageSize: requestedPageSize,
  empty = "Seçilmiş filtrlərə uyğun məlumat tapılmadı.",
  compact = false,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  pageSize?: number;
  empty?: string;
  compact?: boolean;
}) {
  const { preferences } = useAdminPreferences();
  const pageSize = requestedPageSize || preferences.pageSize;
  const [page, setPage] = useState(0);
  const maxPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  const current = Math.min(page, maxPage);
  const shown = rows.slice(current * pageSize, (current + 1) * pageSize);
  return (
    <>
      <div className={`admin-table-wrap ${compact ? "compact" : ""}`}>
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.title} className={column.className}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.title} className={column.className}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="admin-empty">
            <Search size={27} />
            <strong>Məlumat tapılmadı</strong>
            <p>{empty}</p>
          </div>
        )}
      </div>
      {!compact && (
        <div className="admin-table-footer">
          <span>
            {rows.length ? current * pageSize + 1 : 0}–
            {Math.min((current + 1) * pageSize, rows.length)} /{" "}
            {number(rows.length)} qeyd
          </span>
          <div>
            <button
              aria-label="Əvvəlki səhifə"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {current + 1} / {maxPage + 1}
            </span>
            <button
              aria-label="Növbəti səhifə"
              disabled={current === maxPage}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function Modal({
  title,
  subtitle,
  onClose,
  children,
  drawer = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = ref.current;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ) || [],
      );
    focusable()[0]?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className={`admin-modal-backdrop ${drawer ? "drawer" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="admin-modal"
      >
        <div className="admin-modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Pəncərəni bağla"
          >
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
type ActionContextValue = {
  run: (action: DemoAction) => Promise<ActionResult | null>;
  busy: boolean;
};
const ActionContext = createContext<ActionContextValue>({
  run: async () => null,
  busy: false,
});
const useAction = () => useContext(ActionContext);

export function AdminPageContent({ section }: { section: string }) {
  const { data, loading, error, refresh, act } = useDemo();
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  async function run(action: DemoAction) {
    setBusy(true);
    try {
      const result = await act(action);
      setNotice({ text: result.message, error: false });
      return result;
    } catch (err) {
      setNotice({
        text:
          err instanceof Error
            ? err.message
            : "Əməliyyatı tamamlamaq mümkün olmadı.",
        error: true,
      });
      return null;
    } finally {
      setBusy(false);
    }
  }
  if (loading && !data)
    return (
      <div className="admin-loading">
        <RefreshCw className="admin-spin" size={30} />
        <h2>İdarəetmə paneli yüklənir</h2>
        <p>Nümayiş məlumatları hazırlanır...</p>
      </div>
    );
  if (!data)
    return (
      <div className="admin-empty">
        <CircleAlert size={30} />
        <h2>Məlumatları yükləmək mümkün olmadı</h2>
        <p>{error}</p>
        <button className="admin-button primary" onClick={() => refresh()}>
          Yenidən cəhd et
        </button>
      </div>
    );
  const pages: Record<string, ReactNode> = {
    dashboard: <Dashboard data={data} />,
    buildings: <Buildings data={data} />,
    properties: <Properties data={data} />,
    residents: <Residents data={data} />,
    invoices: <Invoices data={data} />,
    reports: <Reports data={data} />,
    settings: <Settings data={data} />,
    "commercial-objects": <CommercialObjects data={data} />,
    tariffs: <Tariffs data={data} />,
    billing: <Billing data={data} />,
    payments: <Payments data={data} />,
    reconciliation: <Reconciliation data={data} />,
    certificates: <Certificates data={data} />,
    "users-roles": <UsersRoles data={data} />,
    "audit-log": <AuditLog data={data} />,
    "system-architecture": <Architecture />,
  };
  return (
    <ActionContext.Provider value={{ run, busy }}>
      {notice && (
        <div
          role={notice.error ? "alert" : "status"}
          className={`admin-toast ${notice.error ? "error" : ""}`}
        >
          <CheckCircle2 size={19} />
          <span>{notice.text}</span>
          <button aria-label="Bildirişi bağla" onClick={() => setNotice(null)}>
            <X size={17} />
          </button>
        </div>
      )}
      {pages[section]}
    </ActionContext.Provider>
  );
}

function Dashboard({ data }: { data: DemoState }) {
  const { preferences } = useAdminPreferences();
  const [selectedPeriod, setPeriod] = useState<string | null>(null);
  const period = selectedPeriod || preferences.period;
  const monthPayments = data.payments.filter((payment) =>
    payment.createdAt.startsWith(period),
  );
  const monthInvoices = data.invoices.filter(
    (invoice) => invoice.period === period,
  );
  const collected = monthPayments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const balance = data.properties.reduce(
    (sum, property) => sum + property.balanceCents,
    0,
  );
  const success = monthPayments.length
    ? Math.round(
        (monthPayments.filter((payment) => payment.status === "success")
          .length /
          monthPayments.length) *
          100,
      )
    : 0;
  const chartData = Array.from({ length: 6 }, (_, index) => {
    const d = new Date(`${period}-01T12:00:00`);
    d.setMonth(d.getMonth() - 5 + index);
    const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      name: monthNames[d.getMonth()].slice(0, 3),
      toplanan: data.payments
        .filter(
          (payment) =>
            payment.createdAt.startsWith(p) && payment.status === "success",
        )
        .reduce((sum, payment) => sum + payment.amountCents / 100, 0),
      hesablanan: data.invoices
        .filter((invoice) => invoice.period === p)
        .reduce((sum, invoice) => sum + invoice.totalCents / 100, 0),
    };
  });
  const areaDebts = data.areas
    .map((area) => ({
      name: area.name,
      borc: Math.round(
        data.properties
          .filter((property) => property.areaId === area.id)
          .reduce((sum, property) => sum + property.balanceCents, 0) / 100,
      ),
    }))
    .sort((a, b) => b.borc - a.borc)
    .slice(0, 5);
  const distribution = [
    { name: "Yaşayış sahələri", value: data.properties.length },
    { name: "Qeyri-yaşayış", value: data.commercialObjects.length },
  ];
  return (
    <>
      <PageHeader
        eyebrow="ŞƏHƏRİN MALİYYƏ GÖSTƏRİCİLƏRİ"
        title="Ümumi baxış"
        description="Sumqayıt üzrə kommunal xidmətlər və ödənişlərin cari vəziyyəti."
        action={
          <>
            <label className="admin-date-filter">
              <CalendarDays size={17} />
              <select
                aria-label="Hesabat ayı"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                {[
                  ...new Set([
                    period,
                    ...data.billingPeriods.map((item) => item.period),
                  ]),
                ]
                  .sort()
                  .reverse()
                  .map((p) => (
                    <option key={p} value={p}>
                      {periodLabel(p)}
                    </option>
                  ))}
              </select>
            </label>
            <button
              className="admin-button"
              onClick={() =>
                exportCSV(
                  `hesabat-${period}`,
                  ["Göstərici", "Dəyər"],
                  [
                    ["Mənzillər", data.properties.length],
                    ["Aylıq hesablamalar", monthInvoices.length],
                    ["Toplanan (AZN)", collected / 100],
                    ["Borc (AZN)", balance / 100],
                  ],
                )
              }
            >
              <ArrowDownToLine size={16} /> Hesabatı yüklə
            </button>
          </>
        }
      />
      <div className="admin-overview-banner">
        <div>
          <span className="admin-live-dot" />
          <strong>Sistem normal işləyir</strong>
          <span>
            {data.areas.length} xidmət ərazisi üzrə məlumatlar bir mərkəzdə
          </span>
        </div>
        <span>
          <Clock3 size={14} /> Son yenilənmə:{" "}
          {new Date(data.updatedAt).toLocaleTimeString("az-AZ", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="admin-metrics five">
        <Metric
          title="Ümumi əmlak sayı"
          value={number(data.properties.length + data.commercialObjects.length)}
          note={`${data.buildings.length} bina · ${data.areas.length} ərazi`}
          icon={Building2}
        />
        <Metric
          title="Aylıq hesablamalar"
          value={number(monthInvoices.length)}
          note={periodLabel(period)}
          icon={FileText}
          tone="blue"
        />
        <Metric
          title="Toplanan məbləğ"
          value={
            <>
              {formatMoney(collected)} <em>₼</em>
            </>
          }
          note="Uğurlu əməliyyatların cəmi"
          icon={Wallet}
        />
        <Metric
          title="Ödənilməmiş məbləğ"
          value={
            <>
              {formatMoney(balance)} <em>₼</em>
            </>
          }
          note="Bütün mənzillərin cari balansı"
          icon={Clock3}
          tone="orange"
        />
        <Metric
          title="Ödəniş uğuru"
          value={
            <>
              {success}
              <em>%</em>
            </>
          }
          note={`${monthPayments.length} əməliyyat əsasında`}
          icon={TrendingUp}
        />
      </div>
      <div className="admin-dashboard-charts">
        <Panel
          title="Ödəniş dinamikası"
          subtitle="Son 6 ay üzrə toplanan və hesablanan məbləğlər"
          action={<span className="admin-chart-unit">AZN</span>}
        >
          <div className="admin-chart-legend">
            <span>
              <i className="teal" />
              Toplanan məbləğ
            </span>
            <span>
              <i className="pale" />
              Hesablanan məbləğ
            </span>
          </div>
          <div className="admin-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 12, right: 20, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="collectionFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#159c91" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#159c91" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="#edf1f4"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#81909e" }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#81909e" }}
                  width={48}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value).toFixed(2)} ₼`,
                    name === "toplanan" ? "Toplanan" : "Hesablanan",
                  ]}
                  contentStyle={{
                    border: "1px solid #e5ecef",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="hesablanan"
                  stroke="#b4c4d8"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
                <Area
                  type="monotone"
                  dataKey="toplanan"
                  stroke="#13998e"
                  fill="url(#collectionFill)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="Əmlak bölgüsü"
          subtitle="Sistemdə qeydiyyatda olan əmlaklar"
        >
          <div className="admin-donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  innerRadius={67}
                  outerRadius={89}
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={4}
                >
                  <Cell fill="#159c91" />
                  <Cell fill="#d5e8ec" />
                </Pie>
                <Tooltip formatter={(value) => [`${value} əmlak`, "Say"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="admin-donut-label">
              <strong>
                {number(data.properties.length + data.commercialObjects.length)}
              </strong>
              <span>ümumi əmlak</span>
            </div>
          </div>
          <div className="admin-distribution">
            {distribution.map((item, index) => (
              <div key={item.name}>
                <span>
                  <i className={index === 0 ? "teal" : "pale"} />
                  {item.name}
                </span>
                <strong>
                  {item.value}
                  <small>
                    {Math.round(
                      (item.value /
                        (data.properties.length +
                          data.commercialObjects.length)) *
                        100,
                    )}
                    %
                  </small>
                </strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="admin-dashboard-bottom">
        <Panel
          title="Son ödənişlər"
          subtitle="Son daxil olan əməliyyatlar"
          action={
            <Link className="admin-text-link" href="/admin/payments">
              Hamısına bax <ArrowRight size={14} />
            </Link>
          }
        >
          <DataTable
            compact
            rows={[...data.payments]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 5)}
            rowKey={(row) => row.id}
            columns={[
              {
                title: "ÖDƏNİŞ KODU",
                cell: (row) => (
                  <span className="admin-mono">{row.propertyCode}</span>
                ),
              },
              { title: "PROVAYDER", cell: (row) => row.provider },
              {
                title: "MƏBLƏĞ",
                cell: (row) => (
                  <strong>{formatMoney(row.amountCents)} ₼</strong>
                ),
              },
              { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            ]}
          />
        </Panel>
        <Panel
          title="Ərazilər üzrə borc"
          subtitle="Ən yüksək borcu olan 5 xidmət ərazisi"
        >
          <div className="admin-area-debts">
            {areaDebts.map((area) => (
              <div key={area.name}>
                <div>
                  <span>{area.name}</span>
                  <strong>{number(area.borc)} ₼</strong>
                </div>
                <div className="admin-progress">
                  <span
                    style={{
                      width: `${(area.borc / (areaDebts[0]?.borc || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/properties" className="admin-panel-bottom-link">
            Əmlak reyestrinə keç <ArrowUpRight size={15} />
          </Link>
        </Panel>
      </div>
      <Panel
        title="Son sistem hadisələri"
        action={
          <Link className="admin-text-link" href="/admin/audit-log">
            Audit jurnalını aç <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="admin-activity-strip">
          {data.auditEvents
            .slice(-3)
            .reverse()
            .map((event) => (
              <div key={event.id}>
                <span className="admin-activity-icon">
                  <Activity size={17} />
                </span>
                <div>
                  <strong>{event.action}</strong>
                  <p>
                    {event.actor} · {event.module}
                  </p>
                  <small>{formatDate(event.createdAt)}</small>
                </div>
              </div>
            ))}
        </div>
      </Panel>
    </>
  );
}

function Buildings({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");
  const [street, setStreet] = useState("");
  const [editing, setEditing] = useState<Building | "new" | null>(null);
  const { can } = useAdminRole();
  const rows = data.buildings.filter(
    (building) =>
      (!area || building.areaId === area) &&
      (!status || building.status === status) &&
      (!street || building.street === street) &&
      `${building.street} ${building.number}`
        .toLocaleLowerCase("az")
        .includes(search.toLocaleLowerCase("az")),
  );
  return (
    <>
      <PageHeader
        eyebrow="ƏMLAK REYESTRİ"
        title="Binalar"
        description="Yaşayış binaları, girişlər və ərazi üzrə xidmət məlumatları."
        action={
          <button
            className="admin-button primary"
            disabled={!can("buildings")}
            onClick={() => setEditing("new")}
          >
            <Plus size={17} /> Yeni bina
          </button>
        }
      />
      <div className="admin-metrics three">
        <Metric
          title="Ümumi bina"
          value={data.buildings.length}
          note={`${data.areas.length} xidmət ərazisində`}
          icon={Building2}
        />
        <Metric
          title="Mənzil tutumu"
          value={number(
            data.buildings.reduce((sum, b) => sum + b.apartments, 0),
          )}
          note="Bina reyestrində qeyd olunan mənzillər"
          icon={Landmark}
          tone="blue"
        />
        <Metric
          title="Aktiv binalar"
          value={data.buildings.filter((b) => b.status === "active").length}
          note="Hazırda xidmət göstərilən binalar"
          icon={CheckCircle2}
        />
      </div>
      <Panel title="Bina reyestri" subtitle={`${rows.length} bina göstərilir`}>
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Küçə və ya bina nömrəsi..."
          />
          <SelectFilter
            label="Bütün ərazilər"
            value={area}
            onChange={setArea}
            options={data.areas.map((a) => ({ value: a.id, label: a.name }))}
          />
          <SelectFilter
            label="Bütün küçələr"
            value={street}
            onChange={setStreet}
            options={[...new Set(data.buildings.map((b) => b.street))].map(
              (s) => ({ value: s, label: s }),
            )}
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={[
              { value: "active", label: "Aktiv" },
              { value: "inactive", label: "Deaktiv" },
            ]}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "BİNA",
              cell: (row) => (
                <div className="admin-cell-icon">
                  <span>
                    <Building2 size={17} />
                  </span>
                  <div>
                    <strong>Bina {row.number}</strong>
                    <small>{row.street}</small>
                  </div>
                </div>
              ),
            },
            {
              title: "ƏRAZİ",
              cell: (row) => data.areas.find((a) => a.id === row.areaId)?.name,
            },
            { title: "GİRİŞ SAYI", cell: (row) => row.entrances },
            { title: "MƏNZİL SAYI", cell: (row) => row.apartments },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "ƏMƏLİYYAT",
              cell: (row) => (
                <button
                  className="admin-table-action"
                  disabled={!can("buildings")}
                  onClick={() => setEditing(row)}
                  aria-label={`Bina ${row.number} məlumatlarını dəyiş`}
                >
                  <Pencil size={15} /> Düzəliş
                </button>
              ),
            },
          ]}
        />
      </Panel>
      {editing && (
        <BuildingEditor
          data={data}
          building={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
function BuildingEditor({
  data,
  building,
  onClose,
}: {
  data: DemoState;
  building?: Building;
  onClose: () => void;
}) {
  const { run, busy } = useAction();
  const [areaId, setAreaId] = useState(
    building?.areaId || data.areas[0]?.id || "",
  );
  const [street, setStreet] = useState(building?.street || "");
  const [buildingNumber, setBuildingNumber] = useState(building?.number || "");
  const [entrances, setEntrances] = useState(building?.entrances || 1);
  const [apartments, setApartments] = useState(building?.apartments || 1);
  const [status, setStatus] = useState<"active" | "inactive">(
    building?.status || "active",
  );
  async function save(event: FormEvent) {
    event.preventDefault();
    const result = await run({
      type: "save_building",
      building: {
        id: building?.id,
        areaId,
        street: street.trim(),
        number: buildingNumber.trim(),
        entrances,
        apartments,
        status,
      },
    });
    if (result) onClose();
  }
  return (
    <Modal
      title={
        building ? `Bina ${building.number} · Düzəliş` : "Yeni bina əlavə et"
      }
      subtitle="Dəyişikliklər demo reyestrində saxlanılır və audit jurnalına yazılır."
      onClose={onClose}
    >
      <form onSubmit={save} className="admin-form">
        <label>
          Xidmət ərazisi
          <select
            required
            value={areaId}
            onChange={(event) => setAreaId(event.target.value)}
          >
            {data.areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Küçə
          <input
            required
            maxLength={120}
            value={street}
            onChange={(event) => setStreet(event.target.value)}
            placeholder="Məsələn, Sülh küçəsi"
          />
        </label>
        <div className="admin-form-row">
          <label>
            Bina nömrəsi
            <input
              required
              maxLength={20}
              value={buildingNumber}
              onChange={(event) => setBuildingNumber(event.target.value)}
            />
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "active" | "inactive")
              }
            >
              <option value="active">Aktiv</option>
              <option value="inactive">Deaktiv</option>
            </select>
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Giriş sayı
            <input
              type="number"
              min={1}
              max={50}
              required
              value={entrances}
              onChange={(event) => setEntrances(Number(event.target.value))}
            />
          </label>
          <label>
            Mənzil sayı
            <input
              type="number"
              min={1}
              max={2000}
              required
              value={apartments}
              onChange={(event) => setApartments(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>
            Ləğv et
          </button>
          <button className="admin-button primary" disabled={busy}>
            <Check size={16} />
            {busy ? "Saxlanılır..." : "Dəyişiklikləri saxla"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Properties({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.properties.find((p) => p.id === selectedId);
  const rows = data.properties.filter(
    (p) =>
      (!area || p.areaId === area) &&
      (!status || p.status === status) &&
      `${p.paymentCode} ${p.internalCode} ${p.address}`
        .toLocaleLowerCase("az")
        .includes(search.toLocaleLowerCase("az")),
  );
  return (
    <>
      <PageHeader
        eyebrow="ƏMLAK REYESTRİ"
        title="Mənzillər və əmlaklar"
        description="Mənzil hesabları, sakin məlumatları və borc balansına vahid baxış."
        action={
          <button
            className="admin-button"
            onClick={() =>
              exportCSV(
                "menzil-reyestri",
                [
                  "Ödəniş kodu",
                  "Daxili kod",
                  "Ünvan",
                  "Sahə",
                  "Sakin",
                  "Balans AZN",
                ],
                rows.map((p) => [
                  p.paymentCode,
                  p.internalCode,
                  p.address,
                  p.areaSqm,
                  p.residents,
                  p.balanceCents / 100,
                ]),
              )
            }
          >
            <ArrowDownToLine size={16} /> Reyestri yüklə
          </button>
        }
      />
      <Note>
        <strong>Ödəniş kodu mənzilə aiddir.</strong> Mənzil satıldıqda 12
        rəqəmli açıq ödəniş kodu dəyişmir. Strukturlaşdırılmış daxili kod yalnız
        uçot üçündür.
      </Note>
      <Panel
        title="Mənzil reyestri"
        subtitle={`${data.properties.length} qeydiyyatda olan mənzil`}
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Ödəniş kodu, daxili kod və ya ünvan..."
          />
          <SelectFilter
            label="Bütün ərazilər"
            value={area}
            onChange={setArea}
            options={data.areas.map((a) => ({ value: a.id, label: a.name }))}
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={[
              { value: "active", label: "Aktiv" },
              { value: "inactive", label: "Deaktiv" },
            ]}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "ÖDƏNİŞ KODU / ÜNVAN",
              cell: (row) => (
                <button
                  className="admin-property-link"
                  onClick={() => setSelectedId(row.id)}
                >
                  <strong className="admin-mono">{row.paymentCode}</strong>
                  <small>{row.address}</small>
                  <span className="admin-internal-code">
                    {row.internalCode}
                  </span>
                </button>
              ),
            },
            { title: "SAHƏ", cell: (row) => `${row.areaSqm} m²` },
            {
              title: "SAKİN",
              cell: (row) => (
                <span className="admin-inline-icon">
                  <UsersRound size={14} />
                  {row.residents}
                </span>
              ),
            },
            { title: "MÜLKİYYƏTÇİ", cell: (row) => row.ownerMasked },
            {
              title: "BORC",
              cell: (row) => (
                <strong
                  className={
                    row.balanceCents > 0
                      ? "admin-amount-due"
                      : "admin-amount-paid"
                  }
                >
                  {formatMoney(row.balanceCents)} ₼
                </strong>
              ),
            },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "BAXIŞ",
              cell: (row) => (
                <button
                  className="admin-icon-button"
                  aria-label={`${row.paymentCode} mənzilinə bax`}
                  onClick={() => setSelectedId(row.id)}
                >
                  <ArrowUpRight size={17} />
                </button>
              ),
            },
          ]}
        />
      </Panel>
      {selected && (
        <PropertyDrawer
          property={selected}
          data={data}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
function PropertyDrawer({
  property,
  data,
  onClose,
}: {
  property: Property;
  data: DemoState;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("invoices");
  const invoices = data.invoices.filter(
    (invoice) => invoice.propertyId === property.id,
  );
  const audit = data.auditEvents.filter((event) =>
    `${event.oldValue} ${event.newValue} ${event.reason}`.includes(
      property.paymentCode,
    ),
  );
  return (
    <Modal
      drawer
      title={`Mənzil ${property.apartment}`}
      subtitle={property.address}
      onClose={onClose}
    >
      <div className="admin-drawer-content">
        <div className="admin-property-summary">
          <span className="admin-property-symbol">
            <Landmark size={30} />
          </span>
          <div>
            <small>DAİMİ ÖDƏNİŞ KODU</small>
            <strong className="admin-mono">{property.paymentCode}</strong>
            <span>{property.internalCode}</span>
          </div>
          <Badge status={property.status} />
        </div>
        <div className="admin-detail-grid">
          <div>
            <span>Sahə</span>
            <strong>{property.areaSqm} m²</strong>
          </div>
          <div>
            <span>Qeydiyyatda olan sakin</span>
            <strong>{property.residents} nəfər</strong>
          </div>
          <div>
            <span>Mülkiyyətçi</span>
            <strong>{property.ownerMasked}</strong>
          </div>
          <div>
            <span>Cari borc</span>
            <strong className="admin-amount-due">
              {formatMoney(property.balanceCents)} ₼
            </strong>
          </div>
        </div>
        <div className="admin-tabs">
          {[
            { id: "invoices", label: "Hesab tarixçəsi" },
            { id: "snapshot", label: "Sakin məlumatları" },
            { id: "owners", label: "Mülkiyyət tarixçəsi" },
            { id: "audit", label: "Audit" },
          ].map((item) => (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === "invoices" && (
          <DataTable
            rows={invoices}
            rowKey={(row) => row.id}
            columns={[
              { title: "DÖVR", cell: (row) => periodLabel(row.period) },
              {
                title: "HESAB",
                cell: (row) => `${formatMoney(row.totalCents)} ₼`,
              },
              {
                title: "ÖDƏNİLƏN",
                cell: (row) => `${formatMoney(row.paidCents)} ₼`,
              },
              { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            ]}
          />
        )}{" "}
        {tab === "snapshot" && (
          <>
            <Note>
              Hər hesab formalaşarkən sakin sayı, mənzilin sahəsi və tariflər
              ayrıca saxlanılır. Sonrakı dəyişiklik əvvəlki hesaba təsir etmir.
            </Note>
            {invoices.length ? (
              invoices.map((invoice) => (
                <div className="admin-snapshot" key={invoice.id}>
                  <strong>{periodLabel(invoice.period)}</strong>
                  <span>
                    {invoice.snapshot.residents} sakin ·{" "}
                    {invoice.snapshot.areaSqm} m²
                  </span>
                  <small>
                    Zibil: {formatMoney(invoice.snapshot.wasteUnitCents)} ₼ /
                    nəfər · Ev: {formatMoney(invoice.snapshot.housingUnitCents)}{" "}
                    ₼ / m²
                  </small>
                </div>
              ))
            ) : (
              <div className="admin-empty">
                Bu mənzil üçün hələ hesab yaradılmayıb.
              </div>
            )}
          </>
        )}{" "}
        {tab === "owners" && (
          <div className="admin-timeline">
            {property.ownerHistory.map((owner, index) => (
              <div key={`${owner.from}-${index}`}>
                <span className="admin-timeline-dot" />
                <strong>{owner.ownerMasked}</strong>
                <p>
                  {formatDate(owner.from)} —{" "}
                  {owner.to ? formatDate(owner.to) : "hazırda"}
                </p>
                <small>Ödəniş kodu saxlanılıb: {property.paymentCode}</small>
              </div>
            ))}
          </div>
        )}{" "}
        {tab === "audit" && (
          <div className="admin-timeline">
            {audit.length ? (
              audit.map((event) => (
                <div key={event.id}>
                  <span className="admin-timeline-dot" />
                  <strong>{event.action}</strong>
                  <p>
                    {event.actor} · {formatDate(event.createdAt)}
                  </p>
                  <small>{event.reason}</small>
                </div>
              ))
            ) : (
              <div className="admin-empty">
                <History size={24} />
                <p>Bu mənzil üzrə ayrıca audit qeydi yoxdur.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function CommercialObjects({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = data.commercialObjects.find((item) => item.id === editingId);
  const { can } = useAdminRole();
  const rows = data.commercialObjects.filter(
    (item) =>
      (!status || item.approvalStatus === status) &&
      (!type || item.type === type) &&
      `${item.code} ${item.name} ${item.address}`
        .toLocaleLowerCase("az")
        .includes(search.toLocaleLowerCase("az")),
  );
  return (
    <>
      <PageHeader
        eyebrow="ƏMLAK REYESTRİ"
        title="Qeyri-yaşayış obyektləri"
        description="Kommersiya obyektləri və fərdi xidmət tariflərinin təsdiq prosesi."
      />
      <div className="admin-metrics three">
        <Metric
          title="Qeydiyyatda olan obyekt"
          value={data.commercialObjects.length}
          note="Mağaza, klinika, market və ofislər"
          icon={Store}
        />
        <Metric
          title="Təsdiq gözləyən tarif"
          value={
            data.commercialObjects.filter(
              (item) => item.approvalStatus === "pending",
            ).length
          }
          note="Ərazi rəisinin təqdim etdiyi təkliflər"
          icon={Clock3}
          tone="orange"
        />
        <Metric
          title="Təsdiqlənmiş tarif"
          value={
            data.commercialObjects.filter(
              (item) => item.approvalStatus === "approved",
            ).length
          }
          note="Hesablamaya tətbiq edilə bilər"
          icon={CheckCircle2}
        />
      </div>
      <Note>
        <strong>Fərdi tarif təsdiq prosesi:</strong> Ərazi təmizlik rəisi
        məbləği təyin edir → səlahiyyətli şəxs təklifi yoxlayır → təsdiqdən
        sonra tarif qüvvəyə minir.
      </Note>
      <Panel title="Obyekt reyestri">
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Obyektin adı, kodu və ya ünvanı..."
          />
          <SelectFilter
            label="Bütün obyekt növləri"
            value={type}
            onChange={setType}
            options={[
              ...new Set(data.commercialObjects.map((item) => item.type)),
            ].map((value) => ({ value, label: value }))}
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={["pending", "approved", "rejected"].map((value) => ({
              value,
              label: labels[value],
            }))}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "OBYEKT",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong>{row.name}</strong>
                  <span className="admin-mono">{row.code}</span>
                  <small>{row.address}</small>
                </div>
              ),
            },
            {
              title: "NÖV / SAHƏ",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span>{row.type}</span>
                  <small>{row.areaSqm} m²</small>
                </div>
              ),
            },
            {
              title: "AYLIQ TARİF",
              cell: (row) => <strong>{formatMoney(row.tariffCents)} ₼</strong>,
            },
            { title: "ƏRAZİ RƏİSİ", cell: (row) => row.manager },
            {
              title: "TƏSDİQ STATUSU",
              cell: (row) => <Badge status={row.approvalStatus} />,
            },
            {
              title: "ƏMƏLİYYAT",
              cell: (row) => {
                const tariff = data.tariffs.find(
                  (t) => t.commercialObjectId === row.id,
                );
                return (
                  <div className="admin-row-actions">
                    {tariff && row.approvalStatus === "pending" ? (
                      <button
                        className="admin-table-action"
                        disabled={!can("commercial")}
                        onClick={() => setSelectedId(tariff.id)}
                      >
                        Təklifi yoxla <ArrowRight size={14} />
                      </button>
                    ) : (
                      <span className="admin-muted">
                        {row.approvalStatus === "approved"
                          ? "Qüvvədədir"
                          : "Baxış tamamlanıb"}
                      </span>
                    )}
                    <button
                      className="admin-icon-button"
                      disabled={!can("commercial")}
                      onClick={() => setEditingId(row.id)}
                      aria-label={`${row.code} tarifini dəyiş`}
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      </Panel>
      {selectedId && (
        <TariffReview
          data={data}
          tariffId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
      {editing && (
        <CommercialTariffEditor
          object={editing}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}

function CommercialTariffEditor({
  object,
  onClose,
}: {
  object: CommercialObject;
  onClose: () => void;
}) {
  const { run, busy } = useAction();
  const [amount, setAmount] = useState((object.tariffCents / 100).toFixed(2));
  const [effectiveDate, setEffectiveDate] = useState("2026-10-01");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    try {
      const response = await run({
        type: "save_commercial_tariff",
        commercialObjectId: object.id,
        amountCents: parseMoneyInput(amount),
        effectiveDate,
        reason,
      });
      if (response) onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Məbləği yoxlayın.");
    }
  }
  return (
    <Modal
      title="Fərdi tarif təklifi"
      subtitle={`${object.code} · ${object.name}`}
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-row">
          <label>
            Aylıq tarif, AZN
            <input
              required
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError("");
              }}
            />
          </label>
          <label>
            Qüvvəyə minmə tarixi
            <input
              type="date"
              required
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </label>
        </div>
        <label>
          Təklifin əsası
          <textarea
            required
            minLength={3}
            maxLength={500}
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <Note>
          Təklif təsdiq növbəsinə göndərilir. Cari tarif təsdiq qərarınadək
          dəyişmir.
        </Note>
        {error && (
          <div className="admin-preference-message error" role="alert">
            {error}
          </div>
        )}
        <div className="admin-modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>
            Ləğv et
          </button>
          <button className="admin-button primary" disabled={busy}>
            {busy ? "Göndərilir…" : "Təsdiqə göndər"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TariffReview({
  data,
  tariffId,
  onClose,
}: {
  data: DemoState;
  tariffId: string;
  onClose: () => void;
}) {
  const tariff = data.tariffs.find((item) => item.id === tariffId);
  const [reason, setReason] = useState("");
  const { run, busy } = useAction();
  if (!tariff) return null;
  const object = data.commercialObjects.find(
    (item) => item.id === tariff.commercialObjectId,
  );
  async function review(status: "approved" | "rejected") {
    const result = await run({
      type: "approve_tariff",
      tariffId,
      status,
      reason:
        reason.trim() ||
        (status === "approved"
          ? "Fərdi tarif yoxlanılaraq təsdiqləndi."
          : "Tarif təklifi yenidən baxılması üçün qaytarıldı."),
    });
    if (result) onClose();
  }
  return (
    <Modal
      title="Tarif təklifinin yoxlanılması"
      subtitle={object?.name || tariff.name}
      onClose={onClose}
    >
      <div className="admin-form">
        <div className="admin-approval-steps">
          <span className="done">
            <Check size={16} /> Təklif yaradılıb
          </span>
          <ArrowRight size={15} />
          <span className="current">2. Yoxlanış</span>
          <ArrowRight size={15} />
          <span>3. Qüvvəyə minmə</span>
        </div>
        <div className="admin-detail-grid">
          <div>
            <span>Təklif olunan tarif</span>
            <strong>
              {formatMoney(tariff.amountCents)} ₼ / {tariff.unit}
            </strong>
          </div>
          <div>
            <span>Qüvvəyə minmə tarixi</span>
            <strong>{formatDate(tariff.effectiveDate)}</strong>
          </div>
          <div>
            <span>Təqdim edən</span>
            <strong>{tariff.createdBy}</strong>
          </div>
          <div>
            <span>Obyektin sahəsi</span>
            <strong>{object?.areaSqm || "—"} m²</strong>
          </div>
        </div>
        <label>
          Qərarın əsası / qeyd
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Yoxlanış barədə qeydinizi yazın..."
          />
        </label>
        <Note>
          Qərar tarifin statusunu dəyişir və audit jurnalına əlavə olunur.
        </Note>
        <div className="admin-modal-actions">
          <button
            className="admin-button danger"
            disabled={busy}
            onClick={() => review("rejected")}
          >
            İmtina et
          </button>
          <button
            className="admin-button primary"
            disabled={busy}
            onClick={() => review("approved")}
          >
            <Check size={16} />
            {busy ? "İcra olunur..." : "Tarifi təsdiqlə"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Tariffs({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { can } = useAdminRole();
  const residential = data.tariffs.filter((t) => t.type === "residential");
  const commercial = data.tariffs.filter(
    (t) =>
      t.type === "commercial" &&
      (!status || t.status === status) &&
      t.name.toLocaleLowerCase("az").includes(search.toLocaleLowerCase("az")),
  );
  return (
    <>
      <PageHeader
        eyebrow="TARİF İDARƏETMƏSİ"
        title="Tariflər"
        description="Yaşayış sahələri üçün vahid, kommersiya obyektləri üçün fərdi tariflər."
      />
      <div className="admin-tariff-cards">
        {residential.map((tariff, index) => (
          <div className="admin-tariff-card" key={tariff.id}>
            <span className="admin-tariff-symbol">
              {index ? <Building2 size={25} /> : <RefreshCw size={25} />}
            </span>
            <div>
              <span>YAŞAYIŞ SAHƏLƏRİ</span>
              <h2>{tariff.name}</h2>
              <p>
                {index
                  ? "Kupçada göstərilən sahəyə əsasən"
                  : "Qeydiyyatda olan sakin sayına əsasən"}
              </p>
            </div>
            <strong>
              {formatMoney(tariff.amountCents)} <small>₼ / {tariff.unit}</small>
            </strong>
            <Badge status={tariff.status} />
          </div>
        ))}
      </div>
      <Panel title="Yaşayış tariflərinin məlumatları">
        <DataTable
          compact
          rows={residential}
          rowKey={(row) => row.id}
          columns={[
            { title: "TARİF", cell: (row) => row.name },
            {
              title: "QÜVVƏYƏ MİNMƏ",
              cell: (row) => formatDate(row.effectiveDate),
            },
            { title: "YARADAN", cell: (row) => row.createdBy },
            { title: "TƏSDİQLƏYƏN", cell: (row) => row.approvedBy || "—" },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
          ]}
        />
      </Panel>
      <Panel
        title="Kommersiya obyektlərinin fərdi tarifləri"
        subtitle="Tariflər təsdiq edildikdən sonra hesablamaya daxil edilir"
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tarif və ya obyekt adı..."
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={["pending", "approved", "rejected"].map((value) => ({
              value,
              label: labels[value],
            }))}
          />
        </div>
        <DataTable
          rows={commercial}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "TARİF / OBYEKT",
              cell: (row) => <strong>{row.name}</strong>,
            },
            {
              title: "MƏBLƏĞ",
              cell: (row) => `${formatMoney(row.amountCents)} ₼ / ${row.unit}`,
            },
            {
              title: "QÜVVƏYƏ MİNMƏ",
              cell: (row) => formatDate(row.effectiveDate),
            },
            {
              title: "YARADAN / TƏSDİQLƏYƏN",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span>{row.createdBy}</span>
                  <small>{row.approvedBy || "Təsdiq gözlənilir"}</small>
                </div>
              ),
            },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "ƏMƏLİYYAT",
              cell: (row) =>
                row.status === "pending" ? (
                  <button
                    className="admin-table-action"
                    disabled={!can("commercial")}
                    onClick={() => setSelectedId(row.id)}
                  >
                    Yoxla <ArrowRight size={14} />
                  </button>
                ) : (
                  <span className="admin-muted">Tamamlanıb</span>
                ),
            },
          ]}
        />
      </Panel>
      {selectedId && (
        <TariffReview
          data={data}
          tariffId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

function Billing({ data }: { data: DemoState }) {
  const [period, setPeriod] = useState("2026-10");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { run, busy } = useAction();
  const { can } = useAdminRole();
  const selected = data.invoices.find((invoice) => invoice.id === selectedId);
  const rows = data.invoices.filter(
    (invoice) =>
      (!filterPeriod || invoice.period === filterPeriod) &&
      invoice.propertyCode.includes(search),
  );
  return (
    <>
      <PageHeader
        eyebrow="MALİYYƏ İDARƏETMƏSİ"
        title="Aylıq hesablamalar"
        description="Hesab dövrləri, tarif tətbiqi və mənzil üzrə hesab sətirləri."
      />
      <div className="admin-billing-action">
        <span className="admin-billing-icon">
          <ReceiptTextIcon />
        </span>
        <div>
          <h2>Yeni ay üçün hesabları yarat</h2>
          <p>Aktiv mənzillərin hər biri üçün zibil və ev pulu hesablanır.</p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void run({ type: "generate_billing", period });
          }}
        >
          <input
            type="month"
            aria-label="Hesablama ayı"
            value={period}
            min="2026-01"
            max="2030-12"
            required
            onChange={(event) => setPeriod(event.target.value)}
          />
          <button
            className="admin-button primary"
            disabled={busy || !can("billing")}
          >
            <Plus size={16} />
            {busy ? "Hesablanır..." : "Hesabları yarat"}
          </button>
        </form>
      </div>
      <Note>
        <strong>Dövr üzrə məlumatların sabit saxlanması:</strong> Sakin sayı,
        kupça sahəsi və qüvvədə olan tarif hər hesabda ayrıca saxlanılır. Eyni
        ay üçün təkrar əməliyyat ikinci hesab yaratmır.
      </Note>
      <Panel title="Hesab dövrləri">
        <DataTable
          rows={[...data.billingPeriods].sort((a, b) =>
            b.period.localeCompare(a.period),
          )}
          rowKey={(row) => row.id}
          pageSize={4}
          columns={[
            {
              title: "HESAB DÖVRÜ",
              cell: (row) => <strong>{periodLabel(row.period)}</strong>,
            },
            { title: "HESAB SAYI", cell: (row) => row.invoiceCount },
            {
              title: "HESABLANMIŞ MƏBLƏĞ",
              cell: (row) => `${formatMoney(row.totalCents)} ₼`,
            },
            {
              title: "YARADILMA TARİXİ",
              cell: (row) =>
                row.generatedAt ? formatDate(row.generatedAt) : "—",
            },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "BAXIŞ",
              cell: (row) => (
                <button
                  className="admin-table-action"
                  onClick={() => setFilterPeriod(row.period)}
                >
                  Hesablara bax <ArrowRight size={14} />
                </button>
              ),
            },
          ]}
        />
      </Panel>
      <Panel title="Mənzil hesabları">
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Ödəniş kodu ilə axtar..."
          />
          <SelectFilter
            label="Bütün hesab dövrləri"
            value={filterPeriod}
            onChange={setFilterPeriod}
            options={[
              ...new Set(data.invoices.map((invoice) => invoice.period)),
            ]
              .sort()
              .reverse()
              .map((value) => ({ value, label: periodLabel(value) }))}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "HESAB / ÖDƏNİŞ KODU",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong className="admin-mono">{row.propertyCode}</strong>
                  <small>{row.id}</small>
                </div>
              ),
            },
            { title: "DÖVR", cell: (row) => periodLabel(row.period) },
            {
              title: "ZİBİL PULU",
              cell: (row) => `${formatMoney(row.lines[0]?.amountCents || 0)} ₼`,
            },
            {
              title: "EV PULU",
              cell: (row) => `${formatMoney(row.lines[1]?.amountCents || 0)} ₼`,
            },
            {
              title: "CƏMİ",
              cell: (row) => <strong>{formatMoney(row.totalCents)} ₼</strong>,
            },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "TƏFƏRRÜAT",
              cell: (row) => (
                <button
                  className="admin-icon-button"
                  onClick={() => setSelectedId(row.id)}
                  aria-label={`${row.propertyCode} hesabına bax`}
                >
                  <ArrowUpRight size={17} />
                </button>
              ),
            },
          ]}
        />
      </Panel>
      {selected && (
        <Modal
          title="Hesabın tərkibi"
          subtitle={`${selected.propertyCode} · ${periodLabel(selected.period)}`}
          onClose={() => setSelectedId(null)}
        >
          <div className="admin-form">
            <DataTable
              compact
              rows={selected.lines}
              rowKey={(row) => row.name}
              columns={[
                { title: "XİDMƏT", cell: (row) => row.name },
                { title: "MİQDAR", cell: (row) => row.quantity },
                {
                  title: "TARİF",
                  cell: (row) => `${formatMoney(row.unitCents)} ₼`,
                },
                {
                  title: "MƏBLƏĞ",
                  cell: (row) => `${formatMoney(row.amountCents)} ₼`,
                },
              ]}
            />
            <div className="admin-receipt-total">
              <span>Yekun məbləğ</span>
              <strong>{formatMoney(selected.totalCents)} ₼</strong>
            </div>
            <Note>
              Hesab yaradılan anda: {selected.snapshot.residents} sakin,{" "}
              {selected.snapshot.areaSqm} m² sahə. Son ödəniş tarixi:{" "}
              {formatDate(selected.dueDate)}.
            </Note>
          </div>
        </Modal>
      )}
    </>
  );
}
function ReceiptTextIcon() {
  return <FileText size={24} />;
}

function Payments({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [simulationOpen, setSimulationOpen] = useState(false);
  const { can } = useAdminRole();
  const rows = data.payments.filter(
    (payment) =>
      (!status || payment.status === status) &&
      (!provider || payment.provider === provider) &&
      `${payment.transactionId} ${payment.propertyCode}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const success = data.payments.filter((p) => p.status === "success");
  return (
    <>
      <PageHeader
        eyebrow="MALİYYƏ İDARƏETMƏSİ"
        title="Ödənişlər"
        description="Provayder əməliyyatları, ödəniş reyestri və qəbzlərin uçotu."
        action={
          <>
            <button
              className="admin-button"
              onClick={() =>
                exportCSV(
                  "odenis-reyestri",
                  [
                    "Tranzaksiya",
                    "Ödəniş kodu",
                    "Provayder",
                    "Məbləğ AZN",
                    "Status",
                    "Tarix",
                    "Üzləşdirmə",
                  ],
                  rows.map((p) => [
                    p.transactionId,
                    p.propertyCode,
                    p.provider,
                    p.amountCents / 100,
                    labels[p.status],
                    p.createdAt,
                    labels[p.reconciliationStatus],
                  ]),
                )
              }
            >
              <ArrowDownToLine size={16} /> İxrac et
            </button>
            <button
              className="admin-button primary"
              disabled={!can("payments")}
              onClick={() => setSimulationOpen(true)}
            >
              <RefreshCw size={16} /> Ödəniş bildirişini sına
            </button>
          </>
        }
      />
      <div className="admin-metrics three">
        <Metric
          title="Uğurlu ödənişlər"
          value={`${formatMoney(success.reduce((sum, p) => sum + p.amountCents, 0))} ₼`}
          note={`${success.length} uğurlu əməliyyat`}
          icon={CreditCard}
        />
        <Metric
          title="Gözləyən əməliyyatlar"
          value={data.payments.filter((p) => p.status === "pending").length}
          note="Provayderin təsdiqi gözlənilir"
          icon={Clock3}
          tone="orange"
        />
        <Metric
          title="Üzləşdirilməli əməliyyatlar"
          value={
            data.payments.filter((p) => p.reconciliationStatus !== "matched")
              .length
          }
          note="Provayder hesabatı ilə yoxlanılacaq"
          icon={RefreshCw}
          tone="blue"
        />
      </div>
      <Note icon={ShieldCheck}>
        <strong>Təkrar ödənişdən qorunma:</strong> Eyni tranzaksiya
        identifikatoru ikinci dəfə qəbul edildikdə balans yenidən dəyişmir və
        əlavə maliyyə qeydi yaranmır. Bütün əməliyyatlar simulyasiyadır.
      </Note>
      <Panel
        title="Ödəniş reyestri"
        subtitle={`${data.payments.length} əməliyyat`}
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tranzaksiya ID-si və ya ödəniş kodu..."
          />
          <SelectFilter
            label="Bütün provayderlər"
            value={provider}
            onChange={setProvider}
            options={[...new Set(data.payments.map((p) => p.provider))].map(
              (value) => ({ value, label: value }),
            )}
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={["success", "pending", "failed"].map((value) => ({
              value,
              label: labels[value],
            }))}
          />
        </div>
        <DataTable
          rows={[...rows].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          )}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "TRANZAKSİYA / KOD",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong className="admin-mono">{row.transactionId}</strong>
                  <small>
                    {row.propertyCode} · {row.receiptNumber}
                  </small>
                </div>
              ),
            },
            { title: "PROVAYDER", cell: (row) => row.provider },
            {
              title: "MƏBLƏĞ",
              cell: (row) => <strong>{formatMoney(row.amountCents)} ₼</strong>,
            },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            { title: "TARİX", cell: (row) => formatDate(row.createdAt) },
            {
              title: "ÜZLƏŞDİRMƏ",
              cell: (row) => <Badge status={row.reconciliationStatus} />,
            },
          ]}
        />
      </Panel>
      {simulationOpen && (
        <PaymentSimulation
          data={data}
          onClose={() => setSimulationOpen(false)}
        />
      )}
    </>
  );
}

function PaymentSimulation({
  data,
  onClose,
}: {
  data: DemoState;
  onClose: () => void;
}) {
  const { run, busy } = useAction();
  const [propertyCode, setPropertyCode] = useState("527418936204");
  const [amount, setAmount] = useState("13.68");
  const [transactionId, setTransactionId] = useState(
    () => `DEMO-${Date.now()}`,
  );
  const [result, setResult] = useState<ActionResult | null>(null);
  const [inputError, setInputError] = useState("");
  const property = data.properties.find((p) => p.paymentCode === propertyCode);
  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (busy) return;
    setInputError("");
    let amountCents: number;
    try {
      amountCents = parseMoneyInput(amount);
    } catch (cause) {
      setInputError(
        cause instanceof Error ? cause.message : "Məbləği yoxlayın.",
      );
      return;
    }
    const response = await run({
      type: "provider_callback",
      transactionId,
      propertyCode,
      amountCents,
    });
    if (response) setResult(response);
  }
  return (
    <Modal
      title="Provayder bildirişinin simulyasiyası"
      subtitle="Real bank əməliyyatı aparılmır. Demo balansı və reyestr yenilənir."
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <label>
          Əmlakın ödəniş kodu
          <input
            required
            pattern="[0-9]{12}"
            maxLength={12}
            value={propertyCode}
            readOnly={!!result}
            onChange={(event) => setPropertyCode(event.target.value)}
          />
        </label>
        {property && (
          <div className="admin-inline-balance">
            <span>{property.address}</span>
            <strong>Cari borc: {formatMoney(property.balanceCents)} ₼</strong>
          </div>
        )}
        <div className="admin-form-row">
          <label>
            Məbləğ, AZN
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              value={amount}
              readOnly={!!result}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <label>
            Tranzaksiya identifikatoru
            <input
              required
              maxLength={100}
              value={transactionId}
              readOnly={!!result}
              onChange={(event) => setTransactionId(event.target.value)}
            />
          </label>
        </div>
        {inputError && (
          <div role="alert" className="admin-preference-message error">
            {inputError}
          </div>
        )}
        {result && (
          <div
            role="status"
            className={`admin-simulation-result ${result.duplicate ? "duplicate" : ""}`}
          >
            <ShieldCheck size={24} />
            <div>
              <strong>
                {result.duplicate
                  ? "Təkrar əməliyyat aşkarlandı"
                  : "Ödəniş uğurla qeydə alındı"}
              </strong>
              <p>
                {result.duplicate
                  ? "Eyni tranzaksiya ikinci dəfə tətbiq edilmədi. Balans və maliyyə reyestri qorundu."
                  : `Qəbz: ${result.payment?.receiptNumber || "Yaradıldı"}. Təkrar bildiriş göndərərək qorumanı yoxlayın.`}
              </p>
            </div>
          </div>
        )}
        <div className="admin-modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>
            Bağla
          </button>
          <button disabled={busy} className="admin-button primary">
            <RefreshCw size={16} />
            {busy
              ? "İcra olunur..."
              : result
                ? "Eyni bildirişi təkrar göndər"
                : "Ödəniş bildirişini qəbul et"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Reconciliation({ data }: { data: DemoState }) {
  const { run, busy } = useAction();
  const { can } = useAdminRole();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ReconciliationRow | null>(null);
  const rows = data.reconciliationRows.filter(
    (row) =>
      (!status || row.status === status) &&
      row.transactionId.toLowerCase().includes(search.toLowerCase()),
  );
  const unresolved = data.reconciliationRows.filter(
    (row) => row.status !== "matched" && !row.reviewed,
  );
  return (
    <>
      <PageHeader
        eyebrow="MALİYYƏ NƏZARƏTİ"
        title="Gündəlik üzləşdirmə"
        description="Provayder hesabatını daxili ödəniş reyestri ilə müqayisə edin."
        action={
          <button
            className="admin-button primary"
            disabled={busy || !can("reconciliation")}
            onClick={() => run({ type: "import_reconciliation" })}
          >
            <ArrowDownToLine size={16} />
            {busy ? "İdxal olunur..." : "Demo provayder hesabatını idxal et"}
          </button>
        }
      />
      <div className="admin-metrics four">
        {[
          {
            status: "matched",
            title: "Uyğun əməliyyatlar",
            icon: CheckCircle2,
            tone: "teal",
          },
          {
            status: "mismatch",
            title: "Məbləğ fərqləri",
            icon: CircleAlert,
            tone: "orange",
          },
          {
            status: "missing",
            title: "Reyestrdə tapılmayan",
            icon: Search,
            tone: "blue",
          },
          {
            status: "duplicate",
            title: "Təkrar əməliyyatlar",
            icon: RefreshCw,
            tone: "purple",
          },
        ].map((item) => (
          <Metric
            key={item.status}
            title={item.title}
            value={
              data.reconciliationRows.filter(
                (row) => row.status === item.status,
              ).length
            }
            note="İdxal edilmiş hesabat əsasında"
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>
      <Note>
        Demo idxalı əvvəlcədən hazırlanmış provayder hesabatını emal edir. Fərq
        olan əməliyyatlar yoxlama növbəsinə yönləndirilir; baxış qərarı pul
        məbləğini avtomatik dəyişmir.
      </Note>
      <Panel
        title="Üzləşdirmə nəticələri"
        subtitle={`${unresolved.length} əməliyyat əl ilə yoxlama gözləyir`}
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Tranzaksiya identifikatoru..."
          />
          <SelectFilter
            label="Bütün nəticələr"
            value={status}
            onChange={setStatus}
            options={["matched", "mismatch", "missing", "duplicate"].map(
              (value) => ({ value, label: labels[value] }),
            )}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "TRANZAKSİYA",
              cell: (row) => (
                <strong className="admin-mono">{row.transactionId}</strong>
              ),
            },
            {
              title: "PROVAYDER",
              cell: (row) => `${formatMoney(row.providerAmountCents)} ₼`,
            },
            {
              title: "DAXİLİ REYESTR",
              cell: (row) =>
                row.ledgerAmountCents === null
                  ? "Tapılmadı"
                  : `${formatMoney(row.ledgerAmountCents)} ₼`,
            },
            { title: "NƏTİCƏ", cell: (row) => <Badge status={row.status} /> },
            {
              title: "QEYD",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span>{row.note}</span>
                  {row.reviewed && (
                    <small className="admin-amount-paid">
                      Baxılıb: {row.resolution}
                    </small>
                  )}
                </div>
              ),
            },
            {
              title: "YOXLAMA",
              cell: (row) =>
                row.status === "matched" ? (
                  <span className="admin-muted">Avtomatik uyğunluq</span>
                ) : row.reviewed ? (
                  <Badge status="approved">Baxış tamamlanıb</Badge>
                ) : (
                  <button
                    className="admin-table-action"
                    disabled={!can("reconciliation")}
                    onClick={() => setSelected(row)}
                  >
                    Əl ilə yoxla <ArrowRight size={14} />
                  </button>
                ),
            },
          ]}
        />
      </Panel>
      {selected && (
        <ReconciliationReview
          row={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
function ReconciliationReview({
  row,
  onClose,
}: {
  row: ReconciliationRow;
  onClose: () => void;
}) {
  const [resolution, setResolution] = useState("");
  const { run, busy } = useAction();
  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await run({
      type: "review_reconciliation",
      rowId: row.id,
      resolution,
    });
    if (result) onClose();
  }
  return (
    <Modal
      title="Əməliyyatın əl ilə yoxlanılması"
      subtitle={row.transactionId}
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-detail-grid">
          <div>
            <span>Provayder məbləği</span>
            <strong>{formatMoney(row.providerAmountCents)} ₼</strong>
          </div>
          <div>
            <span>Daxili reyestr</span>
            <strong>
              {row.ledgerAmountCents === null
                ? "Qeyd yoxdur"
                : `${formatMoney(row.ledgerAmountCents)} ₼`}
            </strong>
          </div>
        </div>
        <Note>
          {row.note} Yoxlama yalnız qərarı və əsası qeyd edir. İlkin maliyyə
          məlumatı saxlanılır.
        </Note>
        <label>
          Yoxlamanın nəticəsi
          <textarea
            required
            minLength={3}
            maxLength={500}
            rows={4}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Araşdırmanın nəticəsini və görülən tədbiri yazın..."
          />
        </label>
        <div className="admin-modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>
            Ləğv et
          </button>
          <button className="admin-button primary" disabled={busy}>
            <Check size={16} />
            Baxışı tamamla
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Certificates({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { run, busy } = useAction();
  const { can } = useAdminRole();
  const rows = data.certificates.filter(
    (item) =>
      (!status || item.status === status) &&
      `${item.documentNumber} ${item.propertyCode}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="SƏNƏD XİDMƏTLƏRİ"
        title="Arayış müraciətləri"
        description="Borcla bağlı elektron arayışlar, təsdiq və QR yoxlama məlumatları."
      />
      <div className="admin-metrics four">
        {[
          {
            status: "pending",
            title: "Gözləyən müraciət",
            icon: Clock3,
            tone: "orange",
          },
          {
            status: "issued",
            title: "Verilmiş arayış",
            icon: FileBadge,
            tone: "teal",
          },
          {
            status: "rejected",
            title: "İmtina edilmiş",
            icon: CircleAlert,
            tone: "blue",
          },
          {
            status: "expired",
            title: "Müddəti bitmiş",
            icon: CalendarDays,
            tone: "purple",
          },
        ].map((item) => (
          <Metric
            key={item.status}
            title={item.title}
            value={
              data.certificates.filter((c) => c.status === item.status).length
            }
            note="Nümayiş müraciətləri"
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>
      <Note icon={LockKeyhole}>
        QR yoxlama səhifəsində yalnız maskalanmış ödəniş kodu, sənədin nömrəsi,
        tarixi və statusu göstərilir. Vətəndaşın tam şəxsi məlumatları açılmır.
      </Note>
      <Panel title="Arayış reyestri">
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Sənəd nömrəsi və ya ödəniş kodu..."
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={["pending", "issued", "rejected", "expired"].map(
              (value) => ({ value, label: labels[value] }),
            )}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "SƏNƏD / ÖDƏNİŞ KODU",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong>{row.documentNumber}</strong>
                  <small className="admin-mono">{row.propertyCode}</small>
                </div>
              ),
            },
            { title: "İDENTİFİKASİYA", cell: (row) => labels[row.method] },
            {
              title: "VERİLMƏ / BİTMƏ TARİXİ",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span>{formatDate(row.issuedAt)}</span>
                  <small>{formatDate(row.expiresAt)}</small>
                </div>
              ),
            },
            { title: "BORC", cell: (row) => `${formatMoney(row.debtCents)} ₼` },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "ƏMƏLİYYAT",
              cell: (row) =>
                row.status === "pending" ? (
                  <div className="admin-row-actions">
                    <button
                      className="admin-table-action"
                      disabled={busy || !can("certificates")}
                      onClick={() =>
                        run({
                          type: "review_certificate",
                          certificateId: row.id,
                          status: "issued",
                          reason: "Sənəd mütəxəssisi tərəfindən yoxlanıldı.",
                        })
                      }
                    >
                      <Check size={14} /> Ver
                    </button>
                    <button
                      className="admin-table-action danger"
                      disabled={busy || !can("certificates")}
                      onClick={() =>
                        run({
                          type: "review_certificate",
                          certificateId: row.id,
                          status: "rejected",
                          reason:
                            "Demo sənəd yoxlanışı zamanı müraciət uyğun hesab edilmədi.",
                        })
                      }
                    >
                      <X size={14} /> İmtina
                    </button>
                  </div>
                ) : (
                  <Link
                    href={`/verify?id=${encodeURIComponent(row.id)}`}
                    className="admin-text-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    QR yoxla <ArrowUpRight size={14} />
                  </Link>
                ),
            },
          ]}
        />
      </Panel>
    </>
  );
}

function UsersRoles({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [role, setRoleFilter] = useState("");
  const [tab, setTab] = useState("users");
  const { role: currentRole, setRole } = useAdminRole();
  const rows = data.users.filter(
    (user) =>
      (!role || user.role === role) &&
      `${user.name} ${user.email}`
        .toLocaleLowerCase("az")
        .includes(search.toLocaleLowerCase("az")),
  );
  const matrix = [
    { module: "Bina reyestrini dəyişmək", access: [1, 0, 1, 1, 0, 0] },
    { module: "Kommersiya tarifini təsdiqləmək", access: [1, 1, 1, 0, 0, 0] },
    { module: "Aylıq hesab yaratmaq", access: [1, 1, 0, 0, 0, 0] },
    { module: "Ödəniş bildirişi emal etmək", access: [1, 1, 0, 1, 0, 0] },
    { module: "Üzləşdirməni yoxlamaq", access: [1, 1, 0, 0, 0, 0] },
    { module: "Arayış vermək / imtina etmək", access: [1, 0, 0, 0, 1, 0] },
    { module: "Reyestr və auditə baxmaq", access: [1, 1, 1, 1, 1, 1] },
  ];
  return (
    <>
      <PageHeader
        eyebrow="GİRİŞ VƏ SƏLAHİYYƏTLƏR"
        title="İstifadəçilər və rollar"
        description="Rol əsaslı səlahiyyət modeli və qorunan daxili istifadəçi mühiti."
      />
      <div className="admin-role-demo">
        <span className="admin-role-demo-icon">
          <ShieldCheck size={26} />
        </span>
        <div>
          <h2>Demo rolunu dəyişərək səlahiyyətləri yoxlayın</h2>
          <p>
            Bu, təqdimat üçün interfeys səviyyəli simulyasiyadır. İstehsal
            mühitində giriş və səlahiyyətlər serverdə yoxlanılmalıdır.
          </p>
        </div>
        <select
          aria-label="Cari demo rolu"
          value={currentRole}
          onChange={(event) => setRole(event.target.value)}
        >
          {ADMIN_ROLES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="admin-tabs admin-page-tabs">
        <button
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
        >
          İstifadəçilər <span>{data.users.length}</span>
        </button>
        <button
          className={tab === "matrix" ? "active" : ""}
          onClick={() => setTab("matrix")}
        >
          Səlahiyyət matrisi
        </button>
      </div>
      {tab === "users" ? (
        <Panel
          title="Daxili istifadəçilər"
          action={<Badge status="active">MFA məcburidir</Badge>}
        >
          <div className="admin-toolbar">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="İstifadəçinin adı və ya e-poçtu..."
            />
            <SelectFilter
              label="Bütün rollar"
              value={role}
              onChange={setRoleFilter}
              options={Object.entries(roleNames).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              {
                title: "İSTİFADƏÇİ",
                cell: (row) => (
                  <div className="admin-cell-icon">
                    <span className="admin-user-initial">{row.name[0]}</span>
                    <div>
                      <strong>{row.name}</strong>
                      <small>{row.email}</small>
                    </div>
                  </div>
                ),
              },
              { title: "ROL", cell: (row) => roleNames[row.role] },
              {
                title: "ƏRAZİ",
                cell: (row) =>
                  row.areaId
                    ? data.areas.find((a) => a.id === row.areaId)?.name
                    : "Bütün ərazilər",
              },
              {
                title: "GİRİŞ QORUMASI",
                cell: (row) => (
                  <span className="admin-inline-icon admin-amount-paid">
                    <ShieldCheck size={15} />
                    {row.mfaRequired ? "VPN + MFA" : "VPN"}
                  </span>
                ),
              },
              {
                title: "STATUS",
                cell: (row) => (
                  <Badge status={row.active ? "active" : "inactive"} />
                ),
              },
            ]}
          />
        </Panel>
      ) : (
        <Panel
          title="Rol əsaslı səlahiyyət matrisi"
          subtitle="✓ icazə verilir · — icazə verilmir"
        >
          <div className="admin-table-wrap">
            <table className="admin-table admin-permission-table">
              <thead>
                <tr>
                  <th>ƏMƏLİYYAT</th>
                  {ADMIN_ROLES.map((item) => (
                    <th key={item}>{item}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((item) => (
                  <tr key={item.module}>
                    <td>
                      <strong>{item.module}</strong>
                    </td>
                    {item.access.map((allowed, index) => (
                      <td key={index}>
                        {allowed ? (
                          <span
                            className="admin-permission-yes"
                            aria-label="İcazə verilir"
                          >
                            <Check size={16} />
                          </span>
                        ) : (
                          <span
                            className="admin-muted"
                            aria-label="İcazə verilmir"
                          >
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <div className="admin-security-grid">
        <div>
          <LockKeyhole size={23} />
          <h3>VPN + MFA</h3>
          <p>Daxili istifadəçilər üçün iki mərhələli giriş modeli.</p>
        </div>
        <div>
          <UsersRound size={23} />
          <h3>Minimum səlahiyyət</h3>
          <p>Hər rol yalnız işinə aid əməliyyatları yerinə yetirir.</p>
        </div>
        <div>
          <History size={23} />
          <h3>İzlənə bilən dəyişikliklər</h3>
          <p>Hər dəyişiklik istifadəçi və səbəbi ilə auditə yazılır.</p>
        </div>
      </div>
    </>
  );
}

function AuditLog({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("");
  const [actor, setActor] = useState("");
  const [date, setDate] = useState("");
  const rows = data.auditEvents.filter(
    (event) =>
      (!module || event.module === module) &&
      (!actor || event.actor === actor) &&
      (!date || event.createdAt.startsWith(date)) &&
      `${event.action} ${event.oldValue} ${event.newValue} ${event.reason}`
        .toLocaleLowerCase("az")
        .includes(search.toLocaleLowerCase("az")),
  );
  return (
    <>
      <PageHeader
        eyebrow="NƏZARƏT VƏ ŞƏFFAFLIQ"
        title="Audit jurnalı"
        description="Sistemdəki hər dəyişiklik üçün tarixçə və əməliyyatın əsası."
        action={
          <button
            className="admin-button"
            onClick={() =>
              exportCSV(
                "audit-jurnali",
                [
                  "İstifadəçi",
                  "Modul",
                  "Əməliyyat",
                  "Əvvəlki dəyər",
                  "Yeni dəyər",
                  "IP",
                  "Tarix",
                  "Səbəb",
                ],
                rows.map((event) => [
                  event.actor,
                  event.module,
                  event.action,
                  event.oldValue,
                  event.newValue,
                  event.ip,
                  event.createdAt,
                  event.reason,
                ]),
              )
            }
          >
            <ArrowDownToLine size={16} /> Jurnalı yüklə
          </button>
        }
      />
      <Note icon={ShieldCheck}>
        <strong>Yalnız yeni qeydlərin əlavə edildiyi jurnal.</strong> Bu
        interfeysdə audit hadisəsi dəyişdirilə və silinə bilməz. İstehsal
        sistemində dəyişməz saxlanma və giriş siyasəti tətbiq olunmalıdır.
      </Note>
      <Panel
        title="Əməliyyat tarixçəsi"
        subtitle={`${data.auditEvents.length} audit hadisəsi`}
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Əməliyyat, dəyər və ya səbəb..."
          />
          <SelectFilter
            label="Bütün modullar"
            value={module}
            onChange={setModule}
            options={[
              ...new Set(data.auditEvents.map((event) => event.module)),
            ].map((value) => ({ value, label: value }))}
          />
          <SelectFilter
            label="Bütün istifadəçilər"
            value={actor}
            onChange={setActor}
            options={[
              ...new Set(data.auditEvents.map((event) => event.actor)),
            ].map((value) => ({ value, label: value }))}
          />
          <input
            className="admin-date-input"
            type="date"
            aria-label="Audit tarixini seç"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {date && (
            <button
              className="admin-icon-button"
              aria-label="Tarix filtrini təmizlə"
              onClick={() => setDate("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <DataTable
          rows={[...rows].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
          )}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "İSTİFADƏÇİ / TARİX",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong>{row.actor}</strong>
                  <small>{formatDate(row.createdAt)}</small>
                  <span className="admin-mono admin-muted">{row.ip}</span>
                </div>
              ),
            },
            {
              title: "MODUL / ƏMƏLİYYAT",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span className="admin-module-tag">{row.module}</span>
                  <strong>{row.action}</strong>
                </div>
              ),
            },
            {
              title: "ƏVVƏLKİ DƏYƏR",
              cell: (row) => (
                <span className="admin-audit-value old">
                  {row.oldValue || "—"}
                </span>
              ),
            },
            {
              title: "YENİ DƏYƏR",
              cell: (row) => (
                <span className="admin-audit-value new">
                  {row.newValue || "—"}
                </span>
              ),
            },
            {
              title: "ƏSAS / SƏBƏB",
              cell: (row) => (
                <span className="admin-audit-reason">{row.reason}</span>
              ),
            },
          ]}
        />
      </Panel>
    </>
  );
}

function Residents({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { can } = useAdminRole();
  const latestInvoice = (id: string) =>
    data.invoices
      .filter((invoice) => invoice.propertyId === id)
      .sort((a, b) => b.period.localeCompare(a.period))[0];
  const hasChanged = (property: Property) => {
    const invoice = latestInvoice(property.id);
    return (
      !!invoice &&
      (invoice.snapshot.residents !== property.residents ||
        invoice.snapshot.areaSqm !== property.areaSqm)
    );
  };
  const rows = data.properties.filter(
    (property) =>
      (!area || property.areaId === area) &&
      (!changedOnly || hasChanged(property)) &&
      `${property.paymentCode} ${property.address}`
        .toLocaleLowerCase("az")
        .includes(search.toLocaleLowerCase("az")),
  );
  const selected = data.properties.find(
    (property) => property.id === selectedId,
  );
  const editing = data.properties.find((property) => property.id === editingId);
  return (
    <>
      <PageHeader
        eyebrow="SAKİN UÇOTU"
        title="Sakinlər və dövr məlumatları"
        description="Cari sakin sayı və kupça sahəsini əvvəlki hesabların sabit məlumatları ilə müqayisə edin."
        action={
          <button
            className="admin-button"
            onClick={() =>
              exportCSV(
                "sakin-dovr-melumatlari",
                [
                  "Ödəniş kodu",
                  "Ünvan",
                  "Cari sakin",
                  "Cari sahə m²",
                  "Son dövr",
                  "Dövrdə sakin",
                  "Dövrdə sahə m²",
                ],
                rows.map((property) => {
                  const invoice = latestInvoice(property.id);
                  return [
                    property.paymentCode,
                    property.address,
                    property.residents,
                    property.areaSqm,
                    invoice?.period || "—",
                    invoice?.snapshot.residents ?? "—",
                    invoice?.snapshot.areaSqm ?? "—",
                  ];
                }),
              )
            }
          >
            <ArrowDownToLine size={16} /> Siyahını yüklə
          </button>
        }
      />
      <div className="admin-metrics three">
        <Metric
          title="Qeydiyyatda olan sakin"
          value={number(
            rows.reduce((sum, property) => sum + property.residents, 0),
          )}
          note={`${rows.length} seçilmiş mənzil üzrə`}
          icon={UsersRound}
        />
        <Metric
          title="Saxlanmış hesab məlumatı"
          value={number(
            data.invoices.filter((invoice) =>
              rows.some((property) => property.id === invoice.propertyId),
            ).length,
          )}
          note="Hesab yaradılan andakı göstəricilər"
          icon={History}
          tone="blue"
        />
        <Metric
          title="Son hesabdan sonra dəyişən"
          value={rows.filter(hasChanged).length}
          note="Sakin sayı və ya mənzilin sahəsi"
          icon={Pencil}
          tone="orange"
        />
      </div>
      <Note icon={LockKeyhole}>
        Bütün adlar maskalanmış demo məlumatlarıdır. Cari məlumatı dəyişdikdə
        əvvəlki hesabın sakin sayı, sahəsi, tarifləri və məbləği olduğu kimi
        saxlanılır.
      </Note>
      <Panel
        title="Mənzillər üzrə sakin uçotu"
        subtitle="Sətirdən dövr tarixçəsini açın və müqayisə edin"
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Ödəniş kodu və ya ünvan..."
          />
          <SelectFilter
            label="Bütün ərazilər"
            value={area}
            onChange={setArea}
            options={data.areas.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={changedOnly}
              onChange={(event) => setChangedOnly(event.target.checked)}
            />
            Yalnız dəyişən məlumatlar
          </label>
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "MƏNZİL / MÜLKİYYƏTÇİ",
              cell: (row) => (
                <button
                  className="admin-property-link"
                  onClick={() => setSelectedId(row.id)}
                >
                  <strong className="admin-mono">{row.paymentCode}</strong>
                  <small>{row.address}</small>
                  <span>{row.ownerMasked}</span>
                </button>
              ),
            },
            {
              title: "CARİ SAKİN / SAHƏ",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong>{row.residents} nəfər</strong>
                  <small>{number(row.areaSqm)} m²</small>
                </div>
              ),
            },
            {
              title: "SON HESABDA SAKİN / SAHƏ",
              cell: (row) => {
                const invoice = latestInvoice(row.id);
                return invoice ? (
                  <div className="admin-cell-stack">
                    <strong>
                      {invoice.snapshot.residents} nəfər ·{" "}
                      {number(invoice.snapshot.areaSqm)} m²
                    </strong>
                    <small>{periodLabel(invoice.period)}</small>
                  </div>
                ) : (
                  "Hesab yoxdur"
                );
              },
            },
            {
              title: "MÜQAYİSƏ",
              cell: (row) =>
                hasChanged(row) ? (
                  <Badge status="pending">Dəyişiklik var</Badge>
                ) : (
                  <Badge status="active">Uyğundur</Badge>
                ),
            },
            {
              title: "ƏMƏLİYYAT",
              cell: (row) => (
                <div className="admin-row-actions">
                  <button
                    className="admin-table-action"
                    onClick={() => setSelectedId(row.id)}
                  >
                    <History size={14} /> Tarixçə
                  </button>
                  <button
                    className="admin-table-action"
                    disabled={!can("buildings")}
                    onClick={() => setEditingId(row.id)}
                  >
                    <Pencil size={14} /> Dəyiş
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Panel>
      {selected && (
        <Modal
          drawer
          title="Sakin və sahə tarixçəsi"
          subtitle={`${selected.paymentCode} · ${selected.address}`}
          onClose={() => setSelectedId(null)}
        >
          <div className="admin-drawer-content">
            <div className="admin-detail-grid">
              <div>
                <span>Cari sakin sayı</span>
                <strong>{selected.residents} nəfər</strong>
              </div>
              <div>
                <span>Cari sahə</span>
                <strong>{number(selected.areaSqm)} m²</strong>
              </div>
            </div>
            <Note>
              Hər dövrün məlumatları həmin hesabdan oxunur. Cari reyestr
              göstəriciləri köhnə hesabı yeniləmir.
            </Note>
            <DataTable
              rows={data.invoices
                .filter((invoice) => invoice.propertyId === selected.id)
                .sort((a, b) => b.period.localeCompare(a.period))}
              rowKey={(row) => row.id}
              columns={[
                { title: "DÖVR", cell: (row) => periodLabel(row.period) },
                {
                  title: "SAXLANMIŞ SAKİN",
                  cell: (row) => `${row.snapshot.residents} nəfər`,
                },
                {
                  title: "SAXLANMIŞ SAHƏ",
                  cell: (row) => `${number(row.snapshot.areaSqm)} m²`,
                },
                {
                  title: "HESAB",
                  cell: (row) => `${formatMoney(row.totalCents)} ₼`,
                },
              ]}
            />
          </div>
        </Modal>
      )}
      {editing && (
        <ResidentEditor property={editing} onClose={() => setEditingId(null)} />
      )}
    </>
  );
}

function ResidentEditor({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const [residents, setResidents] = useState(String(property.residents));
  const [areaSqm, setAreaSqm] = useState(String(property.areaSqm));
  const [reason, setReason] = useState("");
  const { run, busy } = useAction();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      await run({
        type: "save_property",
        propertyId: property.id,
        residents: Number(residents),
        areaSqm: Number(areaSqm),
        reason,
      })
    )
      onClose();
  }
  return (
    <Modal
      title="Cari sakin və sahə məlumatını dəyiş"
      subtitle={`${property.paymentCode} · ${property.address}`}
      onClose={onClose}
    >
      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form-row">
          <label>
            Sakin sayı
            <input
              type="number"
              required
              min="0"
              max="100"
              step="1"
              value={residents}
              onChange={(event) => setResidents(event.target.value)}
            />
          </label>
          <label>
            Kupça sahəsi, m²
            <input
              type="number"
              required
              min="0.01"
              max="100000"
              step="0.01"
              value={areaSqm}
              onChange={(event) => setAreaSqm(event.target.value)}
            />
          </label>
        </div>
        <label>
          Dəyişikliyin əsası
          <textarea
            required
            minLength={3}
            maxLength={500}
            rows={3}
            placeholder="Məsələn: qeydiyyat məlumatı üzrə düzəliş"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <Note>
          Dəyişiklik audit jurnalına yazılacaq. Əvvəlki hesablar saxlanılır;
          yeni göstəricilər növbəti dövr hesablananda tətbiq olunur.
        </Note>
        <div className="admin-modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>
            Ləğv et
          </button>
          <button className="admin-button primary" disabled={busy}>
            <Check size={16} />
            {busy ? "Saxlanılır..." : "Məlumatı saxla"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Invoices({ data }: { data: DemoState }) {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [area, setArea] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const rows = data.invoices
    .filter(
      (invoice) =>
        (!period || invoice.period === period) &&
        (!status || invoice.status === status) &&
        (!area ||
          data.properties.some(
            (property) =>
              property.id === invoice.propertyId && property.areaId === area,
          )) &&
        `${invoice.propertyCode} ${invoice.id}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        b.period.localeCompare(a.period) ||
        a.propertyCode.localeCompare(b.propertyCode),
    );
  const selected = data.invoices.find((invoice) => invoice.id === selectedId);
  return (
    <>
      <PageHeader
        eyebrow="MALİYYƏ REYESTRİ"
        title="Hesab reyestri"
        description="Dövr, ərazi və ödəniş statusu üzrə hesabların tam siyahısı və saxlanmış hesablama məlumatları."
        action={
          <button
            className="admin-button"
            onClick={() =>
              exportCSV(
                "hesab-reyestri",
                [
                  "Hesab",
                  "Ödəniş kodu",
                  "Dövr",
                  "Sakin",
                  "Sahə m²",
                  "Hesab AZN",
                  "Ödənilən AZN",
                  "Qalıq AZN",
                  "Status",
                ],
                rows.map((invoice) => [
                  invoice.id,
                  invoice.propertyCode,
                  invoice.period,
                  invoice.snapshot.residents,
                  invoice.snapshot.areaSqm,
                  invoice.totalCents / 100,
                  invoice.paidCents / 100,
                  (invoice.totalCents - invoice.paidCents) / 100,
                  labels[invoice.status],
                ]),
              )
            }
          >
            <ArrowDownToLine size={16} /> Hesabları yüklə
          </button>
        }
      />
      <div className="admin-metrics three">
        <Metric
          title="Hesablanmış məbləğ"
          value={`${formatMoney(rows.reduce((sum, invoice) => sum + invoice.totalCents, 0))} ₼`}
          note={`${rows.length} seçilmiş hesab üzrə`}
          icon={FileText}
        />
        <Metric
          title="Hesablara yönəldilən ödəniş"
          value={`${formatMoney(rows.reduce((sum, invoice) => sum + invoice.paidCents, 0))} ₼`}
          note="Bu hesablara ayrılmış ödənişlər"
          icon={CreditCard}
          tone="blue"
        />
        <Metric
          title="Ödənilməmiş qalıq"
          value={`${formatMoney(rows.reduce((sum, invoice) => sum + invoice.totalCents - invoice.paidCents, 0))} ₼`}
          note="Seçilmiş hesabların cari qalığı"
          icon={Clock3}
          tone="orange"
        />
      </div>
      <Panel
        title="Bütün hesablar"
        action={
          <Link className="admin-text-link" href="/admin/billing">
            Yeni dövr hesabla <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="admin-toolbar">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Ödəniş kodu və ya hesab nömrəsi..."
          />
          <SelectFilter
            label="Bütün hesab dövrləri"
            value={period}
            onChange={setPeriod}
            options={[
              ...new Set(data.invoices.map((invoice) => invoice.period)),
            ]
              .sort()
              .reverse()
              .map((value) => ({ value, label: periodLabel(value) }))}
          />
          <SelectFilter
            label="Bütün statuslar"
            value={status}
            onChange={setStatus}
            options={["unpaid", "partial", "paid"].map((value) => ({
              value,
              label: labels[value],
            }))}
          />
          <SelectFilter
            label="Bütün ərazilər"
            value={area}
            onChange={setArea}
            options={data.areas.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
        </div>
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "HESAB / ÖDƏNİŞ KODU",
              cell: (row) => (
                <button
                  className="admin-property-link"
                  onClick={() => setSelectedId(row.id)}
                >
                  <strong className="admin-mono">{row.propertyCode}</strong>
                  <small>{row.id}</small>
                </button>
              ),
            },
            {
              title: "DÖVR / SON TARİX",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong>{periodLabel(row.period)}</strong>
                  <small>{formatDate(row.dueDate)}</small>
                </div>
              ),
            },
            {
              title: "SAXLANMIŞ GÖSTƏRİCİ",
              cell: (row) =>
                `${row.snapshot.residents} sakin · ${number(row.snapshot.areaSqm)} m²`,
            },
            {
              title: "HESAB",
              cell: (row) => `${formatMoney(row.totalCents)} ₼`,
            },
            {
              title: "ÖDƏNİLƏN / QALIQ",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span className="admin-amount-paid">
                    {formatMoney(row.paidCents)} ₼
                  </span>
                  <small>
                    {formatMoney(row.totalCents - row.paidCents)} ₼ qalıq
                  </small>
                </div>
              ),
            },
            { title: "STATUS", cell: (row) => <Badge status={row.status} /> },
            {
              title: "BAXIŞ",
              cell: (row) => (
                <button
                  className="admin-icon-button"
                  aria-label={`${row.propertyCode}, ${periodLabel(row.period)} hesabına bax`}
                  onClick={() => setSelectedId(row.id)}
                >
                  <ArrowUpRight size={17} />
                </button>
              ),
            },
          ]}
        />
      </Panel>
      {selected && (
        <InvoiceDetail invoice={selected} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}

function InvoiceDetail({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Hesabın tərkibi"
      subtitle={`${invoice.propertyCode} · ${periodLabel(invoice.period)}`}
      onClose={onClose}
    >
      <div className="admin-form">
        <div className="admin-detail-grid">
          <div>
            <span>Hesab nömrəsi</span>
            <strong>{invoice.id}</strong>
          </div>
          <div>
            <span>Status</span>
            <Badge status={invoice.status} />
          </div>
          <div>
            <span>Yaradılma tarixi</span>
            <strong>{formatDate(invoice.createdAt)}</strong>
          </div>
          <div>
            <span>Son ödəniş tarixi</span>
            <strong>{formatDate(invoice.dueDate)}</strong>
          </div>
        </div>
        <DataTable
          compact
          rows={invoice.lines}
          rowKey={(row) => row.name}
          columns={[
            { title: "XİDMƏT", cell: (row) => row.name },
            { title: "MİQDAR", cell: (row) => number(row.quantity) },
            {
              title: "TARİF",
              cell: (row) => `${formatMoney(row.unitCents)} ₼`,
            },
            {
              title: "MƏBLƏĞ",
              cell: (row) => `${formatMoney(row.amountCents)} ₼`,
            },
          ]}
        />
        <div className="admin-receipt-total">
          <span>Hesabın yekunu</span>
          <strong>{formatMoney(invoice.totalCents)} ₼</strong>
        </div>
        <div className="admin-detail-grid">
          <div>
            <span>Hesaba yönəldilən ödəniş</span>
            <strong>{formatMoney(invoice.paidCents)} ₼</strong>
          </div>
          <div>
            <span>Ödənilməmiş qalıq</span>
            <strong>
              {formatMoney(invoice.totalCents - invoice.paidCents)} ₼
            </strong>
          </div>
        </div>
        <Note icon={History}>
          <strong>Hesab yaradılan anda:</strong> {invoice.snapshot.residents}{" "}
          sakin · {number(invoice.snapshot.areaSqm)} m². Zibil tarifi:{" "}
          {formatMoney(invoice.snapshot.wasteUnitCents)} ₼ / nəfər, ev tarifi:{" "}
          {formatMoney(invoice.snapshot.housingUnitCents)} ₼ / m². Bu məlumatlar
          sonrakı reyestr dəyişikliklərindən asılı deyil.
        </Note>
      </div>
    </Modal>
  );
}

function Reports({ data }: { data: DemoState }) {
  const periods = [
    ...new Set([
      ...data.invoices.map((invoice) => invoice.period),
      ...data.payments.map((payment) => payment.createdAt.slice(0, 7)),
    ]),
  ].sort();
  const [from, setFrom] = useState(periods[0] || "2026-08");
  const [to, setTo] = useState(periods.at(-1) || "2026-09");
  const [area, setArea] = useState("");
  const validRange = from <= to;
  const properties = data.properties.filter(
    (property) => !area || property.areaId === area,
  );
  const propertyIds = new Set(properties.map((property) => property.id));
  const inRange = (period: string) =>
    validRange && period >= from && period <= to;
  const invoices = data.invoices.filter(
    (invoice) => propertyIds.has(invoice.propertyId) && inRange(invoice.period),
  );
  const payments = data.payments.filter(
    (payment) =>
      propertyIds.has(payment.propertyId) &&
      inRange(payment.createdAt.slice(0, 7)),
  );
  const paid = payments.filter((payment) => payment.status === "success");
  const total = invoices.reduce((sum, invoice) => sum + invoice.totalCents, 0);
  const allocated = invoices.reduce(
    (sum, invoice) => sum + invoice.paidCents,
    0,
  );
  const collected = paid.reduce((sum, payment) => sum + payment.amountCents, 0);
  const rows = data.areas
    .filter((item) => !area || item.id === area)
    .map((item) => {
      const ids = new Set(
        properties
          .filter((property) => property.areaId === item.id)
          .map((property) => property.id),
      );
      const areaInvoices = invoices.filter((invoice) =>
        ids.has(invoice.propertyId),
      );
      const areaPayments = paid.filter((payment) =>
        ids.has(payment.propertyId),
      );
      return {
        id: item.id,
        name: item.name,
        properties: ids.size,
        count: areaInvoices.length,
        billed: areaInvoices.reduce(
          (sum, invoice) => sum + invoice.totalCents,
          0,
        ),
        allocated: areaInvoices.reduce(
          (sum, invoice) => sum + invoice.paidCents,
          0,
        ),
        collected: areaPayments.reduce(
          (sum, payment) => sum + payment.amountCents,
          0,
        ),
        matched: areaPayments.filter(
          (payment) => payment.reconciliationStatus === "matched",
        ).length,
        pending: areaPayments.filter(
          (payment) => payment.reconciliationStatus !== "matched",
        ).length,
      };
    });
  const monthly = periods.filter(inRange).map((period) => ({
    period,
    name: periodLabel(period),
    billed:
      invoices
        .filter((invoice) => invoice.period === period)
        .reduce((sum, invoice) => sum + invoice.totalCents, 0) / 100,
    collected:
      paid
        .filter((payment) => payment.createdAt.startsWith(period))
        .reduce((sum, payment) => sum + payment.amountCents, 0) / 100,
  }));
  return (
    <>
      <PageHeader
        eyebrow="HESABATLAR VƏ STATİSTİKA"
        title="Maliyyə və xidmət hesabatları"
        description="Seçilmiş dövr üzrə hesablamalar, daxilolmalar və ərazi göstəricilərini müqayisə edin."
        action={
          <button
            className="admin-button"
            disabled={!validRange}
            onClick={() =>
              exportCSV(
                `erazi-hesabati-${from}-${to}`,
                [
                  "Başlanğıc ay",
                  "Son ay",
                  "Ərazi",
                  "Mənzil",
                  "Hesab sayı",
                  "Hesablanan AZN",
                  "Hesaba ödənilən AZN",
                  "Qalıq AZN",
                  "Daxilolma AZN",
                  "Uyğun əməliyyat",
                  "Yoxlanmalı əməliyyat",
                ],
                rows.map((row) => [
                  from,
                  to,
                  row.name,
                  row.properties,
                  row.count,
                  row.billed / 100,
                  row.allocated / 100,
                  (row.billed - row.allocated) / 100,
                  row.collected / 100,
                  row.matched,
                  row.pending,
                ]),
              )
            }
          >
            <ArrowDownToLine size={16} /> Hesabatı CSV yüklə
          </button>
        }
      />
      <Panel>
        <div className="admin-toolbar admin-report-filters">
          <label>
            Başlanğıc ay
            <input
              className="admin-date-input"
              type="month"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              required
            />
          </label>
          <label>
            Son ay
            <input
              className="admin-date-input"
              type="month"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              required
            />
          </label>
          <SelectFilter
            label="Bütün ərazilər"
            value={area}
            onChange={setArea}
            options={data.areas.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <span className="admin-muted">
            {properties.length} mənzil · {invoices.length} hesab ·{" "}
            {payments.length} əməliyyat
          </span>
        </div>
      </Panel>
      {!validRange && (
        <div className="admin-note" role="alert">
          <CircleAlert size={18} />
          Başlanğıc ay son aydan gec ola bilməz.
        </div>
      )}
      <div className="admin-metrics four">
        <Metric
          title="Hesablanmış məbləğ"
          value={`${formatMoney(total)} ₼`}
          note="Seçilmiş dövrlərin hesab cəmi"
          icon={FileText}
        />
        <Metric
          title="Daxil olan ödənişlər"
          value={`${formatMoney(collected)} ₼`}
          note={`${paid.length} uğurlu əməliyyat · əməliyyat tarixi üzrə`}
          icon={Wallet}
          tone="blue"
        />
        <Metric
          title="Hesabların cari qalığı"
          value={`${formatMoney(total - allocated)} ₼`}
          note="Hesab cəmi − həmin hesablara ödəniş"
          icon={Clock3}
          tone="orange"
        />
        <Metric
          title="Hesabların ödənilmə payı"
          value={`${total ? Math.round((allocated / total) * 100) : 0}%`}
          note={`${formatMoney(allocated)} ₼ hesablara ayrılıb`}
          icon={TrendingUp}
        />
      </div>
      <Note>
        Hesablamalar hesab dövrünə, daxilolmalar ödəniş tarixinə görə seçilir.
        Bir ödəniş əvvəlki dövrün borcunu bağlaya bildiyi üçün daxilolma və
        hesablara ayrılan məbləğ fərqlənə bilər. Qalıq bu hesabların hazırkı
        vəziyyətidir.
      </Note>
      <Panel
        title="Aylar üzrə dinamika"
        subtitle="Yaşayış hesabları və uğurlu ödənişlər"
        action={<span className="admin-chart-unit">AZN</span>}
      >
        <div className="admin-chart-legend">
          <span>
            <i className="teal" />
            Daxilolma
          </span>
          <span>
            <i className="pale" />
            Hesablanan
          </span>
        </div>
        <div className="admin-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthly}
              margin={{ top: 12, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 4"
                vertical={false}
                stroke="#edf1f4"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toFixed(2)} ₼`,
                  name === "collected" ? "Daxilolma" : "Hesablanan",
                ]}
              />
              <Area
                dataKey="billed"
                stroke="#b4c4d8"
                fill="#eef3f8"
                strokeWidth={2}
              />
              <Area
                dataKey="collected"
                stroke="#13998e"
                fill="#d9efeb"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel
        title="Ərazilər üzrə nəticələr"
        subtitle="Üzləşdirmə sayı yalnız uğurlu ödənişlər üzrədir"
      >
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            {
              title: "ƏRAZİ",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <strong>{row.name}</strong>
                  <small>
                    {row.properties} mənzil · {row.count} hesab
                  </small>
                </div>
              ),
            },
            {
              title: "HESABLANAN",
              cell: (row) => `${formatMoney(row.billed)} ₼`,
            },
            {
              title: "HESABA ÖDƏNİLƏN",
              cell: (row) => `${formatMoney(row.allocated)} ₼`,
            },
            {
              title: "CARİ QALIQ",
              cell: (row) => `${formatMoney(row.billed - row.allocated)} ₼`,
            },
            {
              title: "DAXİLOLMA",
              cell: (row) => (
                <strong className="admin-amount-paid">
                  {formatMoney(row.collected)} ₼
                </strong>
              ),
            },
            {
              title: "ÜZLƏŞDİRMƏ",
              cell: (row) => (
                <div className="admin-cell-stack">
                  <span>{row.matched} uyğun</span>
                  <small>{row.pending} yoxlanmalı</small>
                </div>
              ),
            },
          ]}
        />
      </Panel>
      <div className="admin-metrics three">
        <Metric
          title="Kommersiya obyektləri"
          value={
            data.commercialObjects.filter(
              (object) => !area || object.areaId === area,
            ).length
          }
          note="Seçilmiş ərazinin cari reyestri"
          icon={Store}
        />
        <Metric
          title="Təsdiqlənmiş aylıq tariflər"
          value={`${formatMoney(data.commercialObjects.filter((object) => (!area || object.areaId === area) && object.approvalStatus === "approved").reduce((sum, object) => sum + object.tariffCents, 0))} ₼`}
          note="Cari tarif cəmi · daxilolmalara əlavə edilmir"
          icon={Landmark}
          tone="blue"
        />
        <Metric
          title="Tarif təsdiqi gözləyən"
          value={
            data.commercialObjects.filter(
              (object) =>
                (!area || object.areaId === area) &&
                object.approvalStatus === "pending",
            ).length
          }
          note="Cari təkliflərin sayı"
          icon={Clock3}
          tone="orange"
        />
      </div>
    </>
  );
}

function Settings({ data }: { data: DemoState }) {
  const { preferences, savePreferences } = useAdminPreferences();
  const [feedback, setFeedback] = useState({ message: "", saved: false });
  return (
    <SettingsEditor
      key={JSON.stringify(preferences)}
      data={data}
      preferences={preferences}
      savePreferences={savePreferences}
      feedback={feedback}
      onFeedback={setFeedback}
    />
  );
}

function SettingsEditor({
  data,
  preferences,
  savePreferences,
  feedback,
  onFeedback,
}: {
  data: DemoState;
  preferences: AdminPreferences;
  savePreferences: (value: AdminPreferences) => void;
  feedback: { message: string; saved: boolean };
  onFeedback: (feedback: { message: string; saved: boolean }) => void;
}) {
  const [draft, setDraft] = useState(preferences);
  const { message, saved } = feedback;
  const changed = JSON.stringify(draft) !== JSON.stringify(preferences);
  function save(value: AdminPreferences) {
    try {
      savePreferences(value);
      setDraft(value);
      onFeedback({
        saved: true,
        message: "Təqdimat seçimləri bu brauzerdə saxlanıldı.",
      });
    } catch {
      onFeedback({
        saved: false,
        message:
          "Brauzer yaddaşı əlçatan deyil. Seçimləri saxlamaq mümkün olmadı.",
      });
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="SİSTEM SEÇİMLƏRİ"
        title="Tənzimləmələr"
        description="İdarəetmə panelinin təqdimat və cədvəl seçimlərini bu brauzer üçün uyğunlaşdırın."
      />
      <Note>
        Bu seçimlər yalnız demo interfeysinə aiddir və brauzerdə saxlanılır.
        Maliyyə məlumatlarını, istifadəçi səlahiyyətlərini və hesab tariflərini
        dəyişmir.
      </Note>
      <div className="admin-settings-grid">
        <Panel
          title="Təqdimat seçimləri"
          subtitle="Saxladıqdan sonra səhifələrə keçid və brauzerin yenilənməsi zamanı qüvvədə qalır"
        >
          <form
            className="admin-form"
            onSubmit={(event) => {
              event.preventDefault();
              save(draft);
            }}
          >
            <label>
              Ümumi baxış üçün ilkin ay
              <input
                type="month"
                required
                min="2026-01"
                max="2030-12"
                value={draft.period}
                onChange={(event) =>
                  setDraft({ ...draft, period: event.target.value })
                }
              />
              <small>
                Ümumi baxış səhifəsi bu ayla açılır; ayı səhifədə də dəyişə
                bilərsiniz.
              </small>
            </label>
            <label>
              Cədvəldə səhifə üzrə qeyd sayı
              <select
                value={draft.pageSize}
                onChange={(event) =>
                  setDraft({ ...draft, pageSize: Number(event.target.value) })
                }
              >
                {[8, 16, 32].map((size) => (
                  <option key={size} value={size}>
                    {size} qeyd
                  </option>
                ))}
              </select>
              <small>
                Reyestrlər, sakinlər, hesablar, ödənişlər və audit cədvəllərinə
                tətbiq olunur.
              </small>
            </label>
            <label>
              Cədvəl sıxlığı
              <select
                value={draft.density}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    density: event.target.value as AdminPreferences["density"],
                  })
                }
              >
                <option value="comfortable">Rahat görünüş</option>
                <option value="compact">Yığcam görünüş</option>
              </select>
            </label>
            {message && (
              <div
                className={`admin-preference-message ${saved ? "success" : "error"}`}
                role={saved ? "status" : "alert"}
              >
                {message}
              </div>
            )}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-button"
                onClick={() => save(defaultPreferences)}
              >
                İlkin seçimləri bərpa et
              </button>
              <button className="admin-button primary" disabled={!changed}>
                <Check size={16} /> Seçimləri saxla
              </button>
            </div>
          </form>
        </Panel>
        <Panel title="Hazırda tətbiq olunan seçimlər">
          <div className="admin-form">
            <div className="admin-settings-current">
              <CalendarDays size={20} />
              <div>
                <span>İlkin hesabat ayı</span>
                <strong>{periodLabel(preferences.period)}</strong>
              </div>
            </div>
            <div className="admin-settings-current">
              <FileText size={20} />
              <div>
                <span>Cədvəlin səhifəsi</span>
                <strong>
                  {preferences.pageSize} qeyd ·{" "}
                  {preferences.density === "compact" ? "Yığcam" : "Rahat"}
                </strong>
              </div>
            </div>
            <div className="admin-settings-current">
              <Database size={20} />
              <div>
                <span>Demo məlumatlarının son yenilənməsi</span>
                <strong>{formatDate(data.updatedAt)}</strong>
              </div>
            </div>
            <Link className="admin-button" href="/admin/dashboard">
              Ümumi baxışı aç <ArrowUpRight size={16} />
            </Link>
            <Link className="admin-button" href="/admin/invoices">
              Hesab cədvəlinə bax <ArrowUpRight size={16} />
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Architecture() {
  const [selected, setSelected] = useState("api");
  const info: Record<string, { title: string; text: string }> = {
    channel: {
      title: "Vahid xidmət kanalları",
      text: "Vətəndaş portalı, ödəniş terminalı və bank inteqrasiyaları eyni əmlak ödəniş kodundan istifadə edir. İdentifikasiya və ödəniş sorğuları vahid giriş nöqtəsinə göndərilir.",
    },
    waf: {
      title: "Qorunan giriş sərhədi",
      text: "Nəzərdə tutulan WAF və TLS qatı zərərli sorğuları süzgəcdən keçirir. Daxili istifadəçilər VPN və çoxamilli identifikasiya ilə daxil olur.",
    },
    api: {
      title: "Vahid tətbiq interfeysi",
      text: "Next.js demo API qatı gələcək .NET backend üçün ayrılmış müqaviləni nümayiş etdirir. İstehsal versiyasında server səlahiyyətləri, məhdudlaşdırma və məlumat yoxlaması bu qatda tətbiq edilir.",
    },
    services: {
      title: "Müstəqil xidmət modulları",
      text: "Hesablama xidməti dövr üzrə sabit məlumat saxlayır. Ödəniş xidməti təkrar tranzaksiyanın tətbiqini bloklayır. Arayış xidməti şəxsi məlumatı minimum açıqlayan QR yoxlamasını təmin edir.",
    },
    database: {
      title: "Mərkəzləşdirilmiş uçot",
      text: "Planlaşdırılan PostgreSQL bazasına birbaşa istifadəçi girişi verilmir. Bütün oxuma və yazma əməliyyatları səlahiyyətli xidmətlərdən keçir. Bu demo lokal məlumat qatından istifadə edir.",
    },
    backup: {
      title: "Davamlılıq və müşahidə",
      text: "İstehsal planına şifrələnmiş ehtiyat nüsxələr, bərpa sınaqları, monitorinq, dəyişməz audit qeydləri və gündəlik maliyyə üzləşdirməsi daxildir.",
    },
  };
  const node = (
    id: string,
    icon: LucideIcon,
    title: string,
    subtitle: string,
    className = "",
  ) => {
    const Icon = icon;
    return (
      <button
        onClick={() => setSelected(id)}
        className={`admin-architecture-node ${selected === id ? "selected" : ""} ${className}`}
      >
        <Icon size={25} />
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </button>
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="TEXNİKİ TƏQDİMAT"
        title="Sistem arxitekturası"
        description="Vətəndaşdan maliyyə reyestrinə qədər vahid və izlənə bilən xidmət axını."
        action={
          <span className="admin-architecture-tag">
            <Network size={15} /> İstehsal üçün nəzərdə tutulan model
          </span>
        }
      />
      <div className="admin-architecture-hero">
        <span className="admin-eyebrow">BİR ŞƏHƏR. VAHİD SİSTEM.</span>
        <h2>
          Etibarlı xidmətin arxasında
          <br />
          aydın arxitektura dayanır.
        </h2>
        <p>Modul quruluş · Mərkəzləşdirilmiş uçot · Nəzarət edilən giriş</p>
        <div className="admin-architecture-orbit">
          <ShieldCheck size={68} />
        </div>
      </div>
      <Panel
        title="Məlumat və əməliyyat axını"
        subtitle="Təfərrüatı görmək üçün aşağıdakı komponentlərdən birini seçin"
      >
        <div className="admin-architecture-flow">
          <div className="admin-architecture-row channels">
            {node("channel", UsersRound, "Vətəndaş", "Veb portal")}
            {node("channel", CreditCard, "Terminal", "Ödəniş şəbəkəsi")}
            {node("channel", Landmark, "Bank", "Provayder inteqrasiyası")}
          </div>
          <div className="admin-flow-connector">
            <span />
            TLS ilə şifrələnmiş sorğular
            <span />
          </div>
          <div className="admin-architecture-row gateway">
            {node("waf", ShieldCheck, "WAF / Giriş qatı", "Süzgəc · VPN · MFA")}
            {<ArrowRight className="admin-flow-arrow" size={24} />}
            {node("api", Server, "Vahid API", "Gələcək .NET backend")}
          </div>
          <div className="admin-flow-connector">
            <span />
            Rol əsaslı səlahiyyət yoxlaması
            <span />
          </div>
          <div className="admin-architecture-row services">
            {node(
              "services",
              FileText,
              "Hesablama",
              "Tariflər və aylıq hesablar",
            )}
            {node(
              "services",
              CreditCard,
              "Ödəniş",
              "Reyestr və təkrar qoruması",
            )}
            {node("services", FileBadge, "Arayış", "Sənəd və QR yoxlama")}
          </div>
          <div className="admin-flow-connector">
            <span />
            Yalnız xidmətlər vasitəsilə giriş
            <span />
          </div>
          <div className="admin-architecture-row storage">
            {node("database", Database, "PostgreSQL", "Mərkəzi məlumat bazası")}
            {<ArrowRight className="admin-flow-arrow" size={24} />}
            {node(
              "backup",
              Activity,
              "Ehtiyat nüsxə və monitorinq",
              "Audit · Bərpa · Bildirişlər",
            )}
          </div>
        </div>
        <div className="admin-architecture-detail" aria-live="polite">
          <span>
            <Info size={21} />
          </span>
          <div>
            <h3>{info[selected].title}</h3>
            <p>{info[selected].text}</p>
          </div>
        </div>
      </Panel>
      <div className="admin-security-grid architecture">
        {[
          {
            icon: ShieldCheck,
            title: "OWASP ASVS yönümlü",
            text: "Təhlükəsizlik yoxlamaları üçün nəzərdə tutulan layihələndirmə bazası.",
          },
          {
            icon: LockKeyhole,
            title: "Birbaşa baza girişi yoxdur",
            text: "İstifadəçi əməliyyatları yalnız tətbiq xidmətlərindən keçir.",
          },
          {
            icon: RefreshCw,
            title: "Gündəlik üzləşdirmə",
            text: "Provayder hesabatı ilə reyestr müntəzəm müqayisə olunur.",
          },
          {
            icon: Database,
            title: "Şifrələnmiş ehtiyat nüsxə",
            text: "İstehsal planında TLS və şifrəli bərpa nüsxələri nəzərdə tutulur.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon size={23} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <Note>
        Bu səhifə hədəf arxitekturanın təqdimatıdır. Demo real bank, şəxsiyyət
        təsdiqi, VPN, WAF və PostgreSQL xidmətlərinə qoşulmur.
      </Note>
    </>
  );
}
