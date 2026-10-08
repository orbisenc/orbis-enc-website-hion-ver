import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = process.env.MARKETING_ORIGIN ?? "http://127.0.0.1:8788";
const siteUrl = process.env.SITE_URL ?? "https://www.orbisdnc.com";
const output = path.resolve("firebase-marketing-dist");
const pages = [
  ["/", "index.html"],
  ["/hion", "hion/index.html"],
  ["/solutions", "solutions/index.html"],
  ["/industries/education", "industries/education/index.html"],
  ["/company", "company/index.html"],
  ["/projects", "projects/index.html"],
  ["/contact", "contact/index.html"],
  ["/privacy", "privacy/index.html"],
];

const mobileNav = `<div class="static-mobile-nav" hidden><nav aria-label="모바일 주요 메뉴"><a href="/company">Company</a><a href="/solutions">Technology</a><a href="/industries/education">HiON School</a><a href="/projects">Projects</a><a href="/contact">Contact</a></nav></div>`;
const staticStyle = `<style>.static-mobile-nav{position:absolute;z-index:60;top:100%;right:0;left:0;padding:18px;background:#fff;border-top:1px solid #e0e5ec;box-shadow:0 18px 35px rgba(7,27,73,.14)}.static-mobile-nav nav{display:grid}.static-mobile-nav a{padding:14px 8px;border-bottom:1px solid #e6eaf0;color:#071b49;font-weight:750}.static-mobile-nav a:last-child{margin-top:10px;border:0;border-radius:4px;background:#071b49;color:#fff;text-align:center}.marketing-header{position:sticky}@media(min-width:1051px){.static-mobile-nav{display:none!important}}</style>`;
const staticScript = `<script>(function(){function ready(fn){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});else fn()}ready(function(){document.querySelectorAll("a.wordmark[href='/']").forEach(function(link){link.addEventListener("click",function(event){event.preventDefault();fetch("/",{cache:"reload"}).finally(function(){window.location.assign("/")})})});var container=document.querySelector(".marketing-site");var lockedUntil=0;var lockMs=760;var minDelta=8;var desktopQuery=window.matchMedia("(min-width:1051px)");function sections(){return Array.prototype.slice.call(document.querySelectorAll("main > section, .marketing-footer")).filter(function(el){var style=window.getComputedStyle(el);return style.display!=="none"&&el.offsetHeight>0})}function paddingTop(){return parseFloat(window.getComputedStyle(container).scrollPaddingTop)||0}function targetTop(section){return Math.max(0,section.offsetTop-paddingTop())}function currentIndex(items){var top=container.scrollTop;var best=0;var distance=Infinity;items.forEach(function(section,index){var diff=Math.abs(targetTop(section)-top);if(diff<distance){distance=diff;best=index}});return best}function go(direction){var now=window.performance.now();if(now<lockedUntil)return true;var items=sections();if(!container||items.length<2)return false;var current=currentIndex(items);var next=Math.min(Math.max(current+direction,0),items.length-1);if(next===current)return false;lockedUntil=now+lockMs;container.scrollTo({top:targetTop(items[next]),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});return true}function wheel(event){var target=event.target;var delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?window.innerHeight:1);if(!container||event.ctrlKey||!desktopQuery.matches||Math.abs(delta)<minDelta||Math.abs(event.deltaX)>Math.abs(delta)||(target instanceof Element&&target.closest("input,textarea,select,[contenteditable='true']")))return;if(go(delta>0?1:-1)){event.preventDefault();event.stopPropagation()}}window.addEventListener("wheel",wheel,{passive:false,capture:true});if(container)container.addEventListener("wheel",wheel,{passive:false,capture:true});document.addEventListener("keydown",function(event){if(!container||!desktopQuery.matches)return;var active=document.activeElement;if(active&&(active.matches("input,textarea,select")||active.getAttribute("contenteditable")==="true"))return;if(event.key==="ArrowDown"||event.key==="PageDown"||event.key===" "){if(go(1))event.preventDefault()}if(event.key==="ArrowUp"||event.key==="PageUp"){if(go(-1))event.preventDefault()}});var button=document.querySelector(".menu-trigger"),menu=document.querySelector(".static-mobile-nav");if(button&&menu){button.addEventListener("click",function(){var open=menu.hasAttribute("hidden");if(open)menu.removeAttribute("hidden");else menu.setAttribute("hidden","");button.setAttribute("aria-expanded",String(open));button.setAttribute("aria-label",open?"메뉴 닫기":"메뉴 열기")});document.addEventListener("keydown",function(event){if(event.key==="Escape"){menu.setAttribute("hidden","");button.setAttribute("aria-expanded","false")}})}})})();</script>`;

function transform(html, pathname) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>/gi, "")
    .replace(/\/_next\/image\?url=([^&"'\s]+)(?:&amp;|&)w=\d+(?:&amp;|&)q=\d+/g, (_, encoded) => decodeURIComponent(encoded))
    .replaceAll("https://www.orbisdnc.com", siteUrl)
    .replace("</head>", `${staticStyle}</head>`)
    .replace(/(<button class="menu-trigger"[\s\S]*?<\/button>)/, `$1${mobileNav}`)
    .replace("</body>", `${staticScript}</body>`)
    .replace("<head>", `<head><meta name="generator" content="ORBIS D&C static publishing"><meta property="og:url" content="${siteUrl}${pathname}">`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.resolve("dist/client"), output, { recursive: true });

for (const [pathname, file] of pages) {
  const response = await fetch(new URL(pathname, origin));
  if (!response.ok) throw new Error(`${pathname}: HTTP ${response.status}`);
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, transform(await response.text(), pathname), "utf8");
  console.log(`Generated ${file}`);
}

await writeFile(path.join(output, "404.html"), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>페이지를 찾을 수 없습니다 | ORBIS D&C</title><style>body{display:grid;min-height:100vh;place-items:center;margin:0;background:#071b49;color:white;font-family:system-ui;text-align:center}a{color:#5edbea}</style><main><h1>페이지를 찾을 수 없습니다.</h1><p><a href="/">ORBIS D&C 홈으로 돌아가기</a></p></main></html>`, "utf8");
await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, "utf8");
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([pathname]) => `<url><loc>${siteUrl}${pathname}</loc></url>`).join("")}</urlset>`, "utf8");
