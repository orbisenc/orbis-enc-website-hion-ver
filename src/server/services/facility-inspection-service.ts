export function calculateNextInspectionDate(lastInspectedAt: Date, cycleDays: number) {
  if (!Number.isInteger(cycleDays) || cycleDays <= 0) throw new Error("점검 주기는 1일 이상의 정수여야 합니다.");
  const next = new Date(lastInspectedAt);
  next.setUTCDate(next.getUTCDate() + cycleDays);
  return next;
}

export function isInspectionOverdue(nextInspectionAt: Date, referenceAt: Date) {
  return nextInspectionAt.getTime() < referenceAt.getTime();
}
