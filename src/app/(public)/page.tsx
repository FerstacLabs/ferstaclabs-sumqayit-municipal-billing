import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCheck,
  CreditCard,
  FileCheck2,
  FileText,
  House,
  Leaf,
  LockKeyhole,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

const actions = [
  {
    title: "Borcu yoxla",
    text: "Mənzilinizin balansını öyrənin",
    href: "/payment",
    icon: Search,
  },
  {
    title: "Onlayn ödəniş",
    text: "Bir neçə addımda ödəniş edin",
    href: "/payment?pay=1",
    icon: CreditCard,
  },
  {
    title: "Arayış al",
    text: "Elektron arayışınızı əldə edin",
    href: "/certificate",
    icon: FileText,
  },
  {
    title: "QR arayış yoxla",
    text: "Sənədin həqiqiliyini təsdiqləyin",
    href: "/verify",
    icon: QrCode,
  },
];
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span /> ŞƏHƏRİMİZ ÜÇÜN RƏQƏMSAL XİDMƏTLƏR
            </div>
            <h1>
              Rahat ödəniş.
              <br />
              Şəffaf xidmət.
              <br />
              <em>Daha gözəl Sumqayıt.</em>
            </h1>
            <p>
              Mənzil-kommunal ödənişlərinizi idarə edin, borcunuzu yoxlayın və
              arayışınızı onlayn əldə edin.
            </p>
            <div className="hero-buttons">
              <Link className="btn btn-primary" href="/payment">
                Borcu yoxla və ödə <ArrowRight size={18} />
              </Link>
              <Link className="btn btn-quiet" href="/services">
                Xidmətlərlə tanış ol <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <Check size={15} /> Növbəsiz xidmət
              </span>
              <span>
                <Check size={15} /> 24/7 əlçatanlıq
              </span>
              <span>
                <Check size={15} /> Vahid ödəniş kodu
              </span>
            </div>
          </div>
          <div className="city-visual">
            <Image
              src="/sumqayit-city.svg"
              alt="Xəzər sahilində Sumqayıtın şəhər həyatından ilhamlanan memarlıq illüstrasiyası"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className="city-caption">
              <span>
                <MapPin size={14} /> SUMQAYIT, AZƏRBAYCAN
              </span>
              <strong>Bir şəhər. Bir sistem.</strong>
            </div>
            <div className="city-status">
              <span className="status-dot" /> Rəqəmsal xidmətlər bir ünvanda
            </div>
          </div>
        </div>
      </section>
      <section
        className="container quick-actions"
        aria-label="Sürətli xidmətlər"
      >
        {actions.map(({ title, text, href, icon: Icon }, i) => (
          <Link href={href} key={href} className="quick-card">
            <span className={`action-icon action-${i}`}>
              <Icon size={23} />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <ArrowUpRight className="quick-arrow" size={19} />
          </Link>
        ))}
      </section>
      <section className="container section services-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">VƏTƏNDAŞ ÜÇÜN</span>
            <h2>Gündəlik qayğılar, sadə həllər</h2>
            <p>Mənzilinizə və obyektinizə aid bütün kommunal xidmətlər.</p>
          </div>
          <Link href="/services" className="text-link">
            Bütün xidmətlər <ArrowRight size={17} />
          </Link>
        </div>
        <div className="service-grid">
          {[
            {
              icon: Leaf,
              n: "01",
              title: "Tullantıların daşınması",
              desc: "Məişət tullantılarının yığılması və ərazinin təmiz saxlanılması.",
              price: "0,70 ₼",
              unit: "qeydiyyatda olan şəxs / ay",
            },
            {
              icon: House,
              n: "02",
              title: "Mənzilə xidmət",
              desc: "Yaşayış binalarının ümumi sahələrinə kommunal xidmət.",
              price: "0,15 ₼",
              unit: "çıxarış üzrə m² / ay",
            },
            {
              icon: Store,
              n: "03",
              title: "Qeyri-yaşayış obyektləri",
              desc: "Mağaza, ofis və digər obyektlər üçün fərdi xidmət tarifləri.",
              price: "Fərdi tarif",
              unit: "təsdiq edilmiş müqavilə üzrə",
            },
            {
              icon: FileCheck2,
              n: "04",
              title: "Elektron arayış",
              desc: "Borc vəziyyəti barədə QR kodla yoxlanılan elektron sənəd.",
              price: "Onlayn müraciət",
              unit: "rahat və əlçatan xidmət",
            },
          ].map(({ icon: Icon, n, title, desc, price, unit }) => (
            <Link
              href={n === "04" ? "/certificate" : "/tariffs"}
              className="service-card"
              key={n}
            >
              <div className="service-card-top">
                <Icon size={27} strokeWidth={1.6} />
                <span>{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="service-price">
                <strong>{price}</strong>
                <span>{unit}</span>
              </div>
              <ArrowUpRight className="service-arrow" size={20} />
            </Link>
          ))}
        </div>
        <p className="caption">
          Tariflər təqdimat ssenarisinə aiddir; rəsmi tarif qərarı hesab
          edilmir.
        </p>
      </section>
      <section className="city-numbers">
        <div className="container numbers-grid">
          <div>
            <span className="eyebrow">SUMQAYIT ÜÇÜN BİRLİKDƏ</span>
            <h2>
              Şəhər miqyasında.
              <br />
              İnsan mərkəzində.
            </h2>
            <span className="small-muted">
              Təqdimat üçün nümunə göstəricilər
            </span>
          </div>
          <div className="number-card">
            <Users />
            <strong>500 000</strong>
            <span>Şəhər sakini</span>
          </div>
          <div className="number-card">
            <Building2 />
            <strong>1 352</strong>
            <span>Yaşayış binası</span>
          </div>
          <div className="number-card">
            <House />
            <strong>166 000</strong>
            <span>Mənzil</span>
          </div>
          <div className="number-card">
            <CreditCard />
            <strong>1,8 mln ₼</strong>
            <span>Aylıq ödəniş həcmi</span>
          </div>
        </div>
      </section>
      <section className="container section how-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NECƏ İŞLƏYİR?</span>
            <h2>Cəmi 3 addımda hazırdır</h2>
          </div>
          <span className="subtle-pill">
            <Sparkles size={15} /> Sizin vaxtınız dəyərlidir
          </span>
        </div>
        <div className="steps-grid">
          {[
            {
              n: "01",
              icon: Search,
              title: "Ödəniş kodunuzu daxil edin",
              desc: "Mənzilinizə məxsus 12 rəqəmli kodla xidmətə başlayın.",
            },
            {
              n: "02",
              icon: CreditCard,
              title: "Balansınızı yoxlayın və ödəyin",
              desc: "Hesablanmış məbləği görün və ödənişi təsdiqləyin.",
            },
            {
              n: "03",
              icon: CheckCheck,
              title: "Qəbzinizi dərhal əldə edin",
              desc: "Ödəniş qeydə alınır, elektron qəbziniz hazır olur.",
            },
          ].map(({ n, icon: Icon, title, desc }) => (
            <div className="step" key={n}>
              <div className="step-top">
                <span>{n}</span>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container property-code-banner">
        <div className="code-icon">
          <LockKeyhole size={31} />
        </div>
        <div>
          <span className="eyebrow">BİR MƏNZİL, DAİMİ KOD</span>
          <h2>Sahib dəyişir. Ödəniş kodu dəyişmir.</h2>
          <p>
            Ödəniş kodu şəxsə deyil, əmlaka bağlıdır. Alqı-satqı zamanı da eyni
            qalır.
          </p>
        </div>
        <div className="sample-code">
          <span>NÜMUNƏ ÖDƏNİŞ KODU</span>
          <strong>5274 1893 6204</strong>
          <Link href="/payment?code=527418936204">
            Demo kodla yoxla <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ŞƏHƏRİN GÜNDƏMİ</span>
            <h2>Xəbərlər və elanlar</h2>
          </div>
          <Link href="/news" className="text-link">
            Bütün xəbərlər <ArrowRight size={17} />
          </Link>
        </div>
        <div className="news-grid">
          {[
            {
              tag: "Rəqəmsal xidmət",
              date: "12 sentyabr 2026",
              title: "Kommunal xidmətlər artıq vahid rəqəmsal platformada",
              style: "digital",
              icon: Building2,
            },
            {
              tag: "Məlumatlandırma",
              date: "8 sentyabr 2026",
              title: "Vahid ödəniş kodunuzu necə əldə edə bilərsiniz?",
              style: "codes",
              icon: QrCode,
            },
            {
              tag: "Şəhər həyatı",
              date: "5 sentyabr 2026",
              title: "Təmiz məhəllə, sağlam şəhər: birlikdə daha yaxşı",
              style: "green",
              icon: Leaf,
            },
          ].map(({ tag, date, title, style, icon: Icon }, i) => (
            <Link
              href={`/news#xeber-${i + 1}`}
              key={title}
              className="news-card"
            >
              <div className={`news-art ${style}`}>
                <Icon size={58} strokeWidth={1} />
                <span>
                  SUMQAYIT<span>ŞƏHƏRİMİZİN SABAHI</span>
                </span>
                <i />
                <i />
              </div>
              <div className="news-body">
                <span className="news-meta">
                  <b>{tag}</b>
                  {date}
                </span>
                <h3>{title}</h3>
                <span className="text-link">
                  Ətraflı oxu <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container help-banner">
        <div>
          <ShieldCheck size={26} />
          <div>
            <h2>Bir sualınız var?</h2>
            <p>Xidmətlər və ödənişlər barədə sizə kömək edək.</p>
          </div>
        </div>
        <Link href="/contact" className="btn btn-white">
          Bizimlə əlaqə <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
