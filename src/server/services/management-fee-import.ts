import Papa from "papaparse";
import { sha256 } from "@/lib/security/hash";
import { addFeeImportBatch, feeCategories, feeDemoStore, findFeeImportByHash, FEE_DEMO_COMPLEX_CODE, generateFeeUnits, getFeePeriod, type FeeImportBatchView, type FeeImportIssue, type FeeImportType } from "@/server/demo/fee-store";
import { LocalStorageProvider } from "@/server/providers/local-storage";
import { assertFeeAccess, type FeeAccessContext } from "./management-fee-auth";

const storage = new LocalStorageProvider();
const MAX_CSV_SIZE = 10 * 1024 * 1024;
const assessmentHeaders = ["단지코드", "기준월", "동", "호", "항목코드", "부과액", "외부행ID", "원본합계"];
const collectionHeaders = ["단지코드", "기준월", "동", "호", "거래유형", "금액", "거래일", "외부거래번호", "원본합계"];

function decodeKoreanCsv(data: Uint8Array) {
  const bytes = data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf ? data.slice(3) : data;
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), encoding: "UTF-8" };
  } catch {
    try {
      return { text: new TextDecoder("euc-kr", { fatal: true }).decode(bytes), encoding: "EUC-KR" };
    } catch {
      throw new Error("CSV 문자 인코딩을 확인할 수 없습니다. UTF-8 또는 EUC-KR로 저장해 주세요.");
    }
  }
}

function validUnit(building: string, unit: string) {
  const buildingNumber = Number(building);
  const floor = Number(unit.slice(0, -2));
  const line = Number(unit.slice(-2));
  return Number.isInteger(buildingNumber) && buildingNumber >= 101 && buildingNumber <= 105 && /^\d{3,4}$/.test(unit) && floor >= 1 && floor <= 40 && line >= 1 && line <= 10;
}

function parseWon(value: string) {
  const normalized = value.replaceAll(",", "").trim();
  if (!/^\d+$/.test(normalized)) return null;
  return BigInt(normalized);
}

function issue(rowNumber: number, column: string | null, severity: FeeImportIssue["severity"], codeKo: string, messageKo: string, row: Record<string, string>): FeeImportIssue {
  return { rowNumber, column, severity, codeKo, messageKo, maskedSummary: `${row.동 ?? "?"}동 ${row.호 ?? "?"}호 · 금액과 개인 식별 정보 비공개` };
}

export function koreanFeeCsvTemplate(type: FeeImportType) {
  if (type === "ASSESSMENT") return `\uFEFF${assessmentHeaders.join(",")}\r\n${FEE_DEMO_COMPLEX_CODE},2026-07,101,101,GENERAL,185000,2026-07-101-101-GENERAL,185000\r\n`;
  return `\uFEFF${collectionHeaders.join(",")}\r\n${FEE_DEMO_COMPLEX_CODE},2026-07,101,101,수납,185000,2026-07-10,PAY-202607-101-101,185000\r\n`;
}

export async function previewFeeImport(context: FeeAccessContext, input: { periodId: string; referenceMonth: string; type: FeeImportType; filename: string; mimeType: string; data: Uint8Array; columnMapping?: Record<string, string> }) {
  assertFeeAccess(context, context.tenantId, "IMPORT");
  const period = getFeePeriod(context.tenantId, input.periodId);
  if (period.state === "CLOSED") throw new Error("마감된 기준월에는 CSV를 등록할 수 없습니다.");
  if (period.referenceMonth !== input.referenceMonth) throw new Error("선택한 기준월과 등록 대상 기준월이 다릅니다.");
  if (input.data.byteLength === 0 || input.data.byteLength > MAX_CSV_SIZE) throw new Error("CSV 파일은 10MB 이하여야 합니다.");
  if (!input.filename.toLowerCase().endsWith(".csv") || (input.mimeType && !["text/csv", "application/vnd.ms-excel", "text/plain"].includes(input.mimeType))) throw new Error("CSV 파일만 등록할 수 있습니다.");
  if (input.data.includes(0)) throw new Error("실행 파일 또는 이진 파일은 등록할 수 없습니다.");
  const fileHash = sha256(input.data);
  if (findFeeImportByHash(context.tenantId, fileHash)) throw new Error("같은 내용의 CSV 파일이 이미 등록되어 있습니다.");
  const { text, encoding } = decodeKoreanCsv(input.data);
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: "greedy", transformHeader: (header) => header.trim(), transform: (value) => value.trim() });
  const sourceFields = parsed.meta.fields ?? [];
  const mapping = input.columnMapping && Object.keys(input.columnMapping).length > 0 ? input.columnMapping : Object.fromEntries(sourceFields.map((field) => [field, field]));
  const data = parsed.data.map((sourceRow) => Object.fromEntries(Object.entries(mapping).filter(([, target]) => target).map(([source, target]) => [target, sourceRow[source] ?? ""])) as Record<string, string>);
  const requiredHeaders = input.type === "ASSESSMENT" ? assessmentHeaders.slice(0, -1) : collectionHeaders.slice(0, -1);
  const actualHeaders = Object.values(mapping);
  const issues: FeeImportIssue[] = [];
  for (const header of requiredHeaders) if (!actualHeaders.includes(header)) issues.push(issue(1, header, "BLOCKING", "필수 열 누락", `${header} 열이 없습니다. 한국어 양식을 다시 내려받아 주세요.`, {}));
  for (const error of parsed.errors) issues.push(issue((error.row ?? 0) + 2, null, "BLOCKING", "CSV 형식 오류", "CSV 열 구분과 따옴표 형식을 확인해 주세요.", {}));

  const seen = new Set<string>();
  const seenExternalIds = new Set<string>();
  const existingExternalIds = new Set(feeDemoStore.imports.filter((batch) => batch.type === input.type && batch.status !== "REJECTED").flatMap((batch) => batch.records.map((row) => input.type === "ASSESSMENT" ? row.외부행ID : row.외부거래번호)).filter(Boolean));
  const unitAssessments = new Map(generateFeeUnits(input.referenceMonth).map((unit) => [`${unit.building}|${unit.unit}`, unit.finalAssessment]));
  let calculatedTotal = 0n;
  let declaredTotal: bigint | null = null;
  const categoryCodes = new Set(feeCategories.map((category) => category.code));
  data.forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.단지코드 !== FEE_DEMO_COMPLEX_CODE) issues.push(issue(rowNumber, "단지코드", "BLOCKING", "다른 단지 자료", "현재 단지와 다른 단지코드가 포함되어 있습니다.", row));
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(row.기준월 ?? "") || row.기준월 !== input.referenceMonth) issues.push(issue(rowNumber, "기준월", "BLOCKING", "기준월 오류", "기준월은 선택한 기준월과 같은 YYYY-MM 형식이어야 합니다.", row));
    if (!validUnit(row.동 ?? "", row.호 ?? "")) issues.push(issue(rowNumber, "동·호", "BLOCKING", "존재하지 않는 세대", "현재 단지 명부에서 동·호수를 찾을 수 없습니다.", row));
    const amountColumn = input.type === "ASSESSMENT" ? "부과액" : "금액";
    const amount = parseWon(row[amountColumn] ?? "");
    if (amount === null) issues.push(issue(rowNumber, amountColumn, "BLOCKING", "금액 형식 오류", "금액은 쉼표를 제외한 0원 이상의 정수로 입력해 주세요.", row));
    else calculatedTotal += amount;
    if (row.원본합계) {
      const value = parseWon(row.원본합계);
      if (value === null) issues.push(issue(rowNumber, "원본합계", "BLOCKING", "원본 합계 오류", "원본합계는 0원 이상의 정수여야 합니다.", row));
      else if (declaredTotal === null) declaredTotal = value;
    }
    if (input.type === "ASSESSMENT") {
      if (!categoryCodes.has(row.항목코드 ?? "")) issues.push(issue(rowNumber, "항목코드", "BLOCKING", "알 수 없는 관리비 항목", "등록되지 않은 관리비 항목코드입니다.", row));
      const key = `${row.기준월}|${row.동}|${row.호}|${row.항목코드}`;
      if (!row.외부행ID) issues.push(issue(rowNumber, "외부행ID", "BLOCKING", "외부행 식별자 누락", "중복 방지를 위한 외부행ID가 필요합니다.", row));
      else if (seen.has(key) || seenExternalIds.has(row.외부행ID) || existingExternalIds.has(row.외부행ID)) issues.push(issue(rowNumber, "외부행ID", "BLOCKING", "중복 부과 행", "같은 기준월·세대·항목 또는 외부행ID가 중복되었습니다.", row));
      seen.add(key);
      if (row.외부행ID) seenExternalIds.add(row.외부행ID);
    } else {
      if (!/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(row.거래일 ?? "")) issues.push(issue(rowNumber, "거래일", "BLOCKING", "거래일 오류", "거래일은 YYYY-MM-DD 형식이어야 합니다.", row));
      if (!["수납", "환급"].includes(row.거래유형 ?? "")) issues.push(issue(rowNumber, "거래유형", "BLOCKING", "거래유형 오류", "거래유형은 수납 또는 환급이어야 합니다.", row));
      const key = row.외부거래번호 ?? "";
      if (!key) issues.push(issue(rowNumber, "외부거래번호", "BLOCKING", "거래 식별자 누락", "중복 방지를 위한 외부거래번호가 필요합니다.", row));
      else if (seen.has(key) || existingExternalIds.has(key)) issues.push(issue(rowNumber, "외부거래번호", "BLOCKING", "중복 거래", "외부거래번호가 중복되었습니다.", row));
      seen.add(key);
      const assessment = unitAssessments.get(`${row.동}|${row.호}`);
      if (assessment === undefined && validUnit(row.동 ?? "", row.호 ?? "")) issues.push(issue(rowNumber, "동·호", "WARNING", "대상 부과 미일치", "이 세대의 대상 기준월 부과 자료와 수납을 연결하지 못했습니다.", row));
      else if (amount !== null && assessment !== undefined && row.거래유형 === "수납" && amount > assessment) issues.push(issue(rowNumber, "금액", "WARNING", "과다 수납 확인", "남은 부과액보다 큰 수납입니다. 과납 또는 대상 기준월을 확인해 주세요.", row));
    }
  });
  if (declaredTotal !== null && declaredTotal !== calculatedTotal) issues.push(issue(1, "원본합계", "BLOCKING", "원본 합계 불일치", `원본 합계와 행별 계산 합계가 ${declaredTotal > calculatedTotal ? "크거나" : "작습니다"}.`, {}));
  const blockingErrorCount = issues.filter((item) => item.severity === "BLOCKING").length;
  const warningCount = issues.filter((item) => item.severity === "WARNING").length;
  const batch: FeeImportBatchView = {
    id: crypto.randomUUID(), tenantId: context.tenantId, periodId: input.periodId, referenceMonth: input.referenceMonth, type: input.type,
    filename: input.filename.slice(0, 180), fileHash, encoding, rowCount: data.length,
    validRowCount: data.filter((_, index) => !issues.some((item) => item.rowNumber === index + 2 && item.severity === "BLOCKING")).length,
    warningCount, blockingErrorCount, sourceTotal: declaredTotal ?? calculatedTotal, calculatedTotal,
    status: blockingErrorCount > 0 ? "REJECTED" : "VALIDATED", uploadedBy: "회계 담당자", uploadedAt: new Date().toISOString(), confirmedBy: null, confirmedAt: null, issues, records: data,
  };
  await storage.put({ key: `fee-imports/${context.tenantId}/${batch.id}.csv`, data: input.data, mimeType: "text/csv" });
  addFeeImportBatch(batch);
  return batch;
}
