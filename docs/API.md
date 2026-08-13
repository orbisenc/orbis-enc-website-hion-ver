# API 명세

모든 JSON 입력은 `src/lib/validation/contracts.ts`의 Zod 계약으로 검증합니다. 보호된 관리자 API는 HttpOnly 세션이 필요하며 운영 구현은 세션 테넌트와 대상 테넌트를 함께 검사해야 합니다.

| 메서드와 경로 | 용도 | 주요 입력/출력 |
|---|---|---|
| `POST /api/admin/login` | 관리자 비밀번호·MFA 로그인 | 이메일, 비밀번호, 6자리 인증번호 |
| `GET /api/invitations/[token]` | 초대 확인 | 게시 안건과 기간 |
| `POST /api/verification/request` | 주민 OTP 요청 | 초대 토큰, 전화번호 |
| `POST /api/verification/confirm` | OTP 확인 | 거래 UUID, 6자리 OTP |
| `POST /api/responses` | 멱등 응답 제출 | 확인 UUID, 선택, 멱등 UUID, 동의문 확인 |
| `GET /api/receipt?token=` | 동일 영수증 재조회 | 활성 응답 영수증 |
| `GET/PATCH /api/admin/agendas/[id]` | 안건 조회·초안 저장·상태 전이 | 본문, 선택지, 검토 의견, 새 버전·검토·승인·게시 |
| `GET/POST/DELETE /api/admin/agendas/[id]/attachments` | 주민 공개 첨부 관리 | 파일·한국어 설명 또는 첨부 UUID |
| `POST /api/admin/agendas/[id]/scene` | 3D 장면 버전 저장 | 장면·핫스폿·대체 이미지 저장 이력 |
| `GET/PATCH /api/admin/campaigns/[id]` | 안건 현황 조회·설정·상태 전이 | 기간·명부·본인확인·정족수·상태 변경 사유 |
| `POST /api/admin/campaigns/[id]/follow-up` | 대상 구간별 재안내 | 구간, 채널, 한국어 문구, 중복 발송 간격 |
| `GET /api/admin/reports/csv` | 한국어 집계 CSV | UTF-8 BOM CSV |
| `GET /api/admin/reports/pdf` | 요약 PDF | PDF 바이트 |
| `GET /api/admin/reports/evidence` | 개발 증거 명세 | 버전·해시·제출 시각 JSON |
| `GET /api/admin/fees/templates?type=` | 한국어 관리비 CSV 양식 | 부과 또는 수납·환급 UTF-8 BOM CSV |
| `POST /api/admin/fees/imports` | 관리비 CSV 검증·미리보기 | 기준월, 유형, CSV 파일 → 행 오류·합계 대사 |
| `POST /api/admin/fees/imports/confirm` | 관리비 등록 확정 | 묶음 UUID, 멱등 UUID, 경고 확인 사유 |
| `POST /api/admin/fees/periods/actions` | 기준월 확정·마감·재개 | 기준월, 행위, 한국어 사유, 멱등 UUID |
| `POST /api/admin/fees/adjustments` | 추가 전용 조정 등록 | 기준월, 동·호수, 원 단위 조정액, 사유 |
| `PATCH /api/admin/fees/adjustments` | 조정 승인 | 조정 UUID, 멱등 UUID |
| `PATCH /api/admin/fees/categories/[id]` | 관리비 항목 설정 | 한국어 명칭·설명, 상태, 순서, 대시보드 포함 여부 |
| `GET /api/admin/fees/reports/csv` | 한국어 관리비 CSV 보고서 | 기준월, 보고서 유형, 필터, 사유 |
| `GET /api/admin/fees/reports/pdf` | 한국어 관리비 PDF 보고서 | 기준월, 사유 |
| `POST /api/admin/agendas/[id]/cost-impact` | 안건 비용 영향 계산·저장 | 사업비·재원·배분·부과 기간·주민 설명 |

오류는 `{ "error": "한국어 설명" }` 형식이며 유효성 400, 인증 401, 권한 403/404, 충돌 409, 속도 제한 429를 사용합니다. 운영 확장 API와 서버 작업 목록은 `BACKLOG.md`에 있습니다.

안건·현황 변경 API는 동일 출처와 세션 역할·테넌트를 검사합니다. 콘텐츠 담당자는 초안·자료·장면을, 승인자는 검토·승인·게시를, 단지 관리자는 기간·정족수·운영 상태·재안내를 처리합니다. 진행 중 안건은 일시중지 전까지 핵심 정책을 변경할 수 없고, 주민 OTP와 제출 API도 서버의 진행 상태와 기간을 다시 확인합니다.

관리비 변경 API는 HttpOnly 세션 외에도 동일 출처, 역할, 테넌트, 속도 제한과 멱등 식별자를 검사합니다. 마감된 기준월의 등록·조정은 409로 거부합니다. 원시 CSV 행은 오류 응답이나 로그에 포함하지 않고 동·호수와 금액을 최소화한 한국어 요약만 반환합니다.
