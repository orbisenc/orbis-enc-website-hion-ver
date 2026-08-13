-- 관리비 현황·분석 모듈: 정수 원화 원장, 불변 가져오기·조정·마감 이력
ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'ACCOUNTING_MANAGER';

CREATE TYPE "ManagementFeePeriodState" AS ENUM ('DRAFT', 'IMPORTED', 'CONFIRMED', 'CLOSED', 'REOPENED');
CREATE TYPE "ManagementFeeCategoryType" AS ENUM ('COMMON', 'INDIVIDUAL', 'RESERVE', 'OTHER');
CREATE TYPE "FeeAllocationType" AS ENUM ('COMMON', 'INDIVIDUAL', 'UNIT_AREA', 'VOTING_RIGHT', 'NONE');
CREATE TYPE "ManagementFeeImportType" AS ENUM ('ASSESSMENT', 'COLLECTION');
CREATE TYPE "ManagementFeeImportStatus" AS ENUM ('UPLOADED', 'VALIDATED', 'CONFIRMED', 'REJECTED');
CREATE TYPE "ManagementFeeImportErrorSeverity" AS ENUM ('WARNING', 'BLOCKING');
CREATE TYPE "ManagementFeeTransactionType" AS ENUM ('PAYMENT', 'REFUND');
CREATE TYPE "ManagementFeeMatchingState" AS ENUM ('MATCHED', 'UNMATCHED', 'OVERPAID');
CREATE TYPE "ManagementFeeRecordState" AS ENUM ('ACTIVE', 'INVALIDATED');
CREATE TYPE "ManagementFeeAdjustmentState" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "ManagementFeeBudgetState" AS ENUM ('DRAFT', 'CONFIRMED', 'ARCHIVED');

CREATE TABLE "ManagementFeePeriod" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "complexId" TEXT NOT NULL,
  "referenceMonth" TEXT NOT NULL,
  "state" "ManagementFeePeriodState" NOT NULL DEFAULT 'DRAFT',
  "sourceAssessmentAmount" BIGINT NOT NULL DEFAULT 0,
  "sourceCollectionAmount" BIGINT NOT NULL DEFAULT 0,
  "calculatedAssessmentAmount" BIGINT NOT NULL DEFAULT 0,
  "calculatedCollectionAmount" BIGINT NOT NULL DEFAULT 0,
  "assessedUnitCount" INTEGER NOT NULL DEFAULT 0,
  "warningCount" INTEGER NOT NULL DEFAULT 0,
  "registeredBy" TEXT NOT NULL,
  "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmedBy" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "closedBy" TEXT,
  "closedAt" TIMESTAMP(3),
  "reopenedBy" TEXT,
  "reopenedAt" TIMESTAMP(3),
  "closingReasonKo" TEXT,
  "reopeningReasonKo" TEXT,
  "closingSnapshot" JSONB,
  "closingSnapshotHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ManagementFeePeriod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeeCategory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "nameKo" TEXT NOT NULL,
  "descriptionKo" TEXT,
  "type" "ManagementFeeCategoryType" NOT NULL,
  "allocationType" "FeeAllocationType" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL,
  "includeInDashboard" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ManagementFeeCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeeImportBatch" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "type" "ManagementFeeImportType" NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "fileHash" TEXT NOT NULL,
  "encoding" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "validRowCount" INTEGER NOT NULL DEFAULT 0,
  "warningCount" INTEGER NOT NULL DEFAULT 0,
  "blockingErrorCount" INTEGER NOT NULL DEFAULT 0,
  "sourceTotal" BIGINT NOT NULL DEFAULT 0,
  "calculatedTotal" BIGINT NOT NULL DEFAULT 0,
  "status" "ManagementFeeImportStatus" NOT NULL DEFAULT 'UPLOADED',
  "uploadedBy" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "confirmedBy" TEXT,
  "confirmedAt" TIMESTAMP(3),
  "warningConfirmationReasonKo" TEXT,
  CONSTRAINT "ManagementFeeImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeeAssessment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "originalAmount" BIGINT NOT NULL,
  "externalLineId" TEXT NOT NULL,
  "sourceRowHash" TEXT NOT NULL,
  "importBatchId" TEXT NOT NULL,
  "state" "ManagementFeeRecordState" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ManagementFeeAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeePayment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "transactionType" "ManagementFeeTransactionType" NOT NULL,
  "amount" BIGINT NOT NULL,
  "transactionDate" TIMESTAMP(3) NOT NULL,
  "externalReference" TEXT NOT NULL,
  "importBatchId" TEXT NOT NULL,
  "matchingState" "ManagementFeeMatchingState" NOT NULL DEFAULT 'MATCHED',
  "state" "ManagementFeeRecordState" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ManagementFeePayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeeAdjustment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "categoryId" TEXT,
  "amount" BIGINT NOT NULL,
  "reasonKo" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "state" "ManagementFeeAdjustmentState" NOT NULL DEFAULT 'PENDING',
  CONSTRAINT "ManagementFeeAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeeImportError" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "sourceRowNumber" INTEGER NOT NULL,
  "sourceColumn" TEXT,
  "severity" "ManagementFeeImportErrorSeverity" NOT NULL,
  "errorCodeKo" TEXT NOT NULL,
  "messageKo" TEXT NOT NULL,
  "maskedSourceSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ManagementFeeImportError_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManagementFeeBudget" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "fiscalYear" INTEGER NOT NULL,
  "version" INTEGER NOT NULL,
  "plannedAmount" BIGINT NOT NULL,
  "actualAmount" BIGINT,
  "state" "ManagementFeeBudgetState" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ManagementFeeBudget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgendaCostImpact" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agendaVersionId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "estimatedProjectCost" BIGINT NOT NULL,
  "actualProjectCost" BIGINT,
  "fundingSourceKo" TEXT NOT NULL,
  "usesLongTermRepairReserve" BOOLEAN NOT NULL,
  "requiresAdditionalFee" BOOLEAN NOT NULL,
  "allocationType" "FeeAllocationType" NOT NULL,
  "estimatedAmountPerUnit" BIGINT,
  "allocationRule" JSONB NOT NULL,
  "expectedBillingStartMonth" TEXT,
  "installmentCount" INTEGER NOT NULL DEFAULT 1,
  "residentExplanationKo" TEXT NOT NULL,
  "calculationSnapshot" JSONB NOT NULL,
  "versionHash" TEXT NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgendaCostImpact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManagementFeePeriod_tenantId_complexId_referenceMonth_key" ON "ManagementFeePeriod"("tenantId", "complexId", "referenceMonth");
CREATE INDEX "ManagementFeePeriod_tenantId_complexId_state_referenceMonth_idx" ON "ManagementFeePeriod"("tenantId", "complexId", "state", "referenceMonth");
CREATE UNIQUE INDEX "ManagementFeeCategory_tenantId_code_key" ON "ManagementFeeCategory"("tenantId", "code");
CREATE INDEX "ManagementFeeCategory_tenantId_active_displayOrder_idx" ON "ManagementFeeCategory"("tenantId", "active", "displayOrder");
CREATE UNIQUE INDEX "ManagementFeeImportBatch_tenantId_fileHash_key" ON "ManagementFeeImportBatch"("tenantId", "fileHash");
CREATE INDEX "ManagementFeeImportBatch_tenantId_periodId_type_status_idx" ON "ManagementFeeImportBatch"("tenantId", "periodId", "type", "status");
CREATE UNIQUE INDEX "ManagementFeeAssessment_periodId_externalLineId_key" ON "ManagementFeeAssessment"("periodId", "externalLineId");
CREATE INDEX "ManagementFeeAssessment_tenantId_periodId_unitId_categoryId_state_idx" ON "ManagementFeeAssessment"("tenantId", "periodId", "unitId", "categoryId", "state");
CREATE UNIQUE INDEX "ManagementFeePayment_tenantId_externalReference_key" ON "ManagementFeePayment"("tenantId", "externalReference");
CREATE INDEX "ManagementFeePayment_tenantId_periodId_unitId_transactionDate_state_idx" ON "ManagementFeePayment"("tenantId", "periodId", "unitId", "transactionDate", "state");
CREATE INDEX "ManagementFeeAdjustment_tenantId_periodId_unitId_state_idx" ON "ManagementFeeAdjustment"("tenantId", "periodId", "unitId", "state");
CREATE INDEX "ManagementFeeImportError_tenantId_batchId_severity_sourceRowNumber_idx" ON "ManagementFeeImportError"("tenantId", "batchId", "severity", "sourceRowNumber");
CREATE UNIQUE INDEX "ManagementFeeBudget_periodId_categoryId_version_key" ON "ManagementFeeBudget"("periodId", "categoryId", "version");
CREATE INDEX "ManagementFeeBudget_tenantId_fiscalYear_state_idx" ON "ManagementFeeBudget"("tenantId", "fiscalYear", "state");
CREATE UNIQUE INDEX "AgendaCostImpact_agendaVersionId_version_key" ON "AgendaCostImpact"("agendaVersionId", "version");
CREATE INDEX "AgendaCostImpact_tenantId_agendaVersionId_approved_idx" ON "AgendaCostImpact"("tenantId", "agendaVersionId", "approved");

ALTER TABLE "ManagementFeePeriod" ADD CONSTRAINT "ManagementFeePeriod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeePeriod" ADD CONSTRAINT "ManagementFeePeriod_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeCategory" ADD CONSTRAINT "ManagementFeeCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeImportBatch" ADD CONSTRAINT "ManagementFeeImportBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeImportBatch" ADD CONSTRAINT "ManagementFeeImportBatch_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ManagementFeePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAssessment" ADD CONSTRAINT "ManagementFeeAssessment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ManagementFeePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAssessment" ADD CONSTRAINT "ManagementFeeAssessment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAssessment" ADD CONSTRAINT "ManagementFeeAssessment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ManagementFeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAssessment" ADD CONSTRAINT "ManagementFeeAssessment_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ManagementFeeImportBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeePayment" ADD CONSTRAINT "ManagementFeePayment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ManagementFeePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeePayment" ADD CONSTRAINT "ManagementFeePayment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeePayment" ADD CONSTRAINT "ManagementFeePayment_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ManagementFeeImportBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAdjustment" ADD CONSTRAINT "ManagementFeeAdjustment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ManagementFeePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAdjustment" ADD CONSTRAINT "ManagementFeeAdjustment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeAdjustment" ADD CONSTRAINT "ManagementFeeAdjustment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ManagementFeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeImportError" ADD CONSTRAINT "ManagementFeeImportError_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ManagementFeeImportBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeBudget" ADD CONSTRAINT "ManagementFeeBudget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeBudget" ADD CONSTRAINT "ManagementFeeBudget_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ManagementFeePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManagementFeeBudget" ADD CONSTRAINT "ManagementFeeBudget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ManagementFeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgendaCostImpact" ADD CONSTRAINT "AgendaCostImpact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgendaCostImpact" ADD CONSTRAINT "AgendaCostImpact_agendaVersionId_fkey" FOREIGN KEY ("agendaVersionId") REFERENCES "AgendaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 확정·마감 관리비 원장의 삭제/수정은 애플리케이션 권한과 감사 서비스에서 차단한다.
