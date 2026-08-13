-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('PLATFORM_ADMIN', 'COMPLEX_ADMIN', 'CONTENT_EDITOR', 'APPROVER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "AgendaState" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'OPEN', 'PAUSED', 'CLOSED', 'FINALIZED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignTargetStatus" AS ENUM ('IMPORTED', 'INVITED', 'OPENED', 'VERIFIED', 'RESPONDED', 'INVALID', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ResponseState" AS ENUM ('ACTIVE', 'SUPERSEDED', 'WITHDRAWN', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "ProcessingState" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignMode" AS ENUM ('OPINION', 'MANAGEMENT_VOTE', 'LEGAL_CONSENT');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('MODEL_3D', 'VIDEO', 'IMAGE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "RosterState" AS ENUM ('DRAFT', 'CONFIRMED', 'FROZEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvitationState" AS ENUM ('CREATED', 'SENT', 'DELIVERED', 'FAILED', 'OPENED');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('SIMPLE_OTP', 'IDENTITY_MATCH', 'STRONG_SIGNATURE');

-- CreateEnum
CREATE TYPE "VerificationState" AS ENUM ('REQUESTED', 'SUCCEEDED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationState" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "RightType" AS ENUM ('OWNER', 'TENANT', 'PROXY', 'CO_OWNER');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "branding" JSONB,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mfaSecretHash" TEXT,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAccessGrant" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "approver" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complex" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '사용',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedContact" TEXT NOT NULL,
    "searchHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RosterVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "sourceFileHash" TEXT NOT NULL,
    "state" "RosterState" NOT NULL DEFAULT 'DRAFT',
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "confirmedBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "frozenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RosterVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eligibility" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "rosterId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "rightType" "RightType" NOT NULL,
    "rightCount" DECIMAL(8,3) NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "proxyMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Eligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '사용',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "sha256" TEXT NOT NULL,
    "processingState" "ProcessingState" NOT NULL DEFAULT 'UPLOADED',
    "thumbnailPath" TEXT,
    "altTextKo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewerScene" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assetVersionId" TEXT NOT NULL,
    "initialCamera" JSONB NOT NULL,
    "rotationCenter" JSONB NOT NULL,
    "background" TEXT NOT NULL,
    "beforeAfter" JSONB NOT NULL,
    "fallbackImage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewerScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotspot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,
    "titleKo" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "cameraPreset" JSONB,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "state" "AgendaState" NOT NULL DEFAULT 'DRAFT',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agendaId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "summaryKo" TEXT NOT NULL,
    "backgroundKo" TEXT NOT NULL,
    "changeScopeKo" TEXT NOT NULL,
    "benefitKo" TEXT NOT NULL,
    "scheduleKo" TEXT NOT NULL,
    "cautionsKo" TEXT NOT NULL,
    "contactKo" TEXT NOT NULL,
    "consentTextKo" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "contentManifest" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "approvalState" "AgendaState" NOT NULL DEFAULT 'DRAFT',
    "reviewerFeedbackKo" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "agendaVersionId" TEXT NOT NULL,
    "rosterVersionId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "mode" "CampaignMode" NOT NULL,
    "verificationLevel" "VerificationLevel" NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "allowResponseChange" BOOLEAN NOT NULL DEFAULT false,
    "allowWithdrawal" BOOLEAN NOT NULL DEFAULT false,
    "quorumRule" JSONB NOT NULL,
    "resultDisclosure" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTarget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "eligibilityId" TEXT NOT NULL,
    "status" "CampaignTargetStatus" NOT NULL DEFAULT 'IMPORTED',
    "currentResponseId" TEXT,
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "lastFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "state" "InvitationState" NOT NULL DEFAULT 'CREATED',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalTransactionId" TEXT NOT NULL,
    "resultCode" TEXT NOT NULL,
    "state" "VerificationState" NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "selectedOption" TEXT NOT NULL,
    "commentKo" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" "ResponseState" NOT NULL DEFAULT 'ACTIVE',
    "previousId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentEvidence" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "agendaHash" TEXT NOT NULL,
    "consentTextHash" TEXT NOT NULL,
    "contentManifestHash" TEXT NOT NULL,
    "serverTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sealHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "targetId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "templateKo" TEXT NOT NULL,
    "providerResult" JSONB NOT NULL,
    "state" "NotificationState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "beforeValue" JSONB,
    "afterValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "reasonKo" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "campaignId" TEXT,
    "eventName" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "TenantMembership_adminId_tenantId_idx" ON "TenantMembership"("adminId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_tenantId_adminId_role_key" ON "TenantMembership"("tenantId", "adminId", "role");

-- CreateIndex
CREATE INDEX "SupportAccessGrant_tenantId_adminId_startsAt_endsAt_idx" ON "SupportAccessGrant"("tenantId", "adminId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Complex_tenantId_idx" ON "Complex"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Complex_tenantId_name_key" ON "Complex"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Building_tenantId_complexId_idx" ON "Building"("tenantId", "complexId");

-- CreateIndex
CREATE UNIQUE INDEX "Building_complexId_code_key" ON "Building"("complexId", "code");

-- CreateIndex
CREATE INDEX "Unit_tenantId_buildingId_idx" ON "Unit"("tenantId", "buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_buildingId_code_key" ON "Unit"("buildingId", "code");

-- CreateIndex
CREATE INDEX "Person_tenantId_idx" ON "Person"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_tenantId_searchHash_key" ON "Person"("tenantId", "searchHash");

-- CreateIndex
CREATE INDEX "RosterVersion_tenantId_state_idx" ON "RosterVersion"("tenantId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "RosterVersion_complexId_version_key" ON "RosterVersion"("complexId", "version");

-- CreateIndex
CREATE INDEX "Eligibility_tenantId_rosterId_unitId_idx" ON "Eligibility"("tenantId", "rosterId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Eligibility_rosterId_personId_unitId_rightType_key" ON "Eligibility"("rosterId", "personId", "unitId", "rightType");

-- CreateIndex
CREATE INDEX "Asset_tenantId_type_idx" ON "Asset"("tenantId", "type");

-- CreateIndex
CREATE INDEX "AssetVersion_tenantId_processingState_idx" ON "AssetVersion"("tenantId", "processingState");

-- CreateIndex
CREATE UNIQUE INDEX "AssetVersion_assetId_version_key" ON "AssetVersion"("assetId", "version");

-- CreateIndex
CREATE INDEX "ViewerScene_tenantId_assetVersionId_idx" ON "ViewerScene"("tenantId", "assetVersionId");

-- CreateIndex
CREATE INDEX "Hotspot_tenantId_sceneId_sortOrder_idx" ON "Hotspot"("tenantId", "sceneId", "sortOrder");

-- CreateIndex
CREATE INDEX "Agenda_tenantId_state_idx" ON "Agenda"("tenantId", "state");

-- CreateIndex
CREATE INDEX "AgendaVersion_tenantId_approvalState_idx" ON "AgendaVersion"("tenantId", "approvalState");

-- CreateIndex
CREATE UNIQUE INDEX "AgendaVersion_agendaId_version_key" ON "AgendaVersion"("agendaId", "version");

-- CreateIndex
CREATE INDEX "Campaign_tenantId_status_startsAt_endsAt_idx" ON "Campaign"("tenantId", "status", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTarget_currentResponseId_key" ON "CampaignTarget"("currentResponseId");

-- CreateIndex
CREATE INDEX "CampaignTarget_tenantId_campaignId_status_idx" ON "CampaignTarget"("tenantId", "campaignId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTarget_campaignId_eligibilityId_key" ON "CampaignTarget"("campaignId", "eligibilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_tenantId_campaignId_state_idx" ON "Invitation"("tenantId", "campaignId", "state");

-- CreateIndex
CREATE INDEX "Verification_tenantId_targetId_state_idx" ON "Verification"("tenantId", "targetId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Response_receiptNumber_key" ON "Response"("receiptNumber");

-- CreateIndex
CREATE INDEX "Response_tenantId_campaignId_targetId_state_idx" ON "Response"("tenantId", "campaignId", "targetId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Response_campaignId_idempotencyKey_key" ON "Response"("campaignId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentEvidence_responseId_key" ON "ConsentEvidence"("responseId");

-- CreateIndex
CREATE INDEX "ConsentEvidence_tenantId_serverTimestamp_idx" ON "ConsentEvidence"("tenantId", "serverTimestamp");

-- CreateIndex
CREATE INDEX "NotificationEvent_tenantId_state_createdAt_idx" ON "NotificationEvent"("tenantId", "state", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_tenantId_occurredAt_idx" ON "AuditEvent"("tenantId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_tenantId_action_objectType_idx" ON "AuditEvent"("tenantId", "action", "objectType");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_tenantId_eventName_occurredAt_idx" ON "AnalyticsEvent"("tenantId", "eventName", "occurredAt");

-- 동일 캠페인·의결권에 활성 응답이 둘 이상 생기지 않도록 데이터베이스에서도 강제한다.
CREATE UNIQUE INDEX "Response_one_active_per_target" ON "Response"("campaignId", "targetId") WHERE "state" = 'ACTIVE';

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complex" ADD CONSTRAINT "Complex_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterVersion" ADD CONSTRAINT "RosterVersion_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "Complex"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eligibility" ADD CONSTRAINT "Eligibility_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "RosterVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eligibility" ADD CONSTRAINT "Eligibility_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Eligibility" ADD CONSTRAINT "Eligibility_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetVersion" ADD CONSTRAINT "AssetVersion_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewerScene" ADD CONSTRAINT "ViewerScene_assetVersionId_fkey" FOREIGN KEY ("assetVersionId") REFERENCES "AssetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "ViewerScene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaVersion" ADD CONSTRAINT "AgendaVersion_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_agendaVersionId_fkey" FOREIGN KEY ("agendaVersionId") REFERENCES "AgendaVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_rosterVersionId_fkey" FOREIGN KEY ("rosterVersionId") REFERENCES "RosterVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTarget" ADD CONSTRAINT "CampaignTarget_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTarget" ADD CONSTRAINT "CampaignTarget_eligibilityId_fkey" FOREIGN KEY ("eligibilityId") REFERENCES "Eligibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTarget" ADD CONSTRAINT "CampaignTarget_currentResponseId_fkey" FOREIGN KEY ("currentResponseId") REFERENCES "Response"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "CampaignTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "CampaignTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "CampaignTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_previousId_fkey" FOREIGN KEY ("previousId") REFERENCES "Response"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentEvidence" ADD CONSTRAINT "ConsentEvidence_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentEvidence" ADD CONSTRAINT "ConsentEvidence_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
