# ORBIS D&C 공식 웹사이트

공개 사이트는 `/`, `/hion`, `/solutions`, `/industries/education`, `/company`, `/contact`, `/privacy` 경로로 구성됩니다. 기존 HiON 운영 화면과 같은 Next.js 애플리케이션에서 동작하며, 공개 화면은 `src/components/marketing`, `src/styles/marketing.css`, 문구와 회사 정보는 `src/content/site.ts`에서 관리합니다.

`pnpm install`, `pnpm dev`로 실행하고 `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`로 검증합니다.

문의는 `POST /api/inquiries`에서 서버 검증한 뒤 `src/server/providers/inquiry-delivery.ts`의 전달 어댑터로 보냅니다. 운영 환경에 HTTPS `INQUIRY_WEBHOOK_URL`과 `INQUIRY_WEBHOOK_TOKEN`을 모두 설정해야 실제 접수가 활성화됩니다. 설정되지 않으면 성공으로 가장하지 않고 503과 한국어 안내를 반환합니다.

배포 전 사람의 승인이 필요한 항목은 `docs/ORBISDNC_LAUNCH_CHECKLIST.md`에서 확인합니다. 법무 승인 전 개인정보처리방침은 `noindex` 상태를 유지합니다.

# HION Apartment OS 통합 데모

HION Apartment OS는 아파트 공용시설의 3D 공간, 고유 자산 ID, 점검, 고장, 작업지시, 교체 검토, 장기수선, 예산과 입주민 의사결정 근거를 연결하는 한국어 우선 운영 플랫폼입니다. 기존 HION 주민 동의와 관리비 원장도 같은 저장소에 독립된 모듈로 유지됩니다.

## Apartment OS 데모

- 로그인: `http://localhost:3000/login`
- 운영 대시보드: `http://localhost:3000/dashboard`
- 3D 자산맵: `http://localhost:3000/asset-map`
- 시설자산: `http://localhost:3000/assets`
- 점검: `http://localhost:3000/inspections`
- 작업지시: `http://localhost:3000/work-orders`
- 교체·장기수선: `http://localhost:3000/replacement`
- 공사·예산: `http://localhost:3000/projects`, `http://localhost:3000/budget`
- 입주민 소통: `http://localhost:3000/complaints`, `http://localhost:3000/notices`, `http://localhost:3000/meetings`
- AI 인사이트: `http://localhost:3000/ai-insights`
- 문서·보고서: `http://localhost:3000/documents`, `http://localhost:3000/reports`
- 설정·감사: `http://localhost:3000/settings/users`, `http://localhost:3000/settings/audit`

시드 단지는 가상 단지인 `HION 스마트파크`입니다. 8개 동, 864세대, 연면적 82,123㎡, 주차 1,024면과 48개 상세 공용시설 자산을 포함합니다. 모든 시설자산은 `HION-HSP01-...` 고유 ID, 자산코드, 제조번호와 3D 객체 ID를 분리해 보관합니다.

### 데모 계정

모든 Apartment OS 데모 계정의 비밀번호는 `demo1234`입니다.

| 역할 | 이름 | 이메일 | 접근 범위 |
| --- | --- | --- | --- |
| 플랫폼 관리자 | 오르비서비스 관리자 | `admin@hion.local` | 전체 단지와 플랫폼 설정 |
| 관리사무소 책임자 | 김관리 | `manager@hion.local` | 선택 단지 운영과 승인 |
| 시설 담당자 | 박기술 | `technician@hion.local` | 본인 점검과 작업지시 |
| 입주자대표회의 | 이대표 | `committee@hion.local` | 승인된 운영 근거 읽기 |
| 협력업체 | 한빛시설관리 | `vendor@hion.local` | 배정된 작업과 증빙 |
| 입주민 | 정입주 | `resident@hion.local` | 공개 정보와 본인 민원 |

비밀번호는 bcrypt 해시로 검증하고 역할·단지 정보는 서명된 HttpOnly 쿠키에 저장합니다. 데모 공급자는 로컬 개발 또는 명시적인 공개 데모 모드에서만 허용됩니다.

### 구현된 핵심 흐름

1. 절차형 3D 단지의 상태 마커를 선택해 같은 자산 ID의 상세·이력·점검·비용을 엽니다.
2. 이상 점검 결과에 연결된 작업지시를 담당자·업체에 배정하고 작업 전·후 증빙과 비용을 기록합니다.
3. 완료 요약과 작업 후 증빙이 모두 있어야 검수 요청을 완료할 수 있으며 모든 상태 변경은 감사 이력에 추가됩니다.
4. 교체 검토는 건전도 25%, 반복 고장 20%, 중요도 20%, 유지비 15%, 입주민 영향 10%, 기한 10%의 근거를 공개하고 유지·부분보수·전면교체 시나리오를 비교합니다.
5. 규칙 기반 AI 인사이트는 외부 AI 키 없이 반복 고장, 점검 지연과 교체 위험을 탐지하고 근거·규칙 버전·권장 조치를 표시합니다.
6. 민원은 공간·자산·작업지시에 연결되며 공개 진행상태에는 다른 입주민 개인정보나 내부 메모를 노출하지 않습니다.

### 시설 도메인 구조

- `src/app/(facility)`: Apartment OS 화면과 얇은 Route Handler
- `src/components/facility`, `src/components/digital-twin`: 운영 화면과 React Three Fiber 3D 어댑터
- `src/server/services/facility-*`: 위험점수, 작업 상태 전이, 점검 기한, 예산, 역할·단지 범위, 인사이트 규칙
- `src/store/apartmentOperationsStore.ts`: 재시작 가능한 로컬 데모 작업·증빙·감사 상태
- `prisma/schema.prisma`: `Facility*` 접두사의 공간·자산·점검·사고·작업·교체·장기수선·공사·민원·문서·인사이트·감사 모델
- `prisma/migrations/20260721161000_apartment_os_facilities`: 기존 스키마에서 시설 도메인으로의 PostgreSQL 마이그레이션
- `prisma/seed.ts`: 기존 2,000세대 관리비 시드와 별도로 HION 스마트파크 864세대·48개 시설자산 시드

### 의도적으로 어댑터로 남긴 P2 연동

- 실제 IFC 변환과 3DEXPERIENCE/GLB 자산 파이프라인
- 외부 BMS·IoT·CCTV·EV 충전 관제 실시간 수집
- S3 호환 객체 저장소와 바이러스 검사
- 회계·입찰·전자계약 시스템 연동
- 법적 전자서명·본인확인과 별도 HION 주민 동의 서비스의 운영 연결
- 외부 LLM 기반 예측 모델(현재는 설명 가능한 결정론 규칙 사용)

법적 효력을 자동 보장하지 않으며 운영 전 법률 검토와 승인된 본인확인·전자서명 공급자 연동이 필요합니다.

## 빠른 시작

Node.js 24, pnpm 11, Docker Desktop이 필요합니다.

```powershell
Copy-Item .env.example .env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

`pnpm setup`은 환경 파일 복사, PostgreSQL 실행, 생성·마이그레이션·시드를 순서대로 수행합니다. Windows PowerShell에서도 동작합니다.

## 개발 주소와 계정

- 홈: `https://hion-resident-consent-demo.orbisenc.chatgpt.site`
- 입주민 시연: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/c/demo-parking-change-1203`
- 관리자: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/login`
- 관리자 이메일: `admin@hion.local`
- 개발 비밀번호: `Hion!2026dev`
- 개발 MFA: `000000`
- 시연 세대: `101동 1203호`
- 시연 전화번호: `010-0000-1203`
- 주민 OTP: `123456`

위 값은 모두 로컬 시연 전용입니다. 운영에서 절대 사용하지 마세요. 앱은 운영 모드에서 모의 본인확인 공급자나 개발 세션 비밀을 감지하면 관련 기능을 차단합니다.

## 주요 명령

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm demo:reset
```

`pnpm demo:reset`은 현재 개발 서버 프로세스와 별도 프로세스로 실행되므로 메모리 응답 초기화 안내를 출력합니다. 데이터베이스 시드는 `pnpm db:seed`로 멱등 적용합니다.

## 안건 제작·현황 관리 시연

- 안건 목록: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/agendas`
- 안건 제작 상세: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/agendas/demo-agenda`
- 3D 장면 구성: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/agendas/demo-agenda/viewer`
- 안건 현황 목록: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/campaigns`
- 진행 상세: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/campaigns/demo-campaign`
- 결과·증거 보고서: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/campaigns/demo-campaign/reports`

안건은 게시 준비 점검 후 `초안 → 검토 중 → 승인 → 게시` 순서로 처리합니다. 게시본은 직접 수정하지 않고 새 버전을 만들어야 합니다. 현황 관리에서는 기간·명부·본인확인·정족수 정책을 설정하고, 진행 중에는 설정을 보호하며 일시중지 후 변경할 수 있습니다. 재안내는 개인정보 대신 미응답·발송 실패·열람 후 미인증 구간을 사용합니다.

## 관리비 현황·분석 시연

관리자 로그인 후 왼쪽 `관리비 관리`에서 다음 화면을 확인할 수 있습니다.

- 관리비 대시보드: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/fees`
- 월별 관리비: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/fees/monthly`
- 세대별 현황: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/fees/units`
- 데이터 등록: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/fees/imports`
- 관리비 보고서: `https://hion-resident-consent-demo.orbisenc.chatgpt.site/admin/fees/reports`

개발 관리자 세션에는 단지 관리자, 회계 담당자, 승인자, 콘텐츠 담당자 역할이 함께 부여됩니다. 데이터 등록 화면에서 한국어 CSV 양식을 내려받아 부과 또는 수납·환급 자료를 검증하고 확정할 수 있습니다. 금액은 모두 원 단위 정수로 계산하며, 마감 뒤 직접 수정은 거부되고 승인된 재개 또는 추가 전용 조정을 사용합니다.

결정적 시드는 5개 동·2,000세대의 12개월 관리비 부과, 수납, 환급, 미납, 과납, 면제, 조정, 예산과 안건 비용 영향을 생성합니다. 실제 데이터가 아닌 개발용 가상 자료입니다.

## 저장소 구조

- `src/app`: Next.js 화면과 얇은 API 처리기
- `src/server/services`: 응답 원장·명부 등 업무 규칙
- `src/server/providers`: 본인확인·알림·저장소·악성 파일 검사·전자서명 경계
- `prisma`: PostgreSQL 모델, 마이그레이션, 2,000세대 시드
- `tests`: 단위·통합·Playwright 흐름
- `docs`: 구조, API, 보안, 운영, 후속 작업, 진행 기록
