import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { readAdminSession } from "@/server/auth/session";

export default async function SecureAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await readAdminSession())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}

