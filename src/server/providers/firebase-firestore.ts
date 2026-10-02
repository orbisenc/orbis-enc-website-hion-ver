import { importPKCS8, SignJWT } from "jose";
import { z } from "zod";

const pathSegmentSchema = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);

export const consentDashboardProjectionSchema = z.object({
  tenantId: pathSegmentSchema,
  campaignId: pathSegmentSchema,
  total: z.number().int().nonnegative(),
  delivered: z.number().int().nonnegative(),
  opened: z.number().int().nonnegative(),
  verified: z.number().int().nonnegative(),
  responded: z.number().int().nonnegative(),
  consent: z.number().int().nonnegative(),
  oppose: z.number().int().nonnegative(),
  abstain: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.literal(1),
});

export type ConsentDashboardProjection = z.infer<typeof consentDashboardProjectionSchema>;

export interface FirebaseServerConfig {
  projectId: string;
  apiKey: string;
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
}

export interface ConsentDashboardProjectionRepository {
  upsert(projection: ConsentDashboardProjection): Promise<void>;
  find(tenantId: string, campaignId: string): Promise<ConsentDashboardProjection | null>;
}

type Fetcher = typeof fetch;

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  timestampValue?: string;
}

interface FirestoreDocument {
  fields?: Record<string, FirestoreValue>;
}

const globalTokenCache = globalThis as typeof globalThis & {
  __hionFirebaseIdTokens?: Map<string, { value: string; expiresAt: number }>;
};

export function getFirebaseServerConfig(env: Record<string, string | undefined> = process.env): FirebaseServerConfig | null {
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const serviceAccountEmail = env.FIREBASE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replaceAll("\\n", "\n").trim();
  if (!projectId || !apiKey || !serviceAccountEmail || !privateKey) return null;
  return { projectId, apiKey, serviceAccountEmail, serviceAccountPrivateKey: privateKey };
}

export function isFirebaseServerConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return getFirebaseServerConfig(env) !== null;
}

async function getIdToken(config: FirebaseServerConfig, tenantId: string, fetcher: Fetcher): Promise<string> {
  const tenant = pathSegmentSchema.parse(tenantId);
  const cache = (globalTokenCache.__hionFirebaseIdTokens ??= new Map());
  const cacheKey = `${config.serviceAccountEmail}:${tenant}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value;

  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(config.serviceAccountPrivateKey, "RS256");
  const customToken = await new SignJWT({ uid: "hion-consent-server", claims: { hionServer: true, tenantId: tenant } })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(config.serviceAccountEmail)
    .setSubject(config.serviceAccountEmail)
    .setAudience("https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetcher(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${encodeURIComponent(config.apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  if (!response.ok) throw new Error("Firebase 서버 인증에 실패했습니다.");
  const body = (await response.json()) as { idToken?: string; expiresIn?: string };
  if (!body.idToken) throw new Error("Firebase 서버 인증 응답이 올바르지 않습니다.");
  cache.set(cacheKey, { value: body.idToken, expiresAt: Date.now() + Number(body.expiresIn ?? 3600) * 1000 });
  return body.idToken;
}

function documentUrl(config: FirebaseServerConfig, tenantId: string, campaignId: string): string {
  const tenant = pathSegmentSchema.parse(tenantId);
  const campaign = pathSegmentSchema.parse(campaignId);
  const databaseId = process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID?.trim() || "orbis-dnc";
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/${encodeURIComponent(databaseId)}/documents`;
  return `${base}/hionConsentRuntime/private/tenants/${encodeURIComponent(tenant)}/campaigns/${encodeURIComponent(campaign)}`;
}

function toFirestoreDocument(projection: ConsentDashboardProjection): FirestoreDocument {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, value] of Object.entries(projection)) {
    fields[key] = typeof value === "number" ? { integerValue: String(value) } : key === "updatedAt" ? { timestampValue: value } : { stringValue: value };
  }
  return { fields };
}

function fromFirestoreDocument(document: FirestoreDocument): ConsentDashboardProjection {
  const fields = document.fields ?? {};
  const value = (key: string) => fields[key]?.stringValue ?? fields[key]?.timestampValue;
  const integer = (key: string) => Number(fields[key]?.integerValue);
  return consentDashboardProjectionSchema.parse({
    tenantId: value("tenantId"),
    campaignId: value("campaignId"),
    total: integer("total"),
    delivered: integer("delivered"),
    opened: integer("opened"),
    verified: integer("verified"),
    responded: integer("responded"),
    consent: integer("consent"),
    oppose: integer("oppose"),
    abstain: integer("abstain"),
    failed: integer("failed"),
    updatedAt: value("updatedAt"),
    schemaVersion: integer("schemaVersion"),
  });
}

export class FirestoreConsentDashboardRepository implements ConsentDashboardProjectionRepository {
  constructor(
    private readonly config: FirebaseServerConfig,
    private readonly fetcher: Fetcher = fetch,
    private readonly tokenProvider: (config: FirebaseServerConfig, tenantId: string, fetcher: Fetcher) => Promise<string> = getIdToken,
  ) {}

  async upsert(input: ConsentDashboardProjection): Promise<void> {
    const projection = consentDashboardProjectionSchema.parse(input);
    const token = await this.tokenProvider(this.config, projection.tenantId, this.fetcher);
    const response = await this.fetcher(documentUrl(this.config, projection.tenantId, projection.campaignId), {
      method: "PATCH",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(toFirestoreDocument(projection)),
    });
    if (!response.ok) throw new Error("Firebase 집계 데이터를 저장하지 못했습니다.");
  }

  async find(tenantId: string, campaignId: string): Promise<ConsentDashboardProjection | null> {
    const token = await this.tokenProvider(this.config, tenantId, this.fetcher);
    const response = await this.fetcher(documentUrl(this.config, tenantId, campaignId), {
      headers: { authorization: `Bearer ${token}` },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Firebase 집계 데이터를 읽지 못했습니다.");
    return fromFirestoreDocument((await response.json()) as FirestoreDocument);
  }
}

export function createConsentDashboardProjectionRepository(): ConsentDashboardProjectionRepository | null {
  const config = getFirebaseServerConfig();
  return config ? new FirestoreConsentDashboardRepository(config) : null;
}
