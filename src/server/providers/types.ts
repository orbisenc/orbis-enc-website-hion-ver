export interface VerificationRequest { phone: string; purposeKo: string }
export interface VerificationChallenge { transactionId: string; expiresAt: Date }
export interface VerificationConfirmation { transactionId: string; otp: string }
export interface VerificationResult { success: boolean; resultCode: string; verifiedAt?: Date }
export interface IdentityProvider {
  requestVerification(input: VerificationRequest): Promise<VerificationChallenge>;
  confirmVerification(input: VerificationConfirmation): Promise<VerificationResult>;
}
export interface NotificationMessage { channel: "SMS" | "EMAIL" | "PUSH"; recipientToken: string; contentKo: string }
export interface NotificationResult { success: boolean; providerMessageId: string; resultKo: string }
export interface NotificationProvider { send(input: NotificationMessage): Promise<NotificationResult> }
export interface StoragePutInput { key: string; data: Uint8Array; mimeType: string }
export interface StoredObject { key: string; size: number; mimeType: string; sha256: string }
export interface StorageProvider {
  put(input: StoragePutInput): Promise<StoredObject>;
  get(key: string): Promise<Uint8Array>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}
export interface ScanResult { safe: boolean; reasonKo: string }
export interface MalwareScanProvider { scan(file: StoredObject): Promise<ScanResult> }
export interface SigningRequest { subjectId: string; documentHash: string }
export interface SigningSession { enabled: boolean; sessionId?: string; messageKo: string }
export interface SignatureVerificationInput { sessionId: string }
export interface SignatureVerificationResult { valid: boolean; messageKo: string }
export interface ElectronicSignatureProvider {
  createSigningRequest(input: SigningRequest): Promise<SigningSession>;
  verify(input: SignatureVerificationInput): Promise<SignatureVerificationResult>;
}
