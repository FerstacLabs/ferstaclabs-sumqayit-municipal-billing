"use client";
import { useRef, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  House,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useDemo } from "@/lib/demo-context";
import { formatDate, formatMoney, monthlyCharge } from "@/lib/format";
import type { Payment } from "@/lib/types";
import { PageIntro } from "./shell";
import { Loading, Modal, Notice } from "./ui";

export function PaymentPage({ initialCode = "" }: { initialCode?: string }) {
  const { data, loading, error, act, refresh } = useDemo();
  const [code, setCode] = useState(initialCode);
  const [searched, setSearched] = useState(initialCode);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState<"full" | "month">("full");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const transaction = useRef("");
  const property = data?.properties.find((p) => p.paymentCode === searched);
  const monthly = property ? monthlyCharge(property) : null;
  const amountCents = property
    ? amount === "full"
      ? property.balanceCents
      : Math.min(property.balanceCents, monthly?.totalCents || 0)
    : 0;
  function search(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setSearched(code.trim());
    setReceipt(null);
    setAmount("full");
  }
  function openConfirmation() {
    transaction.current = `DEMO-${crypto.randomUUID()}`;
    setMessage("");
    setConfirm(true);
  }
  async function pay() {
    if (!property || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await act({
        type: "pay",
        propertyCode: property.paymentCode,
        amountCents,
        transactionId: transaction.current,
        provider: "DemoPay",
      });
      setReceipt(result.payment || null);
      setConfirm(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Ödəniş tamamlanmadı.");
    } finally {
      setBusy(false);
    }
  }
  function downloadReceipt() {
    if (!receipt) return;
    const text = `SUMQAYIT MƏNZİL-KOMMUNAL ÖDƏNİŞ SİSTEMİ\nDEMO QƏBZ — real maliyyə sənədi deyil\n\nQəbz: ${receipt.receiptNumber}\nTranzaksiya: ${receipt.transactionId}\nÖdəniş kodu: ${receipt.propertyCode}\nMəbləğ: ${formatMoney(receipt.amountCents)}\nTarix: ${formatDate(receipt.createdAt)}\nProvayder: ${receipt.provider}\nStatus: Uğurlu\nÜzləşdirmə: ${receipt.reconciliationStatus === "matched" ? "Uyğunlaşdırılıb" : "Gözləyir"}\n`;
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.receiptNumber}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <PageIntro
        eyebrow="ÖDƏNİŞ VƏ BALANS"
        title="Kommunal ödənişləriniz bir yerdə"
        description="Əmlakınızın ödəniş kodunu daxil edin, borcunuzu yoxlayın və ödənişi rahatlıqla tamamlayın."
      />
      <div className="container content-area content-grid">
        <div>
          <section className="panel">
            <div className="panel-heading">
              <Search size={23} />
              <div>
                <h2>Borcu yoxla</h2>
                <p>Mənzilinizin cari balansını öyrənin</p>
              </div>
            </div>
            <div className="panel-body">
              <form onSubmit={search}>
                <label className="field">
                  <span>Əmlakın ödəniş kodu</span>
                  <div className="input-with-button">
                    <input
                      className="code-input"
                      name="propertyCode"
                      aria-label="Əmlakın ödəniş kodu"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 12));
                        setSearched("");
                        setMessage("");
                        setReceipt(null);
                      }}
                      inputMode="numeric"
                      pattern="[0-9]{12}"
                      minLength={12}
                      maxLength={12}
                      placeholder="12 rəqəmli kod"
                      required
                    />
                    <button className="btn btn-primary" disabled={loading}>
                      <Search size={16} /> Yoxla
                    </button>
                  </div>
                </label>
                <button
                  type="button"
                  className="example-button"
                  onClick={() => {
                    setCode("527418936204");
                    setSearched("527418936204");
                    setMessage("");
                    setReceipt(null);
                    setAmount("full");
                  }}
                >
                  Nümunə kodla yoxla: 527418936204
                </button>
              </form>
              {loading && <Loading />}
              {error && !data && (
                <Notice error>
                  {error}{" "}
                  <button
                    className="example-button"
                    onClick={() => void refresh()}
                  >
                    Yenidən yüklə
                  </button>
                </Notice>
              )}
              {searched && data && !property && (
                <Notice error>
                  Bu kod üzrə əmlak tapılmadı. 12 rəqəmli kodu yoxlayın və ya
                  nümunə koddan istifadə edin.
                </Notice>
              )}
              {property && monthly && (
                <div className="result-panel">
                  <div className="result-top">
                    <h3>Əmlak məlumatları</h3>
                    <span
                      className={`badge ${property.balanceCents > 0 ? "badge-warning" : ""}`}
                    >
                      {property.balanceCents > 0
                        ? "Ödənilməmiş balans"
                        : "Borc yoxdur"}
                    </span>
                  </div>
                  <div className="address-box">
                    <MapPin />
                    <span>{property.address}</span>
                  </div>
                  <div className="property-facts">
                    <div>
                      <span>Qeydiyyatda olan şəxslər</span>
                      <strong>{property.residents} nəfər</strong>
                    </div>
                    <div>
                      <span>Çıxarış üzrə sahə</span>
                      <strong>
                        {property.areaSqm.toLocaleString("az-AZ")} m²
                      </strong>
                    </div>
                    <div>
                      <span>Əmlak sahibi</span>
                      <strong>{property.ownerMasked}</strong>
                    </div>
                  </div>
                  <div className="charge-line">
                    <span>Zibil pulu · {property.residents} × 0,70 ₼</span>
                    <strong>{formatMoney(monthly.wasteCents)}</strong>
                  </div>
                  <div className="charge-line">
                    <span>
                      Ev pulu · {property.areaSqm.toLocaleString("az-AZ")} ×
                      0,15 ₼
                    </span>
                    <strong>{formatMoney(monthly.housingCents)}</strong>
                  </div>
                  <div className="charge-line">
                    <span>Aylıq hesablanma</span>
                    <strong>{formatMoney(monthly.totalCents)}</strong>
                  </div>
                  <div className="charge-line total">
                    <span>Ümumi ödənilməli balans</span>
                    <strong>{formatMoney(property.balanceCents)}</strong>
                  </div>
                  {property.balanceCents > 0 ? (
                    <>
                      <label className="field">
                        <span>Ödəniləcək məbləğ</span>
                        <select
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value as "full" | "month")
                          }
                        >
                          <option value="full">
                            Tam balans — {formatMoney(property.balanceCents)}
                          </option>
                          <option value="month">
                            Bir aylıq məbləğ —{" "}
                            {formatMoney(
                              Math.min(
                                property.balanceCents,
                                monthly.totalCents,
                              ),
                            )}
                          </option>
                        </select>
                      </label>
                      <button
                        className="btn btn-primary btn-wide"
                        onClick={openConfirmation}
                        disabled={property.status !== "active"}
                      >
                        <CreditCard size={17} /> {formatMoney(amountCents)} ödə
                      </button>
                      {property.status !== "active" && (
                        <Notice error>
                          Bu əmlak qeyri-aktivdir. Operatorla əlaqə saxlayın.
                        </Notice>
                      )}
                    </>
                  ) : (
                    <Link
                      className="btn btn-primary btn-wide"
                      href={`/certificate?code=${property.paymentCode}`}
                    >
                      <FileText size={17} /> Borcsuzluq arayışı al
                    </Link>
                  )}
                  <Notice>
                    Bu, demo ödənişdir. Bank kartı və real pul köçürməsi tələb
                    olunmur.
                  </Notice>
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="info-stack">
          <section className="info-panel">
            <h3>
              <House /> Ödəniş kodu nədir?
            </h3>
            <p>
              12 rəqəmli açıq kod əmlaka bağlıdır və sahib dəyişdikdə eyni
              qalır. Ödəniş üçün daxili struktur kodu daxil etmək lazım deyil.
            </p>
            <div className="info-code">527418936204</div>
            <p>Daxili uçot kodu nümunəsi:</p>
            <div className="info-code">SMQ-R-Z03-B0487-E02-F0125</div>
          </section>
          <section className="info-panel">
            <h3>
              <ShieldCheck /> Şəffaf ödəniş axını
            </h3>
            <ol className="flow-list">
              <li>Balansın sorğulanması</li>
              <li>Ödənişin təsdiqi</li>
              <li>Ödəniş reyestrində qeyd</li>
              <li>Elektron qəbzin hazırlanması</li>
              <li>Gündəlik üzləşdirmə</li>
            </ol>
          </section>
          <section className="info-panel">
            <h3>
              <LockKeyhole /> Təkrar tutulmaya nəzarət
            </h3>
            <p>
              Eyni tranzaksiya identifikatoru ikinci dəfə göndərildikdə məbləğ
              yenidən balansa tətbiq olunmur. Bunu admin panelində sınaqdan
              keçirə bilərsiniz.
            </p>
          </section>
        </aside>
      </div>
      {confirm && property && (
        <Modal
          title="Demo ödənişi təsdiqləyin"
          onClose={() => {
            if (!busy) setConfirm(false);
          }}
        >
          <div className="dialog-content">
            <p style={{ fontSize: 12, color: "var(--muted)" }}>
              Aşağıdakı əmlak üzrə simulyasiya edilmiş ödəniş reyestrə əlavə
              olunacaq.
            </p>
            <div className="receipt-details">
              <div>
                <span>Ödəniş kodu</span>
                <b>{property.paymentCode}</b>
              </div>
              <div>
                <span>Ödəniş məbləği</span>
                <b>{formatMoney(amountCents)}</b>
              </div>
              <div>
                <span>Ödəniş provayderi</span>
                <b>DemoPay · simulyasiya</b>
              </div>
            </div>
            <Notice>
              Real ödəniş aparılmır. Məbləğ yalnız demo balansından çıxılacaq.
            </Notice>
            {message && <Notice error>{message}</Notice>}
            <button
              className="btn btn-primary btn-wide"
              onClick={() => void pay()}
              disabled={busy}
            >
              {busy ? "Ödəniş qeydə alınır…" : "Təsdiqlə və demo ödənişi et"}
            </button>
          </div>
        </Modal>
      )}
      {receipt && (
        <Modal title="Elektron ödəniş qəbzi" onClose={() => setReceipt(null)}>
          <div className="dialog-content">
            <div className="receipt-success">
              <CheckCircle2 />
              <h3>Ödəniş uğurla tamamlandı</h3>
              <p>Demo ödənişiniz reyestrə əlavə edildi.</p>
              <strong>{formatMoney(receipt.amountCents)}</strong>
            </div>
            <div className="receipt-details">
              <div>
                <span>Qəbz nömrəsi</span>
                <b>{receipt.receiptNumber}</b>
              </div>
              <div>
                <span>Tranzaksiya ID</span>
                <b>{receipt.transactionId}</b>
              </div>
              <div>
                <span>Əmlak kodu</span>
                <b>{receipt.propertyCode}</b>
              </div>
              <div>
                <span>Tarix</span>
                <b>{formatDate(receipt.createdAt)}</b>
              </div>
              <div>
                <span>Üzləşdirmə</span>
                <b>
                  {receipt.reconciliationStatus === "matched"
                    ? "Uyğunlaşdırılıb"
                    : "Hesabat gözlənilir"}
                </b>
              </div>
            </div>
            <button
              className="btn btn-primary btn-wide"
              onClick={downloadReceipt}
            >
              <Download size={17} /> Qəbzi yüklə (.txt)
            </button>
            <Notice>Demo qəbz real maliyyə sənədi sayılmır.</Notice>
          </div>
        </Modal>
      )}
    </>
  );
}
