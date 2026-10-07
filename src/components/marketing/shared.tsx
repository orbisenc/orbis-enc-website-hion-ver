import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, Database, Layers3, ScanLine } from "lucide-react";
import { deliveryStages, hionCapabilities, siteConfig } from "@/content/site";

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text" }) {
  return <Link className={`marketing-button button-${variant}`} href={href}>{children}<ArrowRight size={18} aria-hidden="true" /></Link>;
}

export function SectionHeading({ eyebrow, title, body, align = "left" }: { eyebrow?: string; title: string; body?: string; align?: "left" | "center" }) {
  return (
    <div className={`section-heading align-${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

type MarketingImage = { src: string; alt: string; caption?: string; priority?: boolean };

export function HeroMedia({ src, alt, caption, priority = false }: MarketingImage) {
  return (
    <figure className="hero-media">
      <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 1050px) 100vw, 46vw" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function PageHero({ eyebrow, title, body, children, media }: { eyebrow: string; title: string; body: string; children?: ReactNode; media?: MarketingImage }) {
  const eyebrowText = eyebrow.trim();

  return (
    <section className="page-hero">
      <div className="marketing-container page-hero-grid">
        <div>
          {eyebrowText ? <p className="eyebrow eyebrow-light">{eyebrowText}</p> : null}
          <h1>{title}</h1>
          <p className="hero-body">{body}</p>
          {children ? <div className="hero-actions">{children}</div> : null}
        </div>
        {media ? <HeroMedia {...media} /> : <BuildingSystemVisual compact />}
      </div>
    </section>
  );
}

export function BuildingSystemVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`system-visual${compact ? " system-visual-compact" : ""}`} role="img" aria-label="건물의 공간과 설비, 운영 데이터가 연결되는 구조를 표현한 설명 그림">
      <div className="visual-grid" aria-hidden="true" />
      <svg viewBox="0 0 620 440" aria-hidden="true">
        <defs>
          <linearGradient id="buildingFace" x1="0" x2="1"><stop stopColor="#0b2e68"/><stop offset="1" stopColor="#0a5fae"/></linearGradient>
          <linearGradient id="buildingSide" x1="0" x2="1"><stop stopColor="#073b7e"/><stop offset="1" stopColor="#061b49"/></linearGradient>
        </defs>
        <path d="M135 142 337 64l171 70-201 85z" fill="#e8f5ff" stroke="#48bad2" strokeWidth="2"/>
        <path d="M135 142v180l172 68V219z" fill="url(#buildingFace)" stroke="#67d3df" strokeWidth="2"/>
        <path d="M307 219v171l201-82V134z" fill="url(#buildingSide)" stroke="#67d3df" strokeWidth="2"/>
        {[0,1,2].map((row) => [0,1,2].map((col) => <rect key={`f${row}${col}`} x={164+col*47} y={181+row*51} width="31" height="27" rx="2" fill="#8fe0ec" opacity={0.2 + (row+col)%3*0.2}/>))}
        {[0,1,2].map((row) => [0,1,2,3].map((col) => <path key={`s${row}${col}`} d={`M${332+col*41} ${225-col*17+row*47}v28l27-11v-28z`} fill="#38bddd" opacity={0.18 + (row+col)%3*0.2}/>))}
        <path d="M94 351 306 435 545 337" fill="none" stroke="#00afc8" strokeWidth="2" strokeDasharray="7 8" opacity=".75"/>
        <circle cx="135" cy="142" r="6" fill="#5ee7f2"/><circle cx="307" cy="219" r="6" fill="#5ee7f2"/><circle cx="508" cy="134" r="6" fill="#5ee7f2"/><circle cx="307" cy="390" r="6" fill="#5ee7f2"/>
      </svg>
      <div className="visual-legend" aria-hidden="true">
        <span><ScanLine size={15} />공간</span>
        <span><Database size={15} />데이터</span>
        <span><Layers3 size={15} />자산</span>
      </div>
      <p className="visual-caption"><span /> 단일 정보원으로 연결된 건물 운영 체계</p>
    </div>
  );
}

export function MediaSequence({ items }: { items: Array<MarketingImage & { label: string }> }) {
  return (
    <div className="media-sequence">
      {items.map((item, index) => (
        <figure key={item.src}>
          <div className="media-sequence-image">
            <Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 100vw, 33vw" />
          </div>
          <figcaption><span>0{index + 1}</span><strong>{item.label}</strong>{item.caption ? <small>{item.caption}</small> : null}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ProcessFlow() {
  return (
    <ol className="process-flow">
      {deliveryStages.map((stage) => (
        <li key={stage.number}>
          <span className="process-number">{stage.number}</span>
          <div><h3>{stage.title}</h3><p>{stage.description}</p></div>
        </li>
      ))}
    </ol>
  );
}

export function CapabilityGrid() {
  return (
    <div className="capability-grid">
      {hionCapabilities.map((feature, index) => (
        <article key={feature.title}>
          <span className="feature-index">0{index + 1}</span>
          <h3>{feature.title}</h3><p>{feature.description}</p>
        </article>
      ))}
    </div>
  );
}

export function FinalCta({ title, body, href = "/contact", label = "도입 상담하기" }: { title: string; body: string; href?: string; label?: string }) {
  return (
    <section className="final-cta">
      <div className="marketing-container final-cta-inner">
        <div><p className="eyebrow eyebrow-light">NEXT STEP</p><h2>{title}</h2><p>{body}</p></div>
        <ButtonLink href={href}>{label}</ButtonLink>
      </div>
    </section>
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }} />;
}
