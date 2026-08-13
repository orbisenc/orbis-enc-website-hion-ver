import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
function run(command: string, args: string[]) { const result=spawnSync(command,args,{stdio:"inherit",shell:process.platform==="win32"}); if(result.status!==0) process.exit(result.status??1); }
if(!existsSync(".env")) copyFileSync(".env.example",".env");
run("docker",["compose","up","-d"]); run("pnpm",["db:generate"]); run("pnpm",["db:migrate"]); run("pnpm",["db:seed"]);
console.info("HION 개발 환경 준비를 마쳤습니다. `pnpm dev`를 실행하세요.");

