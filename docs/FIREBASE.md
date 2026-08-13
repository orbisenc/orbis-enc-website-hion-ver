# Firebase 연동

## 연결 대상

- Firebase 프로젝트: `orbis-gantt-chart-e6363`
- 웹 앱 표시 이름: `HION Consent`
- 웹 앱 ID: `1:952441003780:web:9a2eaa71bdd5cb1910fa51`
- Firestore 데이터베이스: `(default)`
- 리전: 서울 `asia-northeast3`

공개 Web SDK 설정은 로컬 `.env.local`에 적용되어 있습니다. 배포 환경에도 같은 `NEXT_PUBLIC_FIREBASE_*` 변수를 등록해야 합니다.

## 데이터 경계

PostgreSQL이 입주민, 의결권, 응답 원장, 동의 증거와 감사 이력의 기준 저장소입니다. Firebase에는 다음과 같은 개인정보 없는 실시간 집계 읽기 모델만 저장합니다.

`hionConsentRuntime/private/tenants/{tenantId}/campaigns/{campaignId}`

저장 항목은 대상 수, 발송·열람·본인 확인·응답 수, 동의·반대·기권 수, 실패 수, 갱신 시각과 스키마 버전입니다. 이름, 전화번호, 세대, 자유 의견, 영수증 번호, 개별 응답과 증거 해시는 저장하지 않습니다.

기존 Firebase 프로젝트는 다른 앱도 사용합니다. 현재 기존 규칙의 최상위 동적 컬렉션 접근을 변경하면 그 앱이 중단될 수 있으므로 기존 규칙을 그대로 보존했습니다. HION은 기존 공개 규칙이 닿지 않는 중첩 경로를 사용합니다. 서버가 서명한 Firebase ID 토큰에 `hionServer`와 `tenantId` 클레임을 넣고, Firestore Security Rules가 그 테넌트 경로만 허용합니다.

## 서버 자격 증명

다음 값은 공개 Web SDK 설정과 다르며 서버 암호 저장소에만 등록해야 합니다.

```dotenv
FIREBASE_SERVICE_ACCOUNT_EMAIL="hion-consent-sync@orbis-gantt-chart-e6363.iam.gserviceaccount.com"
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

서비스 계정에는 프로젝트 전체 Firestore IAM 역할을 부여하지 않습니다. 이 키는 HION용 Firebase 커스텀 토큰 서명에만 사용하며 데이터 접근 범위는 보안 규칙이 제한합니다. 실제 개인 키를 저장소, 로그, 클라이언트 번들 또는 문서에 넣지 않습니다. Cloudflare 배포 시에는 Wrangler 암호로 등록하고, 가능한 운영 환경에서는 장기 개인 키 대신 원격 서명 또는 Workload Identity Federation을 사용합니다.

## 동기화 흐름

- 주민 응답은 먼저 PostgreSQL 원장 또는 현재 개발용 원장에 기록됩니다.
- 원장 기록 후 Firebase 집계 스냅샷을 갱신합니다.
- Firebase 장애가 원본 응답 제출을 취소하거나 증거 원장을 덮어쓰지 않습니다.
- 관리자로 로그인한 뒤 `POST /api/firebase/dashboard`로 수동 동기화할 수 있습니다.
- `GET /api/firebase/dashboard`로 Firebase에 저장된 집계를 확인할 수 있습니다.
- `GET /api/firebase/status`는 공개 SDK와 서버 자격 증명 준비 상태만 반환하며 비밀은 반환하지 않습니다.
