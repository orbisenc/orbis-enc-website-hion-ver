import { NextResponse } from "next/server";
import { clearFacilitySession } from "@/server/auth/session";
export async function POST(request: Request) { await clearFacilitySession(); return NextResponse.redirect(new URL("/login", request.url), 303); }
