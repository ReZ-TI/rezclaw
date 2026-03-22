#!/usr/bin/env node
/**
 * 校验 manifest.json 必填字段；可选：检查 healthcheck_urls 是否可访问（需网络）。
 * 用法: node scripts/verify-manifest.mjs [--fetch-health]
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const manifestPath = resolve(root, "manifest.json");

const raw = readFileSync(manifestPath, "utf8");
const m = JSON.parse(raw);

const errors = [];
if (typeof m.content_revision !== "number" || m.content_revision < 1) {
  errors.push("content_revision 必须为正整数");
}
if (!m.updated_at || Number.isNaN(Date.parse(m.updated_at))) {
  errors.push("updated_at 必须为合法 ISO 8601 时间");
}
if (!Array.isArray(m.modules) || m.modules.length === 0) {
  errors.push("modules 必须为非空数组");
}

if (errors.length) {
  console.error("manifest 校验失败:\n", errors.join("\n"));
  process.exit(1);
}

console.log("manifest 校验通过: revision=%s updated_at=%s", m.content_revision, m.updated_at);

const fetchHealth = process.argv.includes("--fetch-health");
const urls = Array.isArray(m.healthcheck_urls) ? m.healthcheck_urls.filter(Boolean) : [];
if (fetchHealth && urls.length) {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      console.log("HEAD %s -> %s", url, res.status);
      if (res.status >= 400) process.exitCode = 1;
    } catch (e) {
      console.error("HEAD 失败:", url, e.message);
      process.exitCode = 1;
    }
  }
}
