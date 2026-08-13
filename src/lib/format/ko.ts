const seoulDateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatSeoulDateTime(value: Date | string): string {
  return seoulDateTime.format(typeof value === "string" ? new Date(value) : value);
}

export function formatKoreanNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export function formatWon(value: bigint | number | string): string {
  const amount = typeof value === "bigint" ? value : BigInt(value);
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

export function formatPercentFromBasisPoints(value: number | null): string {
  if (value === null) return "산정 불가";
  return `${(value / 100).toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

export function formatReferenceMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return match ? `${match[1]}년 ${Number(match[2])}월` : value;
}

export function maskKoreanName(name: string): string {
  if (name.length <= 1) return "*";
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name.at(-1)}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 11) return "연락처 비공개";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}
