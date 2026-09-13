import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  FileText,
  House,
  Store,
} from "lucide-react";
import { PageIntro } from "@/components/public/shell";
import { Notice } from "@/components/public/ui";
export const metadata = { title: "Tariflər" };
export default function Tariffs() {
  return (
    <>
      <PageIntro
        eyebrow="TARİFLƏR"
        title="Aydın tariflər, şəffaf hesablanma"
        description="Yaşayış sahələri üzrə aylıq xidmət haqlarını və qeyri-yaşayış obyektləri üçün tarifin təyin olunması qaydasını öyrənin."
      />
      <div className="container content-area content-grid">
        <div>
          <section className="panel">
            <div className="panel-heading">
              <House size={23} />
              <h2>Yaşayış sahələri üçün tariflər</h2>
            </div>
            <div className="table-scroll">
              <table className="tariff-table">
                <thead>
                  <tr>
                    <th>Xidmət</th>
                    <th>Hesablanma vahidi</th>
                    <th>Aylıq tarif</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Tullantıların daşınması<small>Zibil pulu</small>
                    </td>
                    <td>Qeydiyyatda olan hər şəxs</td>
                    <td>
                      <b>0,70 ₼</b>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Mənzilə xidmət<small>Ev pulu</small>
                    </td>
                    <td>Çıxarışda göstərilən hər m²</td>
                    <td>
                      <b>0,15 ₼</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="panel-body">
              <Notice>
                Bu tariflər demo üçün verilmiş nümunələrdir. Rəsmi təsdiq
                edilmiş tarif qərarını əvəz etmir.
              </Notice>
            </div>
          </section>
          <section className="panel calculation">
            <div className="panel-heading">
              <Calculator size={23} />
              <h2>Nümunə hesablanma</h2>
            </div>
            <div className="panel-body">
              <p>4 nəfərin qeydiyyatda olduğu 72,5 m² sahəli mənzil üçün:</p>
              <div className="calc-equation">
                <div>
                  <span>Zibil pulu</span>
                  <strong>4 × 0,70 = 2,80 ₼</strong>
                </div>
                <div>
                  <span>Ev pulu</span>
                  <strong>72,5 × 0,15 ≈ 10,88 ₼</strong>
                </div>
              </div>
              <div className="charge-line total">
                <span>Aylıq ümumi məbləğ</span>
                <strong>13,68 ₼</strong>
              </div>
              <p className="caption">
                Hər xidmət sətri qəpik dəqiqliyinə yuvarlaqlaşdırılır. Üç aylıq
                ödənilməmiş balans: 41,04 ₼.
              </p>
              <Link
                href="/payment?code=527418936204"
                className="btn btn-primary"
                style={{ marginTop: 20 }}
              >
                Nümunə balansı yoxla <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
        <aside className="info-stack">
          <section className="info-panel">
            <h3>
              <Store /> Qeyri-yaşayış obyektləri
            </h3>
            <p>
              Mağaza, klinika, market və ofislər üçün tarif ərazi təmizlik rəisi
              tərəfindən fərdi qaydada təyin olunur.
            </p>
            <ol className="flow-list">
              <li>Ərazi rəisi tarifi təklif edir</li>
              <li>Maliyyə bölməsi təklifi nəzərdən keçirir</li>
              <li>Səlahiyyətli şəxs tarifi təsdiqləyir</li>
              <li>Tarif qüvvəyə minmə tarixindən tətbiq edilir</li>
            </ol>
          </section>
          <section className="info-panel">
            <h3>
              <BadgeCheck /> Hesabın tarixçəsi qorunur
            </h3>
            <p>
              Aylıq hesab yaradılarkən sakin sayı, əmlakın sahəsi və tarif
              ayrıca saxlanılır. Sonrakı dəyişikliklər əvvəlki ayın hesabını
              dəyişmir.
            </p>
          </section>
          <section className="info-panel">
            <h3>
              <FileText /> Tariflə bağlı müraciət
            </h3>
            <p>
              Hesablanma ilə bağlı uyğunsuzluq gördükdə ödəniş kodunuzu qeyd
              edərək müraciət edə bilərsiniz.
            </p>
            <Link href="/contact" className="text-link">
              Müraciət göndər <ArrowRight size={15} />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
