import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { FullResult, Reporter } from "@playwright/test/reporter";

export default class CompletionReporter implements Reporter {
  onEnd(result: FullResult) {
    writeFileSync(resolve(".playwright-result.json"), JSON.stringify({ status: result.status }), "utf8");
  }
}

