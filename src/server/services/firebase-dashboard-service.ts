import { demoAgenda, getDashboard } from "@/server/demo/store";
import { getDemoCampaignRecord } from "@/server/demo/agenda-campaign-store";
import {
  createConsentDashboardProjectionRepository,
  type ConsentDashboardProjection,
  type ConsentDashboardProjectionRepository,
} from "@/server/providers/firebase-firestore";
import { assertTenantScope } from "@/server/policies/campaign";

export class FirebaseDashboardService {
  constructor(private readonly repository: ConsentDashboardProjectionRepository | null = createConsentDashboardProjectionRepository()) {}

  isConfigured(): boolean {
    return this.repository !== null;
  }

  async sync(tenantId: string, campaignId: string): Promise<ConsentDashboardProjection | null> {
    assertTenantScope(tenantId, demoAgenda.tenantId);
    getDemoCampaignRecord(tenantId, campaignId);
    if (!this.repository) return null;

    const dashboard = getDashboard();
    const projection: ConsentDashboardProjection = {
      tenantId,
      campaignId,
      total: dashboard.total,
      delivered: dashboard.delivered,
      opened: dashboard.opened,
      verified: dashboard.verified,
      responded: dashboard.responded,
      consent: dashboard.consent,
      oppose: dashboard.oppose,
      abstain: dashboard.abstain,
      failed: dashboard.failed,
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    };
    await this.repository.upsert(projection);
    return projection;
  }

  async find(tenantId: string, campaignId: string): Promise<ConsentDashboardProjection | null> {
    assertTenantScope(tenantId, demoAgenda.tenantId);
    getDemoCampaignRecord(tenantId, campaignId);
    return this.repository?.find(tenantId, campaignId) ?? null;
  }
}
