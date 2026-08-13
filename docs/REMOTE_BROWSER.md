# 격리형 원격 웹 브라우저

## 목적

`/web-browser`는 iframe 삽입을 거부하는 외부 사이트를 직접 iframe으로 불러오지 않습니다. 별도 Node.js 게이트웨이에서 Chromium을 실행하고, 화면을 JPEG로 전달하며 사용자의 포인터·스크롤·키보드 입력을 원격 브라우저에 적용합니다.

```text
3D EXPERIENCE iframe
  → HION /web-browser
    → HION /api/web-browser/*
      → 원격 브라우저 게이트웨이
        → 격리된 Chromium 컨텍스트
          → 공개 웹사이트
```

화면은 Chrome DevTools Protocol의 실시간 screencast 이벤트를 전용 바이너리 WebSocket으로 직접 전달합니다. 입력도 별도의 WebSocket 제어 채널로 보내므로 영상 트래픽과 입력이 서로를 막지 않습니다. 수신된 프레임은 React 렌더링을 거치지 않고 화면 요소에 바로 반영합니다. WebSocket을 차단하는 환경에서는 MJPEG 화면과 HTTP 입력 경로로 자동 대체됩니다.

원격 Chrome 해상도는 접속한 iframe의 실제 화면 영역에 맞춰 최대 1440×900 범위에서 자동 계산합니다. 고정 비율 축소나 불필요한 여백을 피하고 JPEG 품질 88을 사용해 텍스트 가독성과 전송 속도를 함께 유지합니다.

초기 화면의 바로가기는 지원 사이트 목록이 아니라 사용 예시입니다. 도메인 허용 목록은 사용하지 않으며 공개 HTTP/HTTPS 주소를 직접 입력할 수 있습니다. 한글 입력은 조합 중간 상태와 확정을 Chrome CDP IME 명령으로 전달합니다.

## 로컬 실행

두 터미널에서 각각 실행합니다.

```powershell
pnpm remote-browser
pnpm dev
```

브라우저에서 `http://localhost:3000/web-browser`를 엽니다. 주소를 미리 지정하려면 `/web-browser?url=https%3A%2F%2Fwww.google.com` 형식을 사용할 수 있습니다.

Playwright가 내려받은 Chromium이 없으면 기본적으로 설치된 Chrome을 사용합니다. 다른 채널을 사용하려면 `REMOTE_BROWSER_CHANNEL`을 설정하고, 외부 Browserless 계열 CDP 서비스를 사용하려면 `REMOTE_BROWSER_CDP_URL`을 설정합니다.

## 운영 설정

- 앱에는 `ENABLE_REMOTE_BROWSER=true`를 설정합니다.
- 앱의 `REMOTE_BROWSER_GATEWAY_URL`에는 게이트웨이의 HTTPS 내부 주소를 설정합니다.
- 앱과 게이트웨이에 동일한 긴 무작위 `REMOTE_BROWSER_GATEWAY_TOKEN`을 설정합니다.
- 외부 리버스 프록시는 `/api/web-browser/control/:sessionId`와 `/api/web-browser/frames/:sessionId`의 WebSocket 업그레이드를 게이트웨이의 같은 경로로 전달해야 합니다. 이 경로가 막히면 MJPEG·HTTP 방식으로 자동 대체되어 지연이 늘어납니다.
- 게이트웨이를 외부 인터페이스에 바인딩하면 토큰이 없을 때 시작을 거부합니다.
- 게이트웨이는 컨테이너 또는 전용 VM에서 비권한 사용자로 실행하고, 메타데이터 주소와 사내망으로 향하는 아웃바운드 트래픽도 방화벽에서 차단합니다.
- 동시 세션 수와 유휴 만료 시간은 `REMOTE_BROWSER_MAX_SESSIONS`, `REMOTE_BROWSER_IDLE_TIMEOUT_MS`로 제한합니다.

## 보안 경계

- HTTP/HTTPS 공개 주소만 첫 탐색 대상으로 허용합니다.
- 모든 하위 리소스와 리디렉션에 DNS 검사를 다시 적용해 사설·루프백·링크 로컬 주소를 차단합니다.
- 기본 허용 포트는 80과 443이며 `REMOTE_BROWSER_ALLOWED_PORTS`로 좁게 확장할 수 있습니다.
- 세션마다 별도 브라우저 컨텍스트와 쿠키 저장소를 사용하고 다운로드와 서비스 워커를 차단합니다.
- 세션 ID는 임의 UUID이며 유휴 세션은 자동 폐기합니다.
- 실제 로그인 비밀번호, 쿠키, 페이지 내용은 애플리케이션 로그에 남기지 않습니다.

애플리케이션 검사는 네트워크 방화벽을 대체하지 않습니다. DNS 리바인딩과 브라우저 취약점의 영향을 줄이려면 게이트웨이 컨테이너가 내부망에 라우팅되지 않도록 별도 네트워크에 배치해야 합니다.

## 현재 제한

- CAPTCHA, WebAuthn, DRM, 카메라·마이크, 파일 다운로드는 동작하지 않거나 제한됩니다.
- 브라우저 서버와 대상 웹사이트 간 네트워크 지연은 남아 있으며, 영상·고속 애니메이션은 로컬 브라우저보다 부드럽지 않을 수 있습니다.
- 브라우저의 로컬 클립보드와 원격 클립보드는 공유하지 않습니다. 붙여넣은 텍스트만 원격 입력으로 전달합니다.
- Cloudflare Worker 자체에서는 Chromium을 실행하지 않습니다. 게이트웨이는 반드시 별도 Node.js 실행 환경에 둡니다.
