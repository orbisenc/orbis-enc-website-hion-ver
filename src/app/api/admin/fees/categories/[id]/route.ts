import { feeCategoryUpdateSchema } from "@/lib/validation/contracts";
import { updateFeeCategory } from "@/server/demo/fee-store";
import { assertSameOrigin } from "@/server/security/csrf";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context=await readFeeAccessContext(); if(!context)return Response.json({error:"로그인이 필요합니다."},{status:401});
  try{assertSameOrigin(request);assertFeeAccess(context,context.tenantId,"SETTINGS");}catch(error){return Response.json({error:error instanceof Error?error.message:"권한이 없습니다."},{status:403});}
  const parsed=feeCategoryUpdateSchema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message},{status:400});
  const {id}=await params;try{const category=updateFeeCategory(context.tenantId,id,parsed.data);return Response.json({category});}catch(error){return Response.json({error:error instanceof Error?error.message:"관리비 항목을 저장하지 못했습니다."},{status:409});}
}
