// 美国人口普查局 ZCTA Gazetteer 代理（美国海外领地城市坐标用）。
// 固定 URL 白名单式转发，流式透传 + 边缘缓存，不做任何存储。
const GAZ_URL =
  "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_zcta_national.zip";

export async function onRequestGet() {
  let upstream;
  try {
    upstream = await fetch(GAZ_URL, {
      headers: { "User-Agent": "adress-generator/1.0 (+https://github.com/zhengwuji/adress)" },
      cf: { cacheTtl: 2592000, cacheEverything: true },
    });
  } catch (e) {
    return Response.json({ ok: false, error: "upstream fetch failed" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return Response.json({ ok: false, error: "upstream " + upstream.status }, { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/zip",
      "Cache-Control": "public, max-age=2592000",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
