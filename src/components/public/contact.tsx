"use client";
import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { useDemo } from "@/lib/demo-context";
import { PageIntro } from "./shell";
import { Notice } from "./ui";
export function ContactPage() {
  const { act } = useDemo();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const result = await act({
        type: "support",
        name: String(values.get("name")),
        email: String(values.get("email")),
        subject: String(values.get("subject")),
        message: String(values.get("message")),
      });
      setMessage(result.message);
      setSuccess(true);
      form.reset();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Müraciət qeydə alınmadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="ƏLAQƏ"
        title="Sizi dinləməyə hazırıq"
        description="Xidmətlərimizlə bağlı sual, təklif və müraciətlərinizi bizimlə bölüşün."
      />
      <div className="container content-area content-grid">
        <section className="panel">
          <div className="panel-heading">
            <MessageSquare size={23} />
            <div>
              <h2>Onlayn müraciət</h2>
              <p>Sualınızı aşağıdakı forma vasitəsilə göndərin</p>
            </div>
          </div>
          <div className="panel-body">
            <form onSubmit={submit}>
              <div className="field-row">
                <label className="field">
                  <span>Adınız</span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    placeholder="Demo istifadəçi"
                  />
                </label>
                <label className="field">
                  <span>E-poçt ünvanınız</span>
                  <input
                    type="email"
                    name="email"
                    required
                    maxLength={120}
                    autoComplete="email"
                    placeholder="istifadeci@example.com"
                  />
                </label>
              </div>
              <label className="field">
                <span>Müraciətin mövzusu</span>
                <select name="subject" required>
                  <option value="">Mövzu seçin</option>
                  {[
                    "Ödəniş və balans",
                    "Elektron arayış",
                    "Tarif və hesablanma",
                    "Əmlak məlumatları",
                    "Təklif və digər müraciət",
                  ].map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Müraciətiniz</span>
                <textarea
                  name="message"
                  minLength={10}
                  maxLength={2000}
                  required
                  placeholder="Müraciətinizi ətraflı yazın…"
                />
                <small>
                  Demo formaya real şəxsi məlumat daxil etməyin. Maksimum 2 000
                  simvol.
                </small>
              </label>
              {message && (
                <Notice error={!success}>
                  {success && (
                    <CheckCircle2
                      size={16}
                      style={{ display: "inline", marginRight: 6 }}
                    />
                  )}
                  {message}
                </Notice>
              )}
              <button className="btn btn-primary" disabled={busy}>
                <Send size={16} />
                {busy ? "Qeydə alınır…" : "Müraciəti göndər"}
              </button>
              <p className="caption">
                Müraciət yalnız demo sistemində saxlanılır. Real e-poçt və
                bildiriş göndərilmir.
              </p>
            </form>
          </div>
        </section>
        <aside>
          <section className="panel">
            <div className="panel-heading">
              <MapPin size={23} />
              <h2>Əlaqə məlumatları</h2>
            </div>
            <div className="panel-body">
              <div className="contact-items">
                <div className="contact-item">
                  <MapPin />
                  <div>
                    <h3>Ünvan</h3>
                    <p>
                      Sumqayıt şəhəri, Azərbaycan
                      <br />
                      Vətəndaş qəbulu mərkəzi · nümunə ünvan
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone />
                  <div>
                    <h3>Məlumat xətti</h3>
                    <p>+994 (18) 000 00 00 · demo nömrə</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail />
                  <div>
                    <h3>Elektron poçt</h3>
                    <p>destek@sumqayit.example · nümunə</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Clock3 />
                  <div>
                    <h3>Qəbul saatları</h3>
                    <p>
                      Bazar ertəsi – Cümə · 09:00–18:00
                      <br />
                      Nümunə iş qrafiki
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="map-placeholder"
                role="img"
                aria-label="Sumqayıt üçün nümunə xəritə sahəsi"
              >
                <MapPin />
                <strong>Sumqayıt şəhəri</strong>
                <span>Xəritə inteqrasiyası üçün yer</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
