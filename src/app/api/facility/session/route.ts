import { NextResponse } from "next/server";
import { readFacilitySession } from "@/server/auth/session";
export async function GET() { const session = await readFacilitySession(); return NextResponse.json({ session: session ? { name: session.name, role: session.role, tenantId: session.tenantId, complexId: session.complexId } : null }); }
