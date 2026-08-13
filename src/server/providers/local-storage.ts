import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { sha256 } from "@/lib/security/hash";
import type { StorageProvider, StoragePutInput } from "./types";

export class LocalStorageProvider implements StorageProvider {
  private readonly root = process.env.NODE_ENV === "production" ? resolve(tmpdir(), "hion-storage") : resolve(process.cwd(), "storage", "dev");
  private safePath(key: string) {
    const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
    const target = resolve(this.root, normalized);
    if (!target.startsWith(`${this.root}${sep}`) || normalized.includes("..")) throw new Error("허용되지 않은 저장 경로입니다.");
    return target;
  }
  async put(input: StoragePutInput) {
    const target = this.safePath(input.key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, input.data);
    return { key: input.key, size: input.data.byteLength, mimeType: input.mimeType, sha256: sha256(input.data) };
  }
  async get(key: string) { return readFile(this.safePath(key)); }
  async getSignedUrl(key: string) { await readFile(this.safePath(key)); return `/api/assets/${encodeURIComponent(key)}`; }
  async delete(key: string) { await rm(this.safePath(key), { force: true }); }
}
