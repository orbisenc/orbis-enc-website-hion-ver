import type { Metadata } from "next";
import { RemoteBrowserClient } from "./remote-browser-client";

export const metadata: Metadata = {
  title: "원격 웹 브라우저 | HION",
  description: "임베디드 환경에서 사용하는 격리형 원격 웹 브라우저",
};

export default function WebBrowserPage() {
  return <RemoteBrowserClient />;
}
