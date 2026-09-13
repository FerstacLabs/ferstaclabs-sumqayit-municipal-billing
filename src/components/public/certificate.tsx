"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  Printer,
  QrCode,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import QRCode from "qrcode";
import { useDemo } from "@/lib/demo-context";
import { fetchCertificate } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import type {
  Certificate,
  PublicCertificate,
  VerificationMethod,
} from "@/lib/types";
import { PageIntro } from "./shell";
import { Loading, Notice } from "./ui";

function CertificatePreview({ certificate }: { certificate: Certificate }) {
  const [qr, setQr] = useState("");
  const path = `/verify?id=${encodeURIComponent(certificate.id)}`;
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(`${window.location.origin}${path}`, {
      width: 200,
      margin: 1,
      color: { dark: "#10374aff", light: "#ffffffff" },
    })
      .then((url) => {
        if (active) setQr(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [path]);
  return (
    <div className="certificate-paper">
      <div className="certificate-heading">
        <Building2 size={34} />
        <p>Sumqayıt şəhər mənzil-kommunal ödəniş sistemi</p>
        <h3>ELEKTRON ARAYIŞ</h3>
      </div>
      <div className="receipt-details">
        <div>
          <span>Sənəd nömrəsi</span>
          <b>{certificate.documentNumber}</b>
        </div>
        <div>
          <span>Verilmə tarixi</span>
          <b>{formatDate(certificate.issuedAt)}</b>
        </div>
        <div>
          <span>Etibarlıdır</span>
          <b>{formatDate(certificate.expiresAt)} tarixinədək</b>
        </div>
      </div>
      <p>
        Bu arayış <strong>{certificate.propertyCode}</strong> ödəniş kodlu,{" "}
        {certificate.address} ünvanında yerləşən əmlak üzrə təqdim edilir.
      </p>
      <p>
        Verilmə anında mənzil-kommunal xidmətlər üzrə{" "}
        {certificate.debtCents === 0 ? (
          <strong>borc yoxdur.</strong>
        ) : (
          <>
            borc qalığı <strong>{formatMoney(certificate.debtCents)}</strong>{" "}
            təşkil edir.
          </>
        )}
      </p>
      <div className="certificate-qr">
        {qr && (
          <Image
            unoptimized
            src={qr}
            alt="Arayışın həqiqiliyini yoxlamaq üçün QR kod"
            width={100}
            height={100}
          />
        )}
        <div>
          <p>
            QR kodu skan edərək sənədin həqiqiliyini yoxlayın. Yoxlama zamanı
            şəxsi məlumatlar göstərilmir.
          </p>
          <Link href={path} className="text-link">
            Arayışı yoxla <QrCode size={14} />
          </Link>
        </div>
      </div>
      <p className="caption">
        DEMO SƏNƏD · Hüquqi qüvvəsi yoxdur. Şəxsiyyət təsdiqi simulyasiya
        edilib.
      </p>
    </div>
  );
}

export function CertificatePage({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const { act, loading } = useDemo();
  const [code, setCode] = useState(initialCode);
  const [method, setMethod] = useState<VerificationMethod>("sms");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMessage("");
    setCertificate(null);
    setBusy(true);
    try {
      const result = await act({
        type: "issue_certificate",
        propertyCode: code,
        method,
        otp: method === "sms" ? otp : undefined,
      });
      setCertificate(result.certificate || null);
      setOtp("");
      setSent(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Arayış hazırlanmadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="ELEKTRON ARAYIŞ"
        title="Arayışınız, olduğunuz yerdə"
        description="Əmlakınızın borc vəziyyətinə dair elektron arayışı əldə edin. Sənədin həqiqiliyi unikal QR kod vasitəsilə yoxlanılır."
      />
      <div className="container content-area content-grid">
        <section className="panel">
          <div className="panel-heading no-print">
            <FileCheck2 size={23} />
            <div>
              <h2>Arayış üçün müraciət</h2>
              <p>Şəxsiyyət təsdiqi ilə sürətli elektron xidmət</p>
            </div>
          </div>
          <div className="panel-body">
            <form className="no-print" onSubmit={submit}>
              <label className="field">
                <span>Əmlakın ödəniş kodu</span>
                <input
                  className="code-input"
                  inputMode="numeric"
                  value={code}
                  pattern="[0-9]{12}"
                  required
                  maxLength={12}
                  placeholder="527418936204"
                  disabled={busy}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 12));
                    setCertificate(null);
                    setSent(false);
                    setOtp("");
                    setMessage("");
                  }}
                />
                <small>Nümunə: 527418936204</small>
              </label>
              <span
                className="field-label"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                Təsdiq üsulunu seçin
              </span>
              <div className="method-grid">
                {[
                  { id: "sms" as const, label: "SMS kod", icon: Smartphone },
                  { id: "sima" as const, label: "SİMA", icon: Fingerprint },
                  {
                    id: "asan" as const,
                    label: "ASAN Login / İmza",
                    icon: ShieldCheck,
                  },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={`method-button ${method === id ? "selected" : ""}`}
                    aria-pressed={method === id}
                    disabled={busy}
                    onClick={() => {
                      setMethod(id);
                      setMessage("");
                      setCertificate(null);
                      setOtp("");
                      setSent(false);
                    }}
                  >
                    <Icon />
                    {label}
                  </button>
                ))}
              </div>
              {method === "sms" ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary btn-wide"
                    disabled={busy || code.length !== 12 || sent}
                    onClick={() => {
                      setSent(true);
                      setMessage("");
                      setCertificate(null);
                    }}
                  >
                    {sent ? "Demo SMS kodu hazırdır" : "Demo SMS kodu al"}
                  </button>
                  {sent && (
                    <Notice>
                      Demo təsdiq kodu: <strong>123456</strong>. Real SMS
                      göndərilmir.
                    </Notice>
                  )}
                  <label className="field" style={{ marginTop: 17 }}>
                    <span>Birdəfəlik təsdiq kodu</span>
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      required
                      maxLength={6}
                      placeholder="6 rəqəmli kod"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setMessage("");
                        setCertificate(null);
                      }}
                      disabled={busy || !sent}
                    />
                  </label>
                </>
              ) : (
                <Notice>
                  <strong>
                    {method === "sima" ? "SİMA" : "ASAN Login / ASAN İmza"} demo
                    rejimi.
                  </strong>{" "}
                  Təsdiqlə düyməsi identifikasiya prosesini simulyasiya edir;
                  xarici xidmətə qoşulma yoxdur.
                </Notice>
              )}
              {message && <Notice error>{message}</Notice>}
              <button
                className="btn btn-primary btn-wide"
                disabled={
                  busy ||
                  loading ||
                  (method === "sms" && (!sent || otp.length !== 6))
                }
              >
                <FileCheck2 size={17} />
                {busy
                  ? "Arayış hazırlanır…"
                  : method === "sms"
                    ? "Arayışı hazırla"
                    : "Təsdiqlə və arayışı hazırla"}
              </button>
            </form>
            {certificate && (
              <>
                <CertificatePreview certificate={certificate} />
                <button
                  className="btn btn-secondary btn-wide no-print"
                  onClick={() => window.print()}
                >
                  <Printer size={17} /> Çap et / PDF olaraq saxla
                </button>
              </>
            )}
          </div>
        </section>
        <aside className="info-stack">
          <section className="info-panel">
            <h3>
              <FileCheck2 /> Arayışda nə göstərilir?
            </h3>
            <ol>
              <li>Sənədin unikal nömrəsi və verilmə tarixi</li>
              <li>Əmlakın ödəniş kodu və ünvanı</li>
              <li>Verilmə anına olan borc vəziyyəti</li>
              <li>30 günlük etibarlılıq və yoxlama QR kodu</li>
            </ol>
          </section>
          <section className="info-panel">
            <h3>
              <LockKeyhole /> Məlumatların qorunması
            </h3>
            <p>
              Açıq QR yoxlama səhifəsində tam ünvan və əmlak sahibinin
              məlumatları açıqlanmır. Ödəniş kodu maskalanmış formada
              göstərilir.
            </p>
            <Link className="text-link" href="/verify">
              Arayış yoxlama səhifəsi <QrCode size={14} />
            </Link>
          </section>
          <Notice>
            Arayışlar təqdimat nümunələridir və hüquqi qüvvəsi yoxdur. Real
            istifadədə identifikasiya provayderləri və elektron imza
            inteqrasiyası tələb olunur.
          </Notice>
        </aside>
      </div>
    </>
  );
}

export function VerifyPage({ initialId = "" }: { initialId?: string }) {
  const [id, setId] = useState(initialId);
  const [result, setResult] = useState<PublicCertificate | null>(null);
  const [busy, setBusy] = useState(!!initialId);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!initialId) return;
    let active = true;
    fetchCertificate(initialId)
      .then((value) => {
        if (active) setResult(value);
      })
      .catch((e) => {
        if (active)
          setMessage(e instanceof Error ? e.message : "Arayış tapılmadı.");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [initialId]);
  async function verify(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      setResult(await fetchCertificate(id.trim()));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Arayış tapılmadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="SƏNƏDİN YOXLANMASI"
        title="Arayışın həqiqiliyini yoxlayın"
        description="QR kod vasitəsilə açılmış sənədi yoxlayın və ya arayışın nömrəsini aşağıdakı xanaya daxil edin."
      />
      <div className="container content-area content-grid">
        <section className="panel">
          <div className="panel-heading">
            <QrCode size={24} />
            <h2>QR arayış yoxlama</h2>
          </div>
          <div className="panel-body">
            <form onSubmit={verify}>
              <label className="field">
                <span>Sənəd nömrəsi və ya yoxlama identifikatoru</span>
                <input
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value);
                    setResult(null);
                    setMessage("");
                  }}
                  disabled={busy}
                  required
                  maxLength={100}
                  placeholder="SMQ-AR-2026-000001"
                />
              </label>
              <button className="btn btn-primary btn-wide" disabled={busy}>
                <SearchIcon />
                {busy ? "Yoxlanılır…" : "Arayışı yoxla"}
              </button>
            </form>
            {busy && <Loading />}
            {message && (
              <div className="verify-status invalid">
                <XCircle />
                <h2>Arayış təsdiqlənmədi</h2>
                <Notice error>{message}</Notice>
              </div>
            )}
            {result && (
              <>
                <div
                  className={`verify-status ${result.valid ? "" : "invalid"}`}
                  style={{ marginTop: 22 }}
                >
                  {result.valid ? <CheckCircle2 /> : <XCircle />}
                  <h2>
                    {result.valid
                      ? "Arayış etibarlıdır"
                      : "Arayış etibarlı deyil"}
                  </h2>
                  <p>
                    {result.valid
                      ? "Sənəd sistemdə qeydə alınıb və etibarlılıq müddəti bitməyib."
                      : "Sənədin statusu və ya etibarlılıq müddəti bu arayışın istifadəsinə imkan vermir."}
                  </p>
                </div>
                <div className="receipt-details">
                  <div>
                    <span>Sənəd nömrəsi</span>
                    <b>{result.documentNumber}</b>
                  </div>
                  <div>
                    <span>Ödəniş kodu</span>
                    <b>{result.propertyCodeMasked}</b>
                  </div>
                  <div>
                    <span>Verilmə tarixi</span>
                    <b>{formatDate(result.issuedAt)}</b>
                  </div>
                  <div>
                    <span>Son etibarlılıq tarixi</span>
                    <b>{formatDate(result.expiresAt)}</b>
                  </div>
                  <div>
                    <span>Sənəd statusu</span>
                    <b>
                      {
                        {
                          issued: "Verilib",
                          pending: "Gözləyir",
                          rejected: "İmtina edilib",
                          expired: "Müddəti bitib",
                        }[result.status]
                      }
                    </b>
                  </div>
                  <div>
                    <span>Verilmə anında</span>
                    <b>{result.debtStatus}</b>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
        <aside className="info-stack">
          <section className="info-panel">
            <h3>
              <ShieldCheck /> Etibarlı yoxlama
            </h3>
            <p>
              Hər bir arayış unikal identifikatorla saxlanılır. Ləğv edilmiş və
              ya müddəti bitmiş sənədlər etibarsız kimi göstərilir.
            </p>
            <p>
              Yoxlama nəticəsində ünvan, sahibin adı və əlaqə məlumatları
              göstərilmir.
            </p>
          </section>
          <Notice>
            Bu sistem təqdimat üçündür. Burada göstərilən arayışların hüquqi
            qüvvəsi yoxdur.
          </Notice>
        </aside>
      </div>
    </>
  );
}
function SearchIcon() {
  return <QrCode size={17} />;
}
