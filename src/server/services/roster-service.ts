import { rosterRowSchema } from "@/lib/validation/contracts";
import { sha256 } from "@/lib/security/hash";
export interface RosterPreview { total: number; valid: number; errors: Array<{ row: number; messageKo: string }>; sourceFileHash: string }
export function previewRoster(rows: unknown[]): RosterPreview {
  const errors: RosterPreview["errors"] = []; const seen=new Set<string>();
  rows.forEach((row,index)=>{const parsed=rosterRowSchema.safeParse(row);if(!parsed.success){errors.push({row:index+2,messageKo:parsed.error.issues[0]?.message??"형식 오류"});return;}const key=`${parsed.data.동}-${parsed.data.호}`;if(seen.has(key))errors.push({row:index+2,messageKo:"동일한 동·호가 중복되었습니다."});seen.add(key);});
  return {total:rows.length,valid:rows.length-errors.length,errors,sourceFileHash:sha256(rows)};
}

