import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const executables = {
  prisma: path.join(projectRoot, "node_modules", "prisma", "build", "index.js"),
  vinext: path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js")
};

function run(command, args, env = process.env) {
  const result = spawnSync(process.execPath, [executables[command], ...args], {
    env,
    stdio: "inherit",
    shell: false
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("prisma", ["generate"], {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://build:build@127.0.0.1:5432/build",
  NODE_PATH: [
    path.join(projectRoot, "node_modules", ".pnpm", "node_modules"),
    process.env.NODE_PATH
  ].filter(Boolean).join(path.delimiter)
});
run("vinext", ["build"], {
  ...process.env,
  XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME ?? path.join(projectRoot, ".wrangler")
});

const metadataDirectory = path.join(projectRoot, "dist", ".openai");
fs.mkdirSync(metadataDirectory, { recursive: true });
fs.copyFileSync(
  path.join(projectRoot, ".openai", "hosting.json"),
  path.join(metadataDirectory, "hosting.json")
);
