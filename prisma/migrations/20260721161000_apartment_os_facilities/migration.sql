-- CreateEnum
CREATE TYPE "FacilityAssetStatus" AS ENUM ('NORMAL', 'ATTENTION', 'WARNING', 'INSPECTION', 'STOPPED', 'RETIRED');

-- CreateEnum
CREATE TYPE "FacilityImportance" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FacilityInspectionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REINSPECTION', 'OVERDUE');

-- CreateEnum
CREATE TYPE "FacilityWorkOrderStatus" AS ENUM ('RECEIVED', 'TRIAGED', 'PENDING_APPROVAL', 'ASSIGNED', 'IN_PROGRESS', 'INSPECTION_REQUESTED', 'COMPLETED', 'CLOSED', 'ON_HOLD', 'CANCELED');

-- CreateEnum
CREATE TYPE "FacilityProjectStatus" AS ENUM ('DRAFT', 'BIDDING', 'CONTRACTED', 'IN_PROGRESS', 'INSPECTION', 'COMPLETED', 'ON_HOLD', 'CANCELED');

-- CreateEnum
CREATE TYPE "FacilityVisibility" AS ENUM ('INTERNAL', 'COMMITTEE', 'RESIDENT', 'PUBLIC');

-- CreateEnum
CREATE TYPE "FacilityDecisionStatus" AS ENUM ('REVIEW', 'RESOLVED', 'ON_HOLD', 'REJECTED');

-- CreateTable
CREATE TABLE "FacilityUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilitySpace" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "floorCode" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "useCode" TEXT NOT NULL,
    "areaSquareM" DECIMAL(12,2),
    "modelObjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "FacilitySpace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAssetCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "descriptionKo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityAssetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAssetType" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "defaultLifeYears" INTEGER NOT NULL,
    "inspectionCycleDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityAssetType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAsset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assetTypeId" TEXT NOT NULL,
    "spaceId" TEXT,
    "assetCode" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "buildingCode" TEXT NOT NULL,
    "floorCode" TEXT NOT NULL,
    "locationKo" TEXT NOT NULL,
    "modelObjectId" TEXT,
    "manufacturer" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "externalSystemKey" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL,
    "warrantyEndAt" TIMESTAMP(3),
    "expectedLifeYears" INTEGER NOT NULL,
    "inspectionCycleDays" INTEGER NOT NULL,
    "recommendedReplaceAt" TIMESTAMP(3) NOT NULL,
    "importance" "FacilityImportance" NOT NULL,
    "status" "FacilityAssetStatus" NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "lastInspectedAt" TIMESTAMP(3),
    "nextInspectionAt" TIMESTAMP(3) NOT NULL,
    "lastMaintainedAt" TIMESTAMP(3),
    "cumulativeMaintenanceWon" BIGINT NOT NULL DEFAULT 0,
    "plannedReplacementWon" BIGINT NOT NULL DEFAULT 0,
    "replacedAssetId" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "FacilityAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAssetRelation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromAssetId" TEXT NOT NULL,
    "toAssetId" TEXT NOT NULL,
    "relationCode" TEXT NOT NULL,
    "descriptionKo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityAssetRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAssetEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "eventCode" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "actorId" TEXT NOT NULL,
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityAssetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityInspectionTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "status" "FacilityInspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "checklist" JSONB NOT NULL,
    "sourceTaskId" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityInspectionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityInspectionResult" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "resultCode" TEXT NOT NULL,
    "measurements" JSONB NOT NULL,
    "notesKo" TEXT,
    "evidence" JSONB NOT NULL,
    "confirmerName" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReasonKo" TEXT,
    "previousResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityInspectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityIncident" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "inspectionResultId" TEXT,
    "titleKo" TEXT NOT NULL,
    "severityCode" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityWorkOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "incidentId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "severityCode" TEXT NOT NULL,
    "urgencyCode" TEXT NOT NULL,
    "impactKo" TEXT NOT NULL,
    "safetyRiskKo" TEXT NOT NULL,
    "assigneeId" TEXT,
    "vendorId" TEXT,
    "targetAt" TIMESTAMP(3) NOT NULL,
    "slaMinutes" INTEGER NOT NULL,
    "estimatedCostWon" BIGINT NOT NULL DEFAULT 0,
    "actualCostWon" BIGINT NOT NULL DEFAULT 0,
    "completionSummaryKo" TEXT,
    "evidence" JSONB NOT NULL,
    "status" "FacilityWorkOrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "completedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityWorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityWorkLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "notesKo" TEXT NOT NULL,
    "laborMinutes" INTEGER NOT NULL DEFAULT 0,
    "parts" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "costWon" BIGINT NOT NULL DEFAULT 0,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityWorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityReplacementCandidate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "conditionScore" INTEGER NOT NULL,
    "repeatedFailureScore" INTEGER NOT NULL,
    "criticalityScore" INTEGER NOT NULL,
    "maintenanceCostScore" INTEGER NOT NULL,
    "residentImpactScore" INTEGER NOT NULL,
    "overdueScore" INTEGER NOT NULL,
    "totalRiskScore" INTEGER NOT NULL,
    "scenarioSnapshot" JSONB NOT NULL,
    "recommendationCode" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityReplacementCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityLongTermPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "fiscalStartYear" INTEGER NOT NULL,
    "fiscalEndYear" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "statusCode" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityLongTermPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityLongTermPlanItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "plannedYear" INTEGER NOT NULL,
    "plannedCostWon" BIGINT NOT NULL,
    "fundingSourceKo" TEXT NOT NULL,
    "rationaleKo" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityLongTermPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityProject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "purposeKo" TEXT NOT NULL,
    "scopeKo" TEXT NOT NULL,
    "relatedAssetIds" JSONB NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "approvedBudgetWon" BIGINT NOT NULL,
    "contractedWon" BIGINT NOT NULL DEFAULT 0,
    "executedWon" BIGINT NOT NULL DEFAULT 0,
    "vendorId" TEXT,
    "status" "FacilityProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "contractSnapshot" JSONB,
    "completionEvidence" JSONB,
    "warrantyEndsAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityComplaint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "residentKeyHash" TEXT NOT NULL,
    "assetId" TEXT,
    "workOrderId" TEXT,
    "categoryCode" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "buildingCode" TEXT NOT NULL,
    "locationKo" TEXT NOT NULL,
    "attachment" JSONB,
    "internalNotesKo" TEXT,
    "publicProgressKo" TEXT NOT NULL,
    "finalResponseKo" TEXT,
    "statusCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "assetId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "typeCode" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "sha256" TEXT NOT NULL,
    "visibility" "FacilityVisibility" NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FacilityDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAIInsight" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "severityCode" TEXT NOT NULL,
    "confidenceCode" TEXT NOT NULL,
    "affectedAssetIds" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "expectedImpactKo" TEXT NOT NULL,
    "recommendedActionKo" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacilityAIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAIFeedback" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "insightId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL,
    "commentKo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityAIFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacilityAuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRoleCode" TEXT NOT NULL,
    "actionCode" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "reasonKo" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilityUser_tenantId_complexId_roleCode_active_idx" ON "FacilityUser"("tenantId", "complexId", "roleCode", "active");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityUser_tenantId_email_key" ON "FacilityUser"("tenantId", "email");

-- CreateIndex
CREATE INDEX "FacilitySpace_tenantId_complexId_buildingId_floorCode_idx" ON "FacilitySpace"("tenantId", "complexId", "buildingId", "floorCode");

-- CreateIndex
CREATE UNIQUE INDEX "FacilitySpace_tenantId_complexId_buildingId_floorCode_nameK_key" ON "FacilitySpace"("tenantId", "complexId", "buildingId", "floorCode", "nameKo");

-- CreateIndex
CREATE INDEX "FacilityAssetCategory_tenantId_active_displayOrder_idx" ON "FacilityAssetCategory"("tenantId", "active", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAssetCategory_tenantId_code_key" ON "FacilityAssetCategory"("tenantId", "code");

-- CreateIndex
CREATE INDEX "FacilityAssetType_tenantId_categoryId_active_idx" ON "FacilityAssetType"("tenantId", "categoryId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAssetType_tenantId_code_key" ON "FacilityAssetType"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAsset_replacedAssetId_key" ON "FacilityAsset"("replacedAssetId");

-- CreateIndex
CREATE INDEX "FacilityAsset_tenantId_complexId_categoryId_status_idx" ON "FacilityAsset"("tenantId", "complexId", "categoryId", "status");

-- CreateIndex
CREATE INDEX "FacilityAsset_tenantId_complexId_nextInspectionAt_idx" ON "FacilityAsset"("tenantId", "complexId", "nextInspectionAt");

-- CreateIndex
CREATE INDEX "FacilityAsset_tenantId_complexId_riskScore_idx" ON "FacilityAsset"("tenantId", "complexId", "riskScore");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAsset_tenantId_complexId_assetCode_key" ON "FacilityAsset"("tenantId", "complexId", "assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAsset_tenantId_serialNumber_key" ON "FacilityAsset"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "FacilityAssetRelation_tenantId_fromAssetId_idx" ON "FacilityAssetRelation"("tenantId", "fromAssetId");

-- CreateIndex
CREATE INDEX "FacilityAssetRelation_tenantId_toAssetId_idx" ON "FacilityAssetRelation"("tenantId", "toAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityAssetRelation_tenantId_fromAssetId_toAssetId_relati_key" ON "FacilityAssetRelation"("tenantId", "fromAssetId", "toAssetId", "relationCode");

-- CreateIndex
CREATE INDEX "FacilityAssetEvent_tenantId_assetId_occurredAt_idx" ON "FacilityAssetEvent"("tenantId", "assetId", "occurredAt");

-- CreateIndex
CREATE INDEX "FacilityAssetEvent_tenantId_sourceType_sourceId_idx" ON "FacilityAssetEvent"("tenantId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "FacilityInspectionTask_tenantId_complexId_status_dueAt_idx" ON "FacilityInspectionTask"("tenantId", "complexId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "FacilityInspectionTask_tenantId_assigneeId_scheduledAt_idx" ON "FacilityInspectionTask"("tenantId", "assigneeId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityInspectionResult_taskId_key" ON "FacilityInspectionResult"("taskId");

-- CreateIndex
CREATE INDEX "FacilityInspectionResult_tenantId_submittedAt_idx" ON "FacilityInspectionResult"("tenantId", "submittedAt");

-- CreateIndex
CREATE INDEX "FacilityIncident_tenantId_complexId_severityCode_occurredAt_idx" ON "FacilityIncident"("tenantId", "complexId", "severityCode", "occurredAt");

-- CreateIndex
CREATE INDEX "FacilityIncident_tenantId_assetId_idx" ON "FacilityIncident"("tenantId", "assetId");

-- CreateIndex
CREATE INDEX "FacilityWorkOrder_tenantId_complexId_status_targetAt_idx" ON "FacilityWorkOrder"("tenantId", "complexId", "status", "targetAt");

-- CreateIndex
CREATE INDEX "FacilityWorkOrder_tenantId_assigneeId_status_idx" ON "FacilityWorkOrder"("tenantId", "assigneeId", "status");

-- CreateIndex
CREATE INDEX "FacilityWorkOrder_tenantId_vendorId_status_idx" ON "FacilityWorkOrder"("tenantId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "FacilityWorkLog_tenantId_workOrderId_occurredAt_idx" ON "FacilityWorkLog"("tenantId", "workOrderId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityReplacementCandidate_assetId_key" ON "FacilityReplacementCandidate"("assetId");

-- CreateIndex
CREATE INDEX "FacilityReplacementCandidate_tenantId_complexId_totalRiskSc_idx" ON "FacilityReplacementCandidate"("tenantId", "complexId", "totalRiskScore");

-- CreateIndex
CREATE INDEX "FacilityLongTermPlan_tenantId_complexId_statusCode_idx" ON "FacilityLongTermPlan"("tenantId", "complexId", "statusCode");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityLongTermPlan_tenantId_complexId_version_key" ON "FacilityLongTermPlan"("tenantId", "complexId", "version");

-- CreateIndex
CREATE INDEX "FacilityLongTermPlanItem_tenantId_plannedYear_statusCode_idx" ON "FacilityLongTermPlanItem"("tenantId", "plannedYear", "statusCode");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityLongTermPlanItem_planId_assetId_key" ON "FacilityLongTermPlanItem"("planId", "assetId");

-- CreateIndex
CREATE INDEX "FacilityProject_tenantId_complexId_status_startsAt_idx" ON "FacilityProject"("tenantId", "complexId", "status", "startsAt");

-- CreateIndex
CREATE INDEX "FacilityComplaint_tenantId_complexId_statusCode_createdAt_idx" ON "FacilityComplaint"("tenantId", "complexId", "statusCode", "createdAt");

-- CreateIndex
CREATE INDEX "FacilityComplaint_tenantId_residentKeyHash_createdAt_idx" ON "FacilityComplaint"("tenantId", "residentKeyHash", "createdAt");

-- CreateIndex
CREATE INDEX "FacilityDocument_tenantId_complexId_visibility_uploadedAt_idx" ON "FacilityDocument"("tenantId", "complexId", "visibility", "uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FacilityDocument_tenantId_entityType_entityId_nameKo_versio_key" ON "FacilityDocument"("tenantId", "entityType", "entityId", "nameKo", "version");

-- CreateIndex
CREATE INDEX "FacilityAIInsight_tenantId_complexId_severityCode_generated_idx" ON "FacilityAIInsight"("tenantId", "complexId", "severityCode", "generatedAt");

-- CreateIndex
CREATE INDEX "FacilityAIInsight_tenantId_ruleCode_ruleVersion_idx" ON "FacilityAIInsight"("tenantId", "ruleCode", "ruleVersion");

-- CreateIndex
CREATE INDEX "FacilityAIFeedback_tenantId_insightId_createdAt_idx" ON "FacilityAIFeedback"("tenantId", "insightId", "createdAt");

-- CreateIndex
CREATE INDEX "FacilityAuditLog_tenantId_complexId_occurredAt_idx" ON "FacilityAuditLog"("tenantId", "complexId", "occurredAt");

-- CreateIndex
CREATE INDEX "FacilityAuditLog_tenantId_entityType_entityId_idx" ON "FacilityAuditLog"("tenantId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "FacilityAssetType" ADD CONSTRAINT "FacilityAssetType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FacilityAssetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAsset" ADD CONSTRAINT "FacilityAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FacilityAssetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAsset" ADD CONSTRAINT "FacilityAsset_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "FacilityAssetType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAsset" ADD CONSTRAINT "FacilityAsset_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "FacilitySpace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAsset" ADD CONSTRAINT "FacilityAsset_replacedAssetId_fkey" FOREIGN KEY ("replacedAssetId") REFERENCES "FacilityAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAssetRelation" ADD CONSTRAINT "FacilityAssetRelation_fromAssetId_fkey" FOREIGN KEY ("fromAssetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAssetRelation" ADD CONSTRAINT "FacilityAssetRelation_toAssetId_fkey" FOREIGN KEY ("toAssetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAssetEvent" ADD CONSTRAINT "FacilityAssetEvent_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityInspectionTask" ADD CONSTRAINT "FacilityInspectionTask_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityInspectionResult" ADD CONSTRAINT "FacilityInspectionResult_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "FacilityInspectionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityIncident" ADD CONSTRAINT "FacilityIncident_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityIncident" ADD CONSTRAINT "FacilityIncident_inspectionResultId_fkey" FOREIGN KEY ("inspectionResultId") REFERENCES "FacilityInspectionResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWorkOrder" ADD CONSTRAINT "FacilityWorkOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWorkOrder" ADD CONSTRAINT "FacilityWorkOrder_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "FacilityIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWorkLog" ADD CONSTRAINT "FacilityWorkLog_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "FacilityWorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityReplacementCandidate" ADD CONSTRAINT "FacilityReplacementCandidate_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLongTermPlanItem" ADD CONSTRAINT "FacilityLongTermPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FacilityLongTermPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityLongTermPlanItem" ADD CONSTRAINT "FacilityLongTermPlanItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityComplaint" ADD CONSTRAINT "FacilityComplaint_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityComplaint" ADD CONSTRAINT "FacilityComplaint_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "FacilityWorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityDocument" ADD CONSTRAINT "FacilityDocument_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "FacilityAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityAIFeedback" ADD CONSTRAINT "FacilityAIFeedback_insightId_fkey" FOREIGN KEY ("insightId") REFERENCES "FacilityAIInsight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
