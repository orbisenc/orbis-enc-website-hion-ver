import { z } from "zod";
import { facilityTypes, inquiryTypes } from "@/content/site";

const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label}을(를) 입력해 주세요.`).max(max, `${label}은(는) ${max}자 이하로 입력해 주세요.`);
const optionalText = (max: number) => z.string().trim().max(max, `${max}자 이하로 입력해 주세요.`).optional().default("");

export const inquirySchema = z.object({
  inquiryType: z.enum(inquiryTypes, { error: "문의 유형을 선택해 주세요." }),
  organization: requiredText("기관·회사명", 120),
  name: requiredText("이름", 60),
  department: optionalText(100),
  email: z.email("올바른 업무 이메일을 입력해 주세요.").max(180, "이메일은 180자 이하로 입력해 주세요."),
  phone: z.string().trim().min(1, "연락처를 입력해 주세요.").max(30, "연락처는 30자 이하로 입력해 주세요.").regex(/^[0-9+()\-\s]{8,30}$/, "올바른 연락처를 입력해 주세요."),
  facilityType: z.enum(facilityTypes, { error: "시설 유형을 선택해 주세요." }),
  facilityScale: optionalText(100),
  desiredTiming: optionalText(100),
  message: optionalText(1000),
  privacyConsent: z.literal(true, { error: "개인정보 수집·이용에 동의해 주세요." }),
  website: z.string().max(0, "요청을 처리할 수 없습니다.").optional().default(""),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
