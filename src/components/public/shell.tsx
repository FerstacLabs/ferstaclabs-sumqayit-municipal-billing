"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  Globe2,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

const links = [
  ["/", "Əsas səhifə"],
  ["/services", "Xidmətlər"],
  ["/tariffs", "Tariflər"],
  ["/news", "Xəbərlər"],
  ["/contact", "Əlaqə"],
];

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      aria-label="Sumqayıt MKTİB — əsas səhifə"
    >
      <span className="brand-mark">
        <Building2 size={30} strokeWidth={1.6} />
        <i />
      </span>
      <span>
        <strong>SUMQAYIT</strong>
        <small>Mənzil-Kommunal Ödəniş Sistemi</small>
      </span>
    </Link>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="public-shell">
      <a className="skip-link" href="#main">
        Məzmuna keç
      </a>
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>
            <span className="flag">
              <i />
              <i />
              <i />
            </span>{" "}
            Sumqayıt şəhər mənzil-kommunal xidmətləri
          </span>
          <div>
            <span className="demo-label">Təqdimat versiyası</span>
            <span className="language">
              <Globe2 size={13} /> AZ
            </span>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={open ? "public-nav is-open" : "public-nav"}
            aria-label="Əsas naviqasiya"
          >
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={pathname === href ? "active" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link className="header-admin" href="/admin/dashboard">
            İdarəetmə paneli <ArrowUpRight size={16} />
          </Link>
          <button
            className="mobile-menu icon-button"
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Brand inverse />
            <p>
              Şəhərimiz üçün daha rahat,
              <br />
              daha şəffaf rəqəmsal xidmətlər.
            </p>
            <span className="footer-security">
              <ShieldCheck size={16} /> Təhlükəsizlik yönümlü layihələndirmə
            </span>
          </div>
          <div>
            <h3>Elektron xidmətlər</h3>
            <Link href="/payment">Borcu yoxla və ödə</Link>
            <Link href="/certificate">Elektron arayış al</Link>
            <Link href="/verify">Arayışın həqiqiliyini yoxla</Link>
          </div>
          <div>
            <h3>Faydalı keçidlər</h3>
            <Link href="/tariffs">Tariflər və hesablanma</Link>
            <Link href="/news">Xəbərlər və elanlar</Link>
            <Link href="/contact">Bizimlə əlaqə</Link>
          </div>
          <div className="footer-note">
            <span className="demo-label">DEMO PORTAL</span>
            <p>
              Bu portal təqdimat məqsədlidir. Məlumatlar sintetikdir, ödənişlər
              və şəxsiyyət təsdiqi simulyasiya olunur.
            </p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Sumqayıt Mənzil-Kommunal Ödəniş Sistemi</span>
          <span className="partner-brands">
            <strong>
              Ferstac<span>Labs</span>
            </strong>
            <i>×</i>
            <strong className="muhasib-brand">
              <b>1</b>Muhasib
            </strong>
            <span>texnologiyası ilə</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Əsas səhifə</Link>
          <ChevronRight size={13} />
          <span>{eyebrow}</span>
        </div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
