import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sha256 } from "../src/lib/security/hash";
import { DEMO_CONSENT } from "../src/lib/demo-content";
import { apartmentAssets } from "../src/data/mockDashboard";
import { facilityDemoUsers } from "../src/data/facilityDemoUsers";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const facilityStatus = { normal: "NORMAL", attention: "ATTENTION", urgent: "WARNING", inspection: "INSPECTION", offline: "STOPPED" } as const;
const facilityImportance = { "낮음": "LOW", "보통": "NORMAL", "높음": "HIGH", "핵심": "CRITICAL" } as const;

async function seedApartmentFacilities(input: { tenantId: string; complexId: string; buildings: Array<{ id: string; code: string }> }) {
  const passwordHash = await bcrypt.hash("demo1234", 12);
  for (const user of facilityDemoUsers) await prisma.facilityUser.upsert({
    where: { tenantId_email: { tenantId: input.tenantId, email: user.email } },
    update: { name: user.name, roleCode: user.role, active: true },
    create: { id: `facility-user-${user.id}`, tenantId: input.tenantId, complexId: input.complexId, email: user.email, name: user.name, roleCode: user.role, passwordHash },
  });
  const categorySeed = [
    ["ME", "기계·급배수"], ["EL", "전기·발전"], ["FI", "소방·안전"], ["PL", "배관·방수"], ["SE", "주차·보안"],
  ] as const;
  const categoryByCode = new Map<string, { id: string }>();
  for (const [code, nameKo] of categorySeed) {
    const category = await prisma.facilityAssetCategory.upsert({ where: { tenantId_code: { tenantId: input.tenantId, code } }, update: { nameKo, active: true }, create: { tenantId: input.tenantId, code, nameKo, active: true, displayOrder: categoryByCode.size + 1 } });
    categoryByCode.set(code, category);
  }
  const categoryCode = { mechanical: "ME", electrical: "EL", fire: "FI", plumbing: "PL", security: "SE" } as const;
  const typeByName = new Map<string, { id: string }>();
  for (const asset of apartmentAssets) {
    if (typeByName.has(asset.subtype)) continue;
    const code = `${categoryCode[asset.category]}-${String(typeByName.size + 1).padStart(3, "0")}`;
    const assetType = await prisma.facilityAssetType.upsert({ where: { tenantId_code: { tenantId: input.tenantId, code } }, update: { nameKo: asset.subtype, active: true }, create: { tenantId: input.tenantId, categoryId: categoryByCode.get(categoryCode[asset.category])!.id, code, nameKo: asset.subtype, defaultLifeYears: asset.replacementCycleYears, inspectionCycleDays: asset.importance === "핵심" ? 30 : asset.importance === "높음" ? 90 : 180 } });
    typeByName.set(asset.subtype, assetType);
  }
  const spaceByKey = new Map<string, { id: string }>();
  for (const asset of apartmentAssets) {
    const buildingCode = asset.buildingId.replace("building-", "");
    const building = input.buildings.find((item) => item.code === buildingCode) ?? input.buildings[0]!;
    const key = `${building.code}|${asset.floor}|${asset.room}`;
    if (spaceByKey.has(key)) continue;
    const space = await prisma.facilitySpace.upsert({ where: { tenantId_complexId_buildingId_floorCode_nameKo: { tenantId: input.tenantId, complexId: input.complexId, buildingId: building.id, floorCode: asset.floor, nameKo: asset.room } }, update: { useCode: "COMMON_FACILITY" }, create: { tenantId: input.tenantId, complexId: input.complexId, buildingId: building.id, floorCode: asset.floor, nameKo: asset.room, useCode: "COMMON_FACILITY", modelObjectId: `${building.code}_${asset.floor}` } });
    spaceByKey.set(key, space);
  }
  for (const asset of apartmentAssets) {
    const category = categoryByCode.get(categoryCode[asset.category])!;
    const buildingCode = asset.buildingId.replace("building-", "");
    const building = input.buildings.find((item) => item.code === buildingCode) ?? input.buildings[0]!;
    const space = spaceByKey.get(`${building.code}|${asset.floor}|${asset.room}`)!;
    await prisma.facilityAsset.upsert({
      where: { id: asset.id },
      update: { status: facilityStatus[asset.status], healthScore: asset.healthScore, riskScore: asset.riskScore, nextInspectionAt: new Date(asset.nextInspectionAt.replaceAll(".", "-") + "T09:00:00+09:00"), cumulativeMaintenanceWon: BigInt(asset.cumulativeMaintenanceCost) },
      create: { id: asset.id, tenantId: input.tenantId, complexId: input.complexId, categoryId: category.id, assetTypeId: typeByName.get(asset.subtype)!.id, spaceId: space.id, assetCode: asset.assetCode, nameKo: asset.name, buildingCode: building.code, floorCode: asset.floor, locationKo: asset.locationLabel, modelObjectId: asset.modelObjectName, manufacturer: asset.manufacturer, modelName: asset.modelName, serialNumber: asset.serialNumber, installedAt: new Date(asset.installedAt.replaceAll(".", "-") + "T09:00:00+09:00"), warrantyEndAt: new Date(asset.warrantyEndAt.replaceAll(".", "-") + "T09:00:00+09:00"), expectedLifeYears: asset.replacementCycleYears, inspectionCycleDays: asset.importance === "핵심" ? 30 : asset.importance === "높음" ? 90 : 180, recommendedReplaceAt: new Date(asset.expectedReplacementAt.replaceAll(".", "-") + "T09:00:00+09:00"), importance: facilityImportance[asset.importance], status: facilityStatus[asset.status], healthScore: asset.healthScore, riskScore: asset.riskScore, lastInspectedAt: new Date(asset.lastInspectedAt.replaceAll(".", "-") + "T09:00:00+09:00"), nextInspectionAt: new Date(asset.nextInspectionAt.replaceAll(".", "-") + "T09:00:00+09:00"), cumulativeMaintenanceWon: BigInt(asset.cumulativeMaintenanceCost), plannedReplacementWon: BigInt(asset.plannedReplacementCost), createdBy: "facility-user-manager", updatedBy: "facility-user-manager" },
    });
    await prisma.facilityAssetEvent.upsert({ where: { id: `facility-event-install-${asset.assetCode}` }, update: {}, create: { id: `facility-event-install-${asset.assetCode}`, tenantId: input.tenantId, assetId: asset.id, eventCode: "INSTALLED", titleKo: "자산 설치·ID 발급", descriptionKo: `${asset.manufacturer} ${asset.modelName} 설치와 고유 자산 ID 발급`, sourceType: "SEED", occurredAt: new Date(asset.installedAt.replaceAll(".", "-") + "T09:00:00+09:00"), actorId: "facility-user-manager" } });
    if (asset.riskScore >= 58) await prisma.facilityReplacementCandidate.upsert({ where: { assetId: asset.id }, update: { totalRiskScore: asset.riskScore }, create: { tenantId: input.tenantId, complexId: input.complexId, assetId: asset.id, conditionScore: Math.round((100 - asset.healthScore) * .25), repeatedFailureScore: Math.min(20, asset.repeatedFailureCount * 5), criticalityScore: asset.importance === "핵심" ? 20 : asset.importance === "높음" ? 15 : 9, maintenanceCostScore: 8, residentImpactScore: asset.residentImpact, overdueScore: 0, totalRiskScore: asset.riskScore, scenarioSnapshot: { 유지: asset.plannedReplacementCost * .04, 부분보수: asset.plannedReplacementCost * .32, 전면교체: asset.plannedReplacementCost }, recommendationCode: asset.riskScore >= 70 ? "REPLACE" : "REPAIR", statusCode: "REVIEW" } });
  }
}

const managementFeeCategorySeed = [
  ["GENERAL", "일반관리비", "COMMON", "COMMON", "관리사무소 운영과 일반 행정 비용"],
  ["CLEANING", "청소비", "COMMON", "COMMON", "공용부 청소 비용"],
  ["SECURITY", "경비비", "COMMON", "COMMON", "단지 경비 운영 비용"],
  ["ELEVATOR", "승강기 유지비", "COMMON", "COMMON", "승강기 점검과 유지 비용"],
  ["COMMON_ELECTRIC", "공동전기료", "COMMON", "COMMON", "공용부 전기 사용 비용"],
  ["COMMON_WATER", "공동수도료", "COMMON", "COMMON", "공용부 수도 사용 비용"],
  ["HEATING", "난방비", "INDIVIDUAL", "INDIVIDUAL", "세대별 난방 사용 비용"],
  ["HOT_WATER", "급탕비", "INDIVIDUAL", "INDIVIDUAL", "세대별 급탕 사용 비용"],
  ["LONG_TERM_RESERVE", "장기수선충당금", "RESERVE", "UNIT_AREA", "공동주택 장기수선 계획 적립금"],
  ["INSURANCE", "보험료", "COMMON", "COMMON", "공동주택 보험 비용"],
  ["MAINTENANCE", "시설 유지보수비", "COMMON", "COMMON", "공용시설 점검과 보수 비용"],
  ["OTHER", "기타 관리비", "OTHER", "COMMON", "분류되지 않은 기타 비용"],
] as const;

function feeMonth(offset: number) {
  const date = new Date(Date.UTC(2026, 6 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function feeAmounts(month: string, unitIndex: number) {
  const monthNumber = Number(month.slice(5));
  const winter = [11, 12, 1, 2, 3].includes(monthNumber);
  const summer = [6, 7, 8].includes(monthNumber);
  return [42_000, 10_000, 24_000, 9_000, summer ? 22_000 : 15_000, 6_000, winter ? 38_000 : 9_000, winter ? 16_000 : 10_000, 25_000, 3_000, 18_000, 4_000 + unitIndex % 9 * 300];
}

async function createManyInChunks<T>(rows: T[], task: (chunk: T[]) => Promise<unknown>) {
  for (let index = 0; index < rows.length; index += 5_000) await task(rows.slice(index, index + 5_000));
}

async function seedManagementFees(input: { tenantId: string; complexId: string; adminId: string; units: Array<{ id: string; code: string; building: { code: string } }>; agendaVersionId: string }) {
  const categories: Array<{ id: string; code: string }> = [];
  for (const [code, nameKo, type, allocationType, descriptionKo] of managementFeeCategorySeed) {
    categories.push(await prisma.managementFeeCategory.upsert({
      where: { tenantId_code: { tenantId: input.tenantId, code } },
      update: { nameKo, type, allocationType, descriptionKo, active: true },
      create: { tenantId: input.tenantId, code, nameKo, type, allocationType, descriptionKo, displayOrder: categories.length + 1 },
    }));
  }

  for (let offset = -11; offset <= 0; offset += 1) {
    const referenceMonth = feeMonth(offset);
    const periodId = `fee-period-${referenceMonth}`;
    const assessmentFileHash = sha256(`HION 시연 관리비 부과 ${referenceMonth}`);
    const collectionFileHash = sha256(`HION 시연 관리비 수납 ${referenceMonth}`);
    const assessmentRows: Array<Omit<Prisma.ManagementFeeAssessmentCreateManyInput, "importBatchId">> = [];
    const unitFinalAmounts = new Map<string, bigint>();
    let originalTotal = 0n;
    input.units.forEach((unit, unitIndex) => {
      const exempt = unitIndex % 211 === 0;
      feeAmounts(referenceMonth, unitIndex).forEach((value, categoryIndex) => {
        const amount = exempt ? 0n : BigInt(value);
        originalTotal += amount;
        unitFinalAmounts.set(unit.id, (unitFinalAmounts.get(unit.id) ?? 0n) + amount);
        assessmentRows.push({ id: `fee-assessment-${referenceMonth}-${unit.id}-${categories[categoryIndex]!.code}`, tenantId: input.tenantId, periodId, unitId: unit.id, categoryId: categories[categoryIndex]!.id, originalAmount: amount, externalLineId: `${referenceMonth}-${unit.building.code}-${unit.code}-${categories[categoryIndex]!.code}`, sourceRowHash: sha256(`${referenceMonth}|${unit.building.code}|${unit.code}|${categories[categoryIndex]!.code}|${amount}`), state: "ACTIVE" });
      });
    });
    const paymentDrafts: Array<Omit<Prisma.ManagementFeePaymentCreateManyInput, "importBatchId">> = [];
    let collectionTotal = 0n;
    let refundTotal = 0n;
    input.units.forEach((unit, unitIndex) => {
      const finalAmount = unitFinalAmounts.get(unit.id) ?? 0n;
      let paid = finalAmount;
      if (unitIndex % 89 === 0) paid = 0n;
      else if (unitIndex % 47 === 0) paid = finalAmount / 3n;
      else if (unitIndex % 23 === 0) paid = finalAmount * 2n / 3n;
      else if (unitIndex % 137 === 0) paid = finalAmount + 12_000n;
      if (paid > 0n) {
        collectionTotal += paid;
        paymentDrafts.push({ id: `fee-payment-${referenceMonth}-${unit.id}`, tenantId: input.tenantId, periodId, unitId: unit.id, transactionType: "PAYMENT", amount: paid, transactionDate: new Date(`${referenceMonth}-${String(8 + unitIndex % 12).padStart(2, "0")}T09:00:00+09:00`), externalReference: `PAY-${referenceMonth}-${unit.building.code}-${unit.code}`, matchingState: paid > finalAmount ? "OVERPAID" : "MATCHED", state: "ACTIVE" });
      }
      if (unitIndex % 401 === 0 && paid > 10_000n) {
        refundTotal += 10_000n;
        paymentDrafts.push({ id: `fee-refund-${referenceMonth}-${unit.id}`, tenantId: input.tenantId, periodId, unitId: unit.id, transactionType: "REFUND", amount: 10_000n, transactionDate: new Date(`${referenceMonth}-25T09:00:00+09:00`), externalReference: `REFUND-${referenceMonth}-${unit.building.code}-${unit.code}`, matchingState: "MATCHED", state: "ACTIVE" });
      }
    });
    const warningCount = referenceMonth === "2026-04" ? 1 : 0;
    const isCurrent = referenceMonth === "2026-07";
    const netCollected = collectionTotal - refundTotal;
    const snapshot = { referenceMonth, originalTotal: originalTotal.toString(), netCollected: netCollected.toString() };
    await prisma.managementFeePeriod.upsert({
      where: { tenantId_complexId_referenceMonth: { tenantId: input.tenantId, complexId: input.complexId, referenceMonth } },
      update: { sourceAssessmentAmount: originalTotal, sourceCollectionAmount: collectionTotal, calculatedAssessmentAmount: originalTotal, calculatedCollectionAmount: netCollected, warningCount },
      create: { id: periodId, tenantId: input.tenantId, complexId: input.complexId, referenceMonth, state: isCurrent ? "IMPORTED" : "CLOSED", sourceAssessmentAmount: originalTotal, sourceCollectionAmount: collectionTotal, calculatedAssessmentAmount: originalTotal, calculatedCollectionAmount: netCollected, assessedUnitCount: input.units.length, warningCount, registeredBy: input.adminId, registeredAt: new Date(`${referenceMonth}-03T09:10:00+09:00`), confirmedBy: isCurrent ? null : input.adminId, confirmedAt: isCurrent ? null : new Date(`${referenceMonth}-05T10:00:00+09:00`), closedBy: isCurrent ? null : input.adminId, closedAt: isCurrent ? null : new Date(`${referenceMonth}-28T10:30:00+09:00`), closingReasonKo: isCurrent ? null : "부과·수납 대사와 조정 내역 확인 완료", closingSnapshot: isCurrent ? Prisma.JsonNull : snapshot, closingSnapshotHash: isCurrent ? null : sha256(snapshot) },
    });
    const assessmentBatch = await prisma.managementFeeImportBatch.upsert({
      where: { tenantId_fileHash: { tenantId: input.tenantId, fileHash: assessmentFileHash } }, update: {},
      create: { id: `fee-import-assessment-${referenceMonth}`, tenantId: input.tenantId, periodId, type: "ASSESSMENT", originalFilename: `${referenceMonth}-관리비-부과.csv`, fileHash: assessmentFileHash, encoding: "UTF-8", rowCount: assessmentRows.length, validRowCount: assessmentRows.length, warningCount, blockingErrorCount: 0, sourceTotal: originalTotal, calculatedTotal: originalTotal, status: "CONFIRMED", uploadedBy: input.adminId, uploadedAt: new Date(`${referenceMonth}-03T09:00:00+09:00`), confirmedBy: input.adminId, confirmedAt: new Date(`${referenceMonth}-03T09:10:00+09:00`), warningConfirmationReasonKo: warningCount ? "원본 시스템의 반올림 표시 차이를 행별 원화 합계로 확인함" : null },
    });
    const collectionBatch = await prisma.managementFeeImportBatch.upsert({
      where: { tenantId_fileHash: { tenantId: input.tenantId, fileHash: collectionFileHash } }, update: {},
      create: { id: `fee-import-collection-${referenceMonth}`, tenantId: input.tenantId, periodId, type: "COLLECTION", originalFilename: `${referenceMonth}-관리비-수납.csv`, fileHash: collectionFileHash, encoding: "UTF-8", rowCount: paymentDrafts.length, validRowCount: paymentDrafts.length, sourceTotal: collectionTotal, calculatedTotal: collectionTotal, status: "CONFIRMED", uploadedBy: input.adminId, uploadedAt: new Date(`${referenceMonth}-24T09:00:00+09:00`), confirmedBy: input.adminId, confirmedAt: new Date(`${referenceMonth}-24T09:10:00+09:00`) },
    });
    if (await prisma.managementFeeAssessment.count({ where: { tenantId: input.tenantId, periodId } }) === 0) await createManyInChunks(assessmentRows, (chunk) => prisma.managementFeeAssessment.createMany({ data: chunk.map((row) => ({ ...row, importBatchId: assessmentBatch.id })), skipDuplicates: true }));
    if (await prisma.managementFeePayment.count({ where: { tenantId: input.tenantId, periodId } }) === 0) await createManyInChunks(paymentDrafts, (chunk) => prisma.managementFeePayment.createMany({ data: chunk.map((row) => ({ ...row, importBatchId: collectionBatch.id })), skipDuplicates: true }));
    if (warningCount) await prisma.managementFeeImportError.upsert({ where: { id: `fee-warning-${referenceMonth}` }, update: {}, create: { id: `fee-warning-${referenceMonth}`, tenantId: input.tenantId, batchId: assessmentBatch.id, sourceRowNumber: 1, sourceColumn: "원본합계", severity: "WARNING", errorCodeKo: "원본 표시 합계 확인", messageKo: "원본 화면의 천원 단위 표시와 원 단위 행 합계를 대조했습니다.", maskedSourceSummary: "세대별 금액과 개인 식별 정보 비공개" } });
    for (let index = 0; index < categories.length; index += 1) await prisma.managementFeeBudget.upsert({ where: { id: `fee-budget-${referenceMonth}-${categories[index]!.code}` }, update: {}, create: { id: `fee-budget-${referenceMonth}-${categories[index]!.code}`, tenantId: input.tenantId, periodId, categoryId: categories[index]!.id, fiscalYear: Number(referenceMonth.slice(0, 4)), version: 1, plannedAmount: originalTotal / BigInt(categories.length), actualAmount: assessmentRows.filter((row) => row.categoryId === categories[index]!.id).reduce((sum, row) => sum + BigInt(row.originalAmount), 0n), state: "CONFIRMED" } });
    const adjustmentUnit = input.units[(Math.abs(offset) * 113 + 37) % input.units.length]!;
    await prisma.managementFeeAdjustment.upsert({ where: { id: `fee-adjustment-${referenceMonth}` }, update: {}, create: { id: `fee-adjustment-${referenceMonth}`, tenantId: input.tenantId, periodId, unitId: adjustmentUnit.id, categoryId: categories[4]!.id, amount: -5_000n, reasonKo: "공동전기 계량기 검침값 정정", createdBy: input.adminId, approvedBy: input.adminId, approvedAt: new Date(`${referenceMonth}-06T10:00:00+09:00`), state: "APPROVED" } });
  }
  const impactSnapshot = { estimatedProjectCost: "48000000", additionalFeeTotal: "18000000", eligibleUnitCount: 2000, allocationType: "EQUAL", estimatedAmountPerUnit: "9000" };
  await prisma.agendaCostImpact.upsert({ where: { agendaVersionId_version: { agendaVersionId: input.agendaVersionId, version: 1 } }, update: {}, create: { id: "demo-agenda-cost-impact", tenantId: input.tenantId, agendaVersionId: input.agendaVersionId, version: 1, estimatedProjectCost: 48_000_000n, fundingSourceKo: "장기수선충당금 3,000만원과 관리비 추가 부과 1,800만원", usesLongTermRepairReserve: true, requiresAdditionalFee: true, allocationType: "COMMON", estimatedAmountPerUnit: 9_000n, allocationRule: { type: "대상 세대 균등 배분", eligibleUnitCount: 2000, additionalFeeTotal: "18000000" }, expectedBillingStartMonth: "2026-09", installmentCount: 2, residentExplanationKo: "총사업비는 약 4,800만원이며 장기수선충당금 3,000만원을 사용하고 나머지는 세대당 총 9,000원으로 예상합니다.", calculationSnapshot: impactSnapshot, versionHash: sha256(impactSnapshot), approved: true, approvedBy: input.adminId, approvedAt: new Date("2026-07-15T10:30:00+09:00") } });
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { code: "HION-DEMO" },
    update: { name: "HION 시연 운영사", status: "ACTIVE" },
    create: { name: "HION 시연 운영사", code: "HION-DEMO", branding: { primary: "#0B2A55", accent: "#19BCE4" } },
  });
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@hion.local" },
    update: { name: "HION 데모 관리자", passwordHash: await bcrypt.hash("Hion!2026dev", 12) },
    create: { email: "admin@hion.local", name: "HION 데모 관리자", passwordHash: await bcrypt.hash("Hion!2026dev", 12), mfaSecretHash: sha256("000000") },
  });
  await prisma.tenantMembership.upsert({
    where: { tenantId_adminId_role: { tenantId: tenant.id, adminId: admin.id, role: "COMPLEX_ADMIN" } },
    update: {}, create: { tenantId: tenant.id, adminId: admin.id, role: "COMPLEX_ADMIN" },
  });
  for (const role of ["ACCOUNTING_MANAGER", "APPROVER", "CONTENT_EDITOR"] as const) await prisma.tenantMembership.upsert({ where: { tenantId_adminId_role: { tenantId: tenant.id, adminId: admin.id, role } }, update: {}, create: { tenantId: tenant.id, adminId: admin.id, role } });
  const complex = await prisma.complex.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "해오름 아파트" } },
    update: {}, create: { tenantId: tenant.id, name: "해오름 아파트", address: "서울특별시 테스트구 HION로 1 (개발용 가상 주소)", contactName: "관리사무소 시설팀", contactPhone: "02-000-0000" },
  });
  for (let code = 101; code <= 105; code += 1) {
    await prisma.building.upsert({ where: { complexId_code: { complexId: complex.id, code: String(code) } }, update: {}, create: { tenantId: tenant.id, complexId: complex.id, code: String(code), displayName: `${code}동` } });
  }
  const buildings = await prisma.building.findMany({ where: { tenantId: tenant.id, complexId: complex.id }, orderBy: { code: "asc" } });
  const unitRows = buildings.flatMap((building) => Array.from({ length: 40 }, (_, floor) => Array.from({ length: 10 }, (_, line) => {
    const code = `${floor + 1}${String(line + 1).padStart(2, "0")}`;
    return { tenantId: tenant.id, buildingId: building.id, code, displayName: `${code}호` };
  })).flat());
  await prisma.unit.createMany({ data: unitRows, skipDuplicates: true });
  const units = await prisma.unit.findMany({ where: { tenantId: tenant.id }, include: { building: true }, orderBy: [{ buildingId: "asc" }, { code: "asc" }] });
  const peopleRows = units.map((unit, index) => {
    const sequence = index + 1;
    const contact = unit.building.code === "101" && unit.code === "1203" ? "010-0000-1203" : `테스트전용-010-${String(Math.floor(index / 10000)).padStart(4, "0")}-${String(sequence).padStart(4, "0").slice(-4)}`;
    return { tenantId: tenant.id, name: `가상입주민${String(sequence).padStart(4, "0")}`, encryptedContact: `DEV_ONLY:${contact}`, searchHash: sha256(`${tenant.id}:${contact}`) };
  });
  await prisma.person.createMany({ data: peopleRows, skipDuplicates: true });
  const people = await prisma.person.findMany({ where: { tenantId: tenant.id }, orderBy: { name: "asc" } });
  const roster = await prisma.rosterVersion.upsert({
    where: { complexId_version: { complexId: complex.id, version: 1 } }, update: { state: "CONFIRMED" },
    create: { tenantId: tenant.id, complexId: complex.id, version: 1, sourceFileHash: sha256(peopleRows), state: "CONFIRMED", effectiveDate: new Date(), confirmedBy: admin.id, confirmedAt: new Date() },
  });
  const existingEligibility = await prisma.eligibility.count({ where: { tenantId: tenant.id, rosterId: roster.id } });
  if (existingEligibility === 0) await prisma.eligibility.createMany({ data: units.map((unit, index) => ({ tenantId: tenant.id, rosterId: roster.id, personId: people[index]!.id, unitId: unit.id, rightType: "OWNER", rightCount: 1, validFrom: new Date("2026-01-01T00:00:00+09:00") })) });
  const agenda = await prisma.agenda.upsert({
    where: { id: "demo-agenda" }, update: {}, create: { id: "demo-agenda", tenantId: tenant.id, titleKo: "지하주차장 방화문 출입을 위한 주차 라인 위치 변경 안건", type: "시설 개선", state: "PUBLISHED", ownerId: admin.id },
  });
  const manifest = { scene: "parking-procedural-v1", videoSummary: "주차선 변경 안내", fallback: "parking-comparison-v1" };
  const agendaVersion = await prisma.agendaVersion.upsert({
    where: { agendaId_version: { agendaId: agenda.id, version: 1 } }, update: {}, create: {
      tenantId: tenant.id, agendaId: agenda.id, version: 1, summaryKo: "방화문 앞 통행 공간을 확보하고 차량과 보행자의 접근성을 개선합니다.",
      backgroundKo: "현재 주차선이 방화문 통행 범위와 가까워 긴급 상황 이동과 일상 점검에 불편이 있습니다.", changeScopeKo: "지하 1층 101동 출입구 인근 주차면 4곳의 선을 조정합니다.", benefitKo: "방화문 앞 통행 폭을 확보합니다.", scheduleKo: "응답 종료 후 검토하여 안내합니다.", cautionsKo: "공사 중 일시 통제될 수 있습니다.", contactKo: "관리사무소 시설팀 · 02-000-0000", consentTextKo: DEMO_CONSENT, options: ["동의", "반대", "기권"], contentManifest: manifest, contentHash: sha256(manifest), approvalState: "PUBLISHED", publishedAt: new Date(),
    },
  });
  await seedManagementFees({ tenantId: tenant.id, complexId: complex.id, adminId: admin.id, units, agendaVersionId: agendaVersion.id });
  const campaign = await prisma.campaign.upsert({
    where: { id: "demo-campaign" }, update: {}, create: { id: "demo-campaign", tenantId: tenant.id, nameKo: "2026년 주차 환경 개선", agendaVersionId: agendaVersion.id, rosterVersionId: roster.id, startsAt: new Date(Date.now() - 86_400_000), endsAt: new Date(Date.now() + 7 * 86_400_000), mode: "MANAGEMENT_VOTE", verificationLevel: "IDENTITY_MATCH", anonymous: false, allowResponseChange: false, allowWithdrawal: false, quorumRule: { participationRatio: 0.5 }, resultDisclosure: "종료 후 집계 공개", status: "OPEN", publishedAt: new Date() },
  });
  const eligibilities = await prisma.eligibility.findMany({ where: { tenantId: tenant.id, rosterId: roster.id }, include: { unit: { include: { building: true } } } });
  await prisma.campaignTarget.createMany({ data: eligibilities.map((eligibility) => ({ tenantId: tenant.id, campaignId: campaign.id, eligibilityId: eligibility.id, status: eligibility.unit.building.code === "101" && eligibility.unit.code === "1203" ? "INVITED" : "IMPORTED" })), skipDuplicates: true });
  const demoTarget = await prisma.campaignTarget.findFirstOrThrow({ where: { tenantId: tenant.id, campaignId: campaign.id, eligibility: { unit: { code: "1203", building: { code: "101" } } } } });
  await prisma.invitation.upsert({ where: { tokenHash: sha256("demo-parking-change-1203") }, update: {}, create: { tenantId: tenant.id, campaignId: campaign.id, targetId: demoTarget.id, tokenHash: sha256("demo-parking-change-1203"), channel: "SMS", state: "DELIVERED", expiresAt: campaign.endsAt, sentAt: new Date(), deliveredAt: new Date() } });
  const apartmentComplex = await prisma.complex.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "HION 스마트파크" } },
    update: { address: "전라남도 순천시 미래로 21", contactName: "HION 스마트파크 관리사무소", contactPhone: "061-000-2100" },
    create: { tenantId: tenant.id, name: "HION 스마트파크", address: "전라남도 순천시 미래로 21", contactName: "HION 스마트파크 관리사무소", contactPhone: "061-000-2100" },
  });
  for (let code = 101; code <= 108; code += 1) await prisma.building.upsert({ where: { complexId_code: { complexId: apartmentComplex.id, code: String(code) } }, update: { displayName: `${code}동` }, create: { tenantId: tenant.id, complexId: apartmentComplex.id, code: String(code), displayName: `${code}동` } });
  const apartmentBuildings = await prisma.building.findMany({ where: { tenantId: tenant.id, complexId: apartmentComplex.id }, orderBy: { code: "asc" } });
  const apartmentUnits = apartmentBuildings.flatMap((building) => Array.from({ length: 18 }, (_, floor) => Array.from({ length: 6 }, (_, line) => { const code = `${floor + 1}${String(line + 1).padStart(2, "0")}`; return { tenantId: tenant.id, buildingId: building.id, code, displayName: `${code}호` }; })).flat());
  await prisma.unit.createMany({ data: apartmentUnits, skipDuplicates: true });
  await seedApartmentFacilities({ tenantId: tenant.id, complexId: apartmentComplex.id, buildings: apartmentBuildings });
  console.info("HION 시연 시드 완료: 주민동의 5개 동·2,000세대와 Apartment OS 8개 동·864세대·48개 공용시설 자산");
}

main().catch((error) => { console.error("시드 생성 실패", error instanceof Error ? error.message : "알 수 없는 오류"); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
