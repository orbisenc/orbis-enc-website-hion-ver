import { resetDemoStore } from "../src/server/demo/store";
import { resetAgendaCampaignDemoStore } from "../src/server/demo/agenda-campaign-store";
import { resetFeeDemoStore } from "../src/server/demo/fee-store";
resetDemoStore();
resetAgendaCampaignDemoStore();
resetFeeDemoStore();
console.info("메모리 시연 응답·안건·현황·관리비 상태를 초기화했습니다. 데이터베이스 시드는 `pnpm db:seed`로 다시 적용하세요.");
