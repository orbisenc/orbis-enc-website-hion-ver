import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";

export default function sitemap():MetadataRoute.Sitemap { const now=new Date(); return ["/","/hion","/solutions","/industries/education","/company","/contact"].map((path,index)=>({url:new URL(path,siteConfig.url).toString(),lastModified:now,changeFrequency:index===0?"monthly":"yearly",priority:index===0?1:.7})); }
