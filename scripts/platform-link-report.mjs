import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd());
const target = path.join(root, "digital-music-hub.html");
const html = await fs.readFile(target, "utf8");

const cardRegex =
  /<article class="hub-card"[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<p class="album-title">([\s\S]*?)<\/p>[\s\S]*?<div class="hub-links">([\s\S]*?)<\/div>[\s\S]*?<\/article>/gim;
const hrefRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gim;

const releases = [];
let m;
while ((m = cardRegex.exec(html))) {
  const artist = m[1].replace(/<[^>]+>/g, "").trim();
  const release = m[2].replace(/<[^>]+>/g, "").trim();
  const linksHtml = m[3];
  const links = [];
  let lm;
  while ((lm = hrefRegex.exec(linksHtml))) {
    links.push({
      url: lm[1].trim(),
      label: lm[2].replace(/<[^>]+>/g, "").trim()
    });
  }
  releases.push({ artist, release, links });
}

async function validate(url) {
  async function req(method) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    try {
      return await fetch(url, {
        method,
        redirect: "follow",
        signal: ctl.signal,
        headers: { "user-agent": "PoisonWellPlatformReport/1.0" }
      });
    } finally {
      clearTimeout(t);
    }
  }

  try {
    let res = await req("HEAD");
    if (res.status === 405 || res.status === 501) res = await req("GET");
    return {
      ok: res.status >= 200 && res.status < 400,
      status: res.status
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

const rows = [];
for (const r of releases) {
  const normalizedQuery = `${r.artist} ${r.release}`
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const query = encodeURIComponent(normalizedQuery);
  const generated = [
    { label: "Amazon Music", url: `https://music.amazon.com/search/${query}` },
    { label: "YouTube Music", url: `https://music.youtube.com/search?q=${query}` },
    { label: "Deezer", url: `https://www.deezer.com/search/${query}` }
  ];

  const dedup = new Map();
  for (const l of r.links) dedup.set(l.url, { ...l, origin: "static" });
  for (const l of generated) {
    if (!dedup.has(l.url)) dedup.set(l.url, { ...l, origin: "generated" });
  }

  for (const link of dedup.values()) {
    const { ok, status } = await validate(link.url);
    const lowerLabel = link.label.toLowerCase();
    const linkType = lowerLabel.includes("search") ? "search" : "direct";
    rows.push({
      artist: r.artist,
      release: r.release,
      platform_label: link.label,
      link_type: link.origin === "generated" ? "generated_search" : linkType,
      url: link.url,
      http_status: status,
      validated: ok ? "yes" : "no"
    });
  }
}

const header = [
  "artist",
  "release",
  "platform_label",
  "link_type",
  "url",
  "http_status",
  "validated"
];
const csv = [
  header.join(","),
  ...rows.map((r) =>
    [
      r.artist,
      r.release,
      r.platform_label,
      r.link_type,
      r.url,
      String(r.http_status),
      r.validated
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  )
].join("\n");

await fs.writeFile(path.join(root, "docs", "platform-link-validation.csv"), csv, "utf8");

const summary = {
  releases: releases.length,
  links_checked: rows.length,
  valid_links: rows.filter((r) => r.validated === "yes").length,
  invalid_links: rows.filter((r) => r.validated === "no").length
};

await fs.writeFile(
  path.join(root, "docs", "platform-link-validation-summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8"
);

console.log(JSON.stringify(summary, null, 2));
