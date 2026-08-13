# HION 저장소 작업 지침

- 구조: `src/app`은 화면·얇은 Route Handler, `src/server/services`는 업무 규칙, `src/server/providers`는 외부 연동, `prisma`는 스키마·마이그레이션·시드를 담당한다.
- 준비/실행: `pnpm install`, `docker compose up -d`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev` 순서로 실행한다.
- 검증: 변경 범위 테스트를 먼저 실행하고 완료 전 `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`를 확인한다.
- 언어: 사용자 화면, 오류, 샘플 데이터, 운영·개발 문서는 자연스러운 한국어로 작성하고 문서 언어는 `ko`로 둔다.
- 경계: 테넌트 필터와 권한 확인은 서버에서 강제한다. Route Handler와 React 컴포넌트에 업무 규칙을 넣지 않는다.
- 보안: 실제 개인정보·비밀을 저장하거나 로그에 남기지 않는다. 입력은 Zod로 검증하고, 개발용 OTP·MFA·공급자는 운영에서 차단한다. 감사·동의 증거는 덮어쓰지 않는다.
- 관리비: 금액은 원 단위 `bigint`로 계산하고 업무 규칙은 `src/server/services/management-fee-*`에 둔다. 마감 스냅샷, 가져오기, 조정, 감사 이력은 덮어쓰거나 삭제하지 않는다.
- 관리비 검증: 원장 계산·CSV·권한·수명주기 테스트와 회계 관리자 E2E를 유지하고, 2,000세대 CSV 검증 기준은 로컬 5초 이내로 둔다.
- Git: 사용자 변경을 보존하고 강제 체크아웃, 하드 리셋, 광범위 삭제, 기록 변경을 하지 않는다. 요청 없이 커밋·푸시·배포하지 않는다.
- 완료 기준: 2,000세대 시드, 관리자 대시보드, 초대→본인 확인→한국어 안건 확인→응답→영수증 흐름, 응답 무결성, 테넌트 격리, 3D 대체 경로, 내보내기, 문서와 전체 검증 명령이 준비되어야 한다.
