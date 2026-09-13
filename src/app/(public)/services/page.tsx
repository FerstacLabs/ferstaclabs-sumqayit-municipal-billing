import Link from "next/link";
import { ArrowRight, FileCheck2, House, Leaf, Store } from "lucide-react";
import { PageIntro } from "@/components/public/shell";
export const metadata = { title: "Xidmətlər" };
export default function Services() {
  return (
    <>
      <PageIntro
        eyebrow="ELEKTRON XİDMƏTLƏR"
        title="Şəhər xidmətləri sizə daha yaxın"
        description="Mənzil-kommunal xidmətlərinizi bir ünvandan idarə edin. Hər xidmət haqqında məlumat alın və onlayn əməliyyata başlayın."
      />
      <div className="container content-area">
        <div className="service-detail">
          {[
            {
              icon: Leaf,
              title: "Tullantıların daşınması",
              text: "Məişət tullantılarının yığılması, daşınması və yaşayış ərazilərinin təmiz saxlanılması xidməti. Aylıq ödəniş qeydiyyatda olan şəxslərin sayına əsasən, hər nəfər üçün 0,70 ₼ hesablanır.",
              href: "/payment",
              action: "Balansı yoxla",
            },
            {
              icon: House,
              title: "Mənzilə kommunal xidmət",
              text: "Yaşayış binalarının ümumi istifadədə olan sahələrinə xidmət. Ödəniş çıxarışda göstərilən sahəyə əsasən, hər m² üçün aylıq 0,15 ₼ tariflə hesablanır.",
              href: "/tariffs",
              action: "Hesablanma ilə tanış ol",
            },
            {
              icon: Store,
              title: "Qeyri-yaşayış obyektləri",
              text: "Mağaza, market, klinika və ofislər üçün müqavilə əsasında kommunal xidmətlər. Fərdi tarif ərazi rəisi tərəfindən təklif edilir və təsdiqdən sonra qüvvəyə minir.",
              href: "/contact",
              action: "Müraciət et",
            },
            {
              icon: FileCheck2,
              title: "Elektron arayış xidməti",
              text: "Əmlakın borc vəziyyətini əks etdirən elektron sənəd. SMS, SİMA və ya ASAN vasitəsilə demo təsdiqdən sonra unikal nömrə və QR kodla arayış hazırlanır.",
              href: "/certificate",
              action: "Arayış al",
            },
          ].map(({ icon: Icon, title, text, href, action }) => (
            <section className="panel" key={title}>
              <div className="panel-body">
                <Icon size={33} strokeWidth={1.5} />
                <h2>{title}</h2>
                <p>{text}</p>
                <Link className="btn btn-secondary" href={href}>
                  {action}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          ))}
        </div>
        <p className="caption">
          Xidmətlər və tariflər təqdimat ssenarisidir. Real ödəniş və rəsmi
          arayış verilməsi həyata keçirilmir.
        </p>
      </div>
    </>
  );
}
