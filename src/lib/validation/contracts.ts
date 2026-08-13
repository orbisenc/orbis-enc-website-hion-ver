import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해 주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  mfaCode: z.string().regex(/^\d{6}$/, "인증번호 6자리를 입력해 주세요."),
});

export const verificationRequestSchema = z.object({
  token: z.string().min(8, "초대 링크를 다시 확인해 주세요."),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, "휴대전화 번호를 010-0000-0000 형식으로 입력해 주세요."),
});

export const verificationConfirmSchema = z.object({
  transactionId: z.string().uuid("본인 확인 요청을 다시 진행해 주세요."),
  otp: z.string().regex(/^\d{6}$/, "인증번호 6자리를 입력해 주세요."),
});

export const responseSchema = z.object({
  token: z.string().min(8, "초대 링크를 다시 확인해 주세요."),
  verificationId: z.string().uuid("본인 확인을 다시 진행해 주세요."),
  option: z.enum(["동의", "반대", "기권"]),
  comment: z.string().max(500, "의견은 500자 이내로 입력해 주세요.").optional(),
  idempotencyKey: z.string().uuid("제출 식별자가 올바르지 않습니다."),
  consentReviewed: z.literal(true, { error: "동의 내용을 끝까지 확인해 주세요." }),
});

export const rosterRowSchema = z.object({
  동: z.string().min(1),
  호: z.string().min(1),
  이름: z.string().min(2),
  연락처: z.string().regex(/^010-\d{4}-\d{4}$/),
  권리유형: z.enum(["소유자", "임차인", "대리인", "공동소유자"]),
});

export const agendaAttachmentFieldsSchema = z.object({
  altTextKo: z.string().trim().min(2, "첨부 자료 설명을 2자 이상 입력해 주세요.").max(200, "첨부 자료 설명은 200자 이내로 입력해 주세요."),
});

const agendaText = (label: string, minimum: number, maximum: number) => z.string().trim().min(minimum, `${label}을(를) ${minimum}자 이상 입력해 주세요.`).max(maximum, `${label}은(는) ${maximum}자 이내로 입력해 주세요.`);

export const agendaDraftSchema = z.object({
  titleKo: agendaText("안건 제목", 5, 120),
  categoryKo: agendaText("안건 분류", 2, 30),
  summaryKo: agendaText("한 줄 요약", 10, 300),
  backgroundKo: agendaText("추진 배경", 10, 2000),
  changeScopeKo: agendaText("변경 범위", 10, 2000),
  benefitKo: agendaText("기대 효과", 10, 2000),
  scheduleKo: agendaText("예상 일정", 5, 1000),
  cautionsKo: agendaText("유의 사항", 5, 1000),
  contactKo: agendaText("문의처", 5, 200),
  consentTextKo: agendaText("최종 확인 문구", 10, 1000),
  options: z.array(z.string().trim().min(1).max(30)).length(3).refine((items) => items.join("|") === "동의|반대|기권", "관리 의결 선택지는 동의·반대·기권 순서를 유지해야 합니다."),
});

export const agendaActionSchema = z.object({
  action: z.enum(["NEW_VERSION", "REQUEST_REVIEW", "APPROVE", "RETURN", "PUBLISH"]),
  feedbackKo: z.string().trim().max(500, "검토 의견은 500자 이내로 입력해 주세요.").optional(),
}).superRefine((value, context) => {
  if (value.action === "RETURN" && (!value.feedbackKo || value.feedbackKo.length < 5)) context.addIssue({ code: "custom", path: ["feedbackKo"], message: "보완 요청 사유를 5자 이상 입력해 주세요." });
});

export const campaignSettingsSchema = z.object({
  nameKo: agendaText("현황 관리명", 5, 120),
  rosterVersionKo: agendaText("대상 명부", 5, 120),
  startsAt: z.string().datetime("시작 시각을 확인해 주세요."),
  endsAt: z.string().datetime("종료 시각을 확인해 주세요."),
  mode: z.enum(["OPINION", "MANAGEMENT_VOTE", "LEGAL_CONSENT"]),
  verificationLevel: z.enum(["SIMPLE_OTP", "IDENTITY_MATCH", "STRONG_SIGNATURE"]),
  anonymous: z.boolean(),
  allowResponseChange: z.boolean(),
  allowWithdrawal: z.boolean(),
  quorumPercentage: z.number().int().min(1).max(100),
  approvalPercentage: z.number().int().min(1).max(100),
  resultDisclosure: z.enum(["AFTER_CLOSE", "REAL_TIME", "ADMIN_ONLY"]),
});

export const campaignActionSchema = z.object({
  to: z.enum(["SCHEDULED", "OPEN", "PAUSED", "CLOSED", "FINALIZED", "ARCHIVED"]),
  reasonKo: z.string().trim().min(5, "상태 변경 사유를 5자 이상 입력해 주세요.").max(300),
});

export const campaignFollowUpSchema = z.object({
  segments: z.array(z.enum(["UNRESPONDED", "DELIVERY_FAILED", "OPENED_NOT_VERIFIED"])).min(1, "재안내 대상을 하나 이상 선택해 주세요."),
  channel: z.enum(["SMS", "EMAIL"]),
  contentKo: z.string().trim().min(10, "재안내 문구를 10자 이상 입력해 주세요.").max(300),
});

export const feeImportMetadataSchema = z.object({
  periodId: z.string().min(8, "관리비 기준월을 선택해 주세요."),
  referenceMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "기준월은 YYYY-MM 형식이어야 합니다."),
  type: z.enum(["ASSESSMENT", "COLLECTION"]),
});

export const feeImportConfirmSchema = z.object({
  batchId: z.string().uuid("관리비 등록 식별자가 올바르지 않습니다."),
  idempotencyKey: z.string().uuid("중복 방지 식별자가 올바르지 않습니다."),
  warningReasonKo: z.string().trim().max(300, "경고 확인 사유는 300자 이내로 입력해 주세요.").optional(),
});

export const feePeriodActionSchema = z.object({
  periodId: z.string().min(8, "관리비 기준월을 선택해 주세요."),
  action: z.enum(["CONFIRM", "CLOSE", "REOPEN"]),
  reasonKo: z.string().trim().max(300, "사유는 300자 이내로 입력해 주세요.").optional(),
  idempotencyKey: z.string().uuid("중복 방지 식별자가 올바르지 않습니다."),
});

export const feeAdjustmentSchema = z.object({
  periodId: z.string().min(8, "관리비 기준월을 선택해 주세요."),
  unitKey: z.string().regex(/^10[1-5]동 \d{3,4}호$/, "동·호수를 확인해 주세요."),
  amount: z.string().regex(/^-?\d+$/, "조정액은 원 단위 정수로 입력해 주세요."),
  reasonKo: z.string().trim().min(5, "조정 사유를 한국어로 5자 이상 입력해 주세요.").max(300),
  idempotencyKey: z.string().uuid("중복 방지 식별자가 올바르지 않습니다."),
});

export const feeAdjustmentApprovalSchema = z.object({
  adjustmentId: z.string().uuid("조정 식별자가 올바르지 않습니다."),
  idempotencyKey: z.string().uuid("중복 방지 식별자가 올바르지 않습니다."),
});

export const feeCategoryUpdateSchema = z.object({
  nameKo: z.string().trim().min(2, "관리비 항목명은 2자 이상이어야 합니다.").max(50),
  descriptionKo: z.string().trim().max(200, "설명은 200자 이내로 입력해 주세요."),
  active: z.boolean(),
  displayOrder: z.number().int().min(1).max(999),
  includeInDashboard: z.boolean(),
});

export const agendaCostImpactSchema = z.object({
  estimatedProjectCost: z.string().regex(/^\d+$/, "총 예상 사업비는 0원 이상의 정수로 입력해 주세요."),
  actualProjectCost: z.string().regex(/^\d*$/, "실제 집행액은 원 단위 정수로 입력해 주세요."),
  fundingSourceKo: z.string().trim().min(2, "비용 집행 재원을 입력해 주세요.").max(200),
  usesLongTermRepairReserve: z.boolean(),
  requiresAdditionalFee: z.boolean(),
  additionalFeeTotal: z.string().regex(/^\d+$/, "관리비 추가 부과 총액은 0원 이상의 정수로 입력해 주세요."),
  allocationType: z.enum(["EQUAL", "AREA", "VOTING_RIGHT", "NONE"]),
  eligibleUnitCount: z.number().int().min(1).max(10_000),
  expectedBillingStartMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "예상 부과 기간은 YYYY-MM 형식이어야 합니다."),
  installmentCount: z.number().int().min(1).max(120),
  residentExplanationKo: z.string().trim().min(10, "입주민 안내 설명을 10자 이상 입력해 주세요.").max(1000),
  approved: z.boolean(),
});

export type ResponseInput = z.infer<typeof responseSchema>;
