import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageIntro } from "@/components/public/shell";
export const metadata = { title: "Xəbərlər və elanlar" };
export default function News() {
  return (
    <>
      <PageIntro
        eyebrow="XƏBƏRLƏR VƏ ELANLAR"
        title="Şəhərimizin gündəmi"
        description="Rəqəmsal xidmətlər, kommunal ödənişlər və məhəllə həyatı ilə bağlı nümunə məlumatlar."
      />
      <div className="container content-area">
        {[
          {
            title: "Kommunal xidmətlər artıq vahid rəqəmsal platformada",
            tag: "Rəqəmsal xidmət",
            date: "12 sentyabr 2026",
            paragraphs: [
              "Sumqayıt şəhər mənzil-kommunal ödəniş sisteminin təqdimat versiyası vətəndaş xidmətlərini vahid ünvanda birləşdirir. Əmlakın balansının yoxlanılması, onlayn ödəniş və elektron arayış hazırlanması əsas xidmətlər sırasındadır.",
              "Portalın demo versiyasında bütün əməliyyatlar sintetik məlumatlarla aparılır. İstifadəçilər nümunə ödəniş kodundan istifadə edərək xidmətlərin iş prinsipi ilə tanış ola bilərlər.",
            ],
            href: "/services",
            action: "Xidmətləri kəşf et",
          },
          {
            title: "Vahid ödəniş kodunuzu necə əldə edə bilərsiniz?",
            tag: "Məlumatlandırma",
            date: "8 sentyabr 2026",
            paragraphs: [
              "Hər bir əmlaka 12 rəqəmli unikal ödəniş kodu təyin olunur. Kod əmlakın sahibinə deyil, birbaşa mənzilə bağlıdır və alqı-satqı zamanı dəyişmir. Daxili struktur kodu isə binaların və mənzillərin inzibati uçotu üçün nəzərdə tutulur.",
              "Təqdimat zamanı 527418936204 kodundan istifadə edə bilərsiniz. Real istifadədə kodun əldə olunması və əmlak məlumatlarının dəqiqləşdirilməsi üçün yerli xidmət sahəsinə müraciət nəzərdə tutulur.",
            ],
            href: "/payment?code=527418936204",
            action: "Nümunə kodla yoxla",
          },
          {
            title: "Təmiz məhəllə, sağlam şəhər: birlikdə daha yaxşı",
            tag: "Şəhər həyatı",
            date: "5 sentyabr 2026",
            paragraphs: [
              "Yaşayış ərazilərinin təmizliyi sakinlərin gündəlik rahatlığı üçün vacibdir. Məişət tullantılarının ayrılmış yerlərə atılması və ümumi sahələrə qayğı ilə yanaşılması şəhər mühitinin yaxşılaşmasına kömək edir.",
              "Məhəllənizdə kommunal xidmətlə bağlı məsələni dəstək forması vasitəsilə bildirə bilərsiniz. Demo versiyada müraciət sistemdə qeydə alınır, xarici qurumlara göndərilmir.",
            ],
            href: "/contact",
            action: "Müraciət göndər",
          },
        ].map(({ title, tag, date, paragraphs, href, action }, i) => (
          <article className="article" id={`xeber-${i + 1}`} key={title}>
            <div className="news-meta">
              <b>{tag}</b>
              <time>{date}</time>
              <span>Nümunə elan</span>
            </div>
            <h2>{title}</h2>
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <Link href={href} className="text-link">
              {action}
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
