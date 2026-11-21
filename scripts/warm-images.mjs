#!/usr/bin/env node
// Pre-generates resized images so visitors never wait for the first resize.
// Crawls the site's pages, collects every /_next/image URL from their HTML
// and requests each one as AVIF and WebP. Already-cached images return in
// milliseconds, so running this after every deploy only does new work.
//
//   node scripts/warm-images.mjs [baseUrl]   (default https://kalashheritage.com)

const BASE = (process.argv[2] || "https://kalashheritage.com").replace(/\/$/, "");
const MAX_WIDTH = 1200; // wider versions are rare; leave them to on-demand
const CONCURRENCY = 2; // keep CPU free for real visitors
const FORMATS = ["image/avif,image/webp,*/*", "image/webp,*/*"];

const getJson = async (path) => (await fetch(BASE + path)).json();

async function pagesToCrawl() {
  const pages = new Set(["/", "/collections", "/shop", "/about", "/knowledge-hub"]);
  const collections = await getJson("/api/collections").catch(() => []);
  for (const c of collections) {
    pages.add(`/collections/${c.slug}`);
    for (const cat of c.categories || []) pages.add(`/collections/${c.slug}/${cat.slug}`);
  }
  for (let page = 1; ; page++) {
    const res = await getJson(`/api/products?limit=100&page=${page}&sortBy=createdAt`).catch(() => null);
    for (const p of res?.data || []) pages.add(`/shop/${p.slug}`);
    if (!res || page >= res.totalPages) break;
  }
  return [...pages];
}

async function imageUrls(pages) {
  const urls = new Set();
  for (const page of pages) {
    const html = await (await fetch(BASE + page)).text().catch(() => "");
    for (const m of html.matchAll(/\/_next\/image\?url=[^"\s,]+/g)) {
      const url = m[0].replace(/&amp;/g, "&");
      const w = Number(new URL(url, BASE).searchParams.get("w"));
      if (w && w <= MAX_WIDTH) urls.add(url);
    }
  }
  return [...urls];
}

async function main() {
  const started = Date.now();
  const pages = await pagesToCrawl();
  const urls = await imageUrls(pages);
  const jobs = urls.flatMap((url) => FORMATS.map((accept) => ({ url, accept })));

  let done = 0, generated = 0, failed = 0;
  const worker = async () => {
    while (jobs.length) {
      const { url, accept } = jobs.shift();
      const t = Date.now();
      try {
        const res = await fetch(BASE + url, { headers: { Accept: accept } });
        await res.arrayBuffer();
        if (!res.ok) failed++;
        else if (Date.now() - t > 150) generated++;
      } catch {
        failed++;
      }
      done++;
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(
    `warm-images: ${pages.length} pages, ${urls.length} images, ${done} requests, ` +
      `~${generated} newly generated, ${failed} failed, ${Math.round((Date.now() - started) / 1000)}s`
  );
}

main().catch((err) => {
  console.error("warm-images failed:", err);
  process.exit(1);
});
