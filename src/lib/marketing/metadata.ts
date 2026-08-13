import type { Metadata } from "next";
import { siteConfig } from "@/content/site";

export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const canonical = new URL(path, siteConfig.url).toString();
  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
    },
  };
}
