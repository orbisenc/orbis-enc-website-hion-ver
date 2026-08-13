import Link from "next/link";
export default function NotFound() { return <main className="resident-container"><h1>초대 링크를 확인할 수 없습니다</h1><p>링크가 만료되었거나 올바르지 않습니다. 개인정보 보호를 위해 대상자 등록 여부는 안내하지 않습니다.</p><p>관리사무소에 문의하거나 받은 안내에서 링크를 다시 열어 주세요.</p><Link className="btn" href="/">처음으로</Link></main>; }

