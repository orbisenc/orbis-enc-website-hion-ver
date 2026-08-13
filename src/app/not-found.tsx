import { MarketingPage } from "@/components/marketing/page-layout";
import { ButtonLink } from "@/components/marketing/shared";

export default function NotFound(){return <MarketingPage><section className="not-found"><div className="marketing-container"><strong>404</strong><h1>요청하신 페이지를 찾을 수 없습니다.</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><div className="hero-actions" style={{justifyContent:"center"}}><ButtonLink href="/">홈으로 돌아가기</ButtonLink></div></div></section></MarketingPage>}
