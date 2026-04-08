import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd());
const args = new Set(process.argv.slice(2));
const shouldFix = args.has("--fix");

const htmlFiles = (await fs.readdir(root))
  .filter((name) => name.endsWith(".html"))
  .map((name) => path.join(root, name));

const anchorRegex = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1[^>]*>/gim;

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function extractIds(html) {
  const ids = new Set();
  const idRegex = /\sid\s*=\s*(["'])(.*?)\1/gim;
  let m;
  while ((m = idRegex.exec(html))) ids.add(m[2]);
  return ids;
}

const fileCache = new Map();
async function getFileInfo(filePath) {
  if (fileCache.has(filePath)) return fileCache.get(filePath);
  const html = await fs.readFile(filePath, "utf8");
  const info = { html, ids: extractIds(html) };
  fileCache.set(filePath, info);
  return info;
}

const externalCache = new Map();
async function validateExternal(url) {
  if (externalCache.has(url)) return externalCache.get(url);

  async function tryFetch(method) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "user-agent": "PoisonWellLinkAudit/1.0"
        }
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  }

  let status = null;
  let ok = false;
  let reason = "unknown";
  try {
    let res = await tryFetch("HEAD");
    status = res.status;
    if (status === 405 || status === 501) {
      res = await tryFetch("GET");
      status = res.status;
    }
    if ((status >= 200 && status < 400) || status === 401 || status === 403 || status === 429) {
      ok = true;
      reason = `status_${status}`;
    } else if (status === 404 || status === 410) {
      ok = false;
      reason = `status_${status}`;
    } else {
      ok = false;
      reason = `status_${status}`;
    }
  } catch (err) {
    ok = false;
    reason = err?.name === "AbortError" ? "timeout" : "network_error";
  }

  const result = { ok, status, reason };
  externalCache.set(url, result);
  return result;
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function validateHref(filePath, href) {
  if (!href || href.trim() === "") return { ok: false, reason: "empty_href" };
  const value = href.trim();

  if (value.startsWith("javascript:")) return { ok: false, reason: "javascript_link" };
  if (value.startsWith("tel:")) {
    const tel = value.slice(4).trim();
    return { ok: /^[+0-9()\-\s.]{5,}$/.test(tel), reason: "tel" };
  }
  if (value.startsWith("mailto:")) {
    const addr = value.slice(7).split("?")[0];
    return { ok: isEmail(addr), reason: "mailto" };
  }
  if (value === "#") return { ok: false, reason: "hash_only" };

  if (value.startsWith("#")) {
    const id = value.slice(1);
    const { ids } = await getFileInfo(filePath);
    return { ok: ids.has(id), reason: ids.has(id) ? "in_page_anchor" : "missing_anchor" };
  }

  if (/^https?:\/\//i.test(value)) {
    return validateExternal(value);
  }

  // Internal relative/absolute path
  const [rawPath, hash] = value.split("#");
  const fromDir = path.dirname(filePath);
  const normalized = rawPath.startsWith("/")
    ? path.join(root, rawPath.slice(1))
    : path.resolve(fromDir, rawPath);

  let targetPath = normalized;
  let exists = await fileExists(targetPath);

  if (!exists && path.extname(targetPath) === "") {
    const withHtml = `${targetPath}.html`;
    if (await fileExists(withHtml)) {
      targetPath = withHtml;
      exists = true;
    }
  }

  if (!exists) return { ok: false, reason: "missing_internal_target" };

  if (hash) {
    const { ids } = await getFileInfo(targetPath);
    if (!ids.has(hash)) return { ok: false, reason: "missing_target_anchor" };
  }

  return { ok: true, reason: "internal_ok" };
}

const report = [];
let totalLinks = 0;
let invalidCount = 0;

for (const filePath of htmlFiles) {
  const info = await getFileInfo(filePath);
  const html = info.html;
  const invalids = [];
  const replacements = [];

  let m;
  while ((m = anchorRegex.exec(html))) {
    const full = m[0];
    const quote = m[1];
    const href = m[2];
    const start = m.index;
    totalLinks += 1;
    const result = await validateHref(filePath, href);
    if (!result.ok) {
      invalidCount += 1;
      invalids.push({
        href,
        reason: result.reason,
        status: result.status ?? null
      });
      const attrStart = start + full.indexOf(href);
      const attrEnd = attrStart + href.length;
      replacements.push({ start: attrStart, end: attrEnd, replaceWith: "#" });
    }
  }

  if (shouldFix && replacements.length > 0) {
    let out = "";
    let cursor = 0;
    for (const rep of replacements.sort((a, b) => a.start - b.start)) {
      out += html.slice(cursor, rep.start);
      out += rep.replaceWith;
      cursor = rep.end;
    }
    out += html.slice(cursor);
    await fs.writeFile(filePath, out, "utf8");
  }

  report.push({
    file: path.basename(filePath),
    invalid: invalids
  });
}

const summary = {
  checked_files: htmlFiles.length,
  total_links: totalLinks,
  invalid_links: invalidCount,
  fixed: shouldFix
};

const output = { summary, report };
await fs.writeFile(path.join(root, "link-audit-report.json"), JSON.stringify(output, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
