import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd());
const files = (await fs.readdir(root)).filter((f) => f.endsWith(".html"));

const canonicalMap = {
  "index.html": "https://poisonwellrecords.netlify.app/",
  "ventura-punk-vinyl.html": "https://poisonwellrecords.netlify.app/ventura-punk-vinyl",
  "apparel.html": "https://poisonwellrecords.netlify.app/apparel",
  "ventura-punk-record-store-online.html": "https://poisonwellrecords.netlify.app/ventura-punk-record-store-online",
  "805-punk-bands.html": "https://poisonwellrecords.netlify.app/805-punk-bands",
  "about-poison-well-records.html": "https://poisonwellrecords.netlify.app/about-poison-well-records",
  "contact-wholesale.html": "https://poisonwellrecords.netlify.app/contact-wholesale",
  "faq.html": "https://poisonwellrecords.netlify.app/faq",
  "press.html": "https://poisonwellrecords.netlify.app/press",
  "rarities.html": "https://poisonwellrecords.netlify.app/rarities",
  "dr-know-live-cbgb-1989-ventura-hardcore.html": "https://poisonwellrecords.netlify.app/dr-know-live-cbgb-1989-ventura-hardcore",
  "music-videos.html": "https://poisonwellrecords.netlify.app/music-videos",
  "digital-music-hub.html": "https://poisonwellrecords.netlify.app/digital-music-hub",
  "privacy-policy.html": "https://poisonwellrecords.netlify.app/privacy-policy",
  "805-punk-shows-events.html": "https://poisonwellrecords.netlify.app/805-punk-shows-events",
  "thank-you.html": "https://poisonwellrecords.netlify.app/thank-you"
};

for (const file of files) {
  const p = path.join(root, file);
  let html = await fs.readFile(p, "utf8");

  // Restore canonical links that were replaced with "#".
  if (canonicalMap[file]) {
    html = html.replace(
      /<link\s+rel=(["'])canonical\1\s+href=(["'])#\2\s*\/?>/i,
      `<link rel="canonical" href="${canonicalMap[file]}" />`
    );
  }

  // Restore Google Fonts preconnect links if they were replaced.
  html = html.replace(
    /<link\s+rel=(["'])preconnect\1\s+href=(["'])#\2\s*\/?>/gi,
    `<link rel="preconnect" href="https://fonts.googleapis.com">`
  );
  html = html.replace(
    /<link\s+rel=(["'])preconnect\1\s+href=(["'])#\2\s+crossorigin\s*\/?>/gi,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
  );

  // Restore nav back-to-top links.
  html = html.replace(/(<a[^>]*class=(["'])nav-back-to-top\2[^>]*href=)(["'])#\3/gi, `$1"${
    "#top"
  }"`);

  // Ensure #top anchor exists by adding id to body if missing.
  const hasTopId = /\sid=(["'])top\1/i.test(html);
  if (!hasTopId) {
    html = html.replace(/<body(\s[^>]*)?>/i, (m, attrs = "") => {
      if (/id=/i.test(attrs)) return m;
      return `<body${attrs} id="top">`;
    });
  }

  // Remove invalid external Canela font stylesheet link in newplan page.
  if (file === "newplan.html") {
    html = html.replace(
      /<link\s+href=(["'])#\1\s+rel=(["'])stylesheet\2\s*\/?>/i,
      ""
    );
  }

  await fs.writeFile(p, html, "utf8");
}

console.log(`Repaired technical links in ${files.length} HTML files.`);
