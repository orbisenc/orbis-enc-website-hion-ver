import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", ".open-next/**", ".vinext/**", ".wrangler/**", ".firebase/**", ".sites-worktrees/**", "dist/**", "firebase-dist/**", "firebase-marketing-dist/**", "src/components/orbis/dist/**", "node_modules/**", ".corepack/**", "playwright-report/**", "test-results/**"]),
]);
