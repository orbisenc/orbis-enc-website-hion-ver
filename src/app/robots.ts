import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:["/","/hion","/solutions","/industries/education","/company","/contact"],disallow:["/privacy","/api/","/admin/","/login","/c/","/dashboard","/asset-map","/assets","/inspections","/work-orders","/replacement","/projects","/budget","/complaints","/notices","/meetings","/ai-insights","/documents","/reports","/settings/"]},sitemap:new URL("/sitemap.xml",siteConfig.url).toString(),host:siteConfig.url};}
