// GeoNames 邮编数据代理：/api/zip/{CC} -> https://download.geonames.org/export/zip/{CC}.zip
// 仅做流式转发并在 CF 边缘缓存，不在服务端存储任何数据（无需 KV / R2）。
const CC_LIST = new Set([
  "US", "CA", "MX", "BR", "AR", "CL", "CO", "GB", "IE", "FR", "BE",
  "NL", "DE", "AT", "CH", "IT", "ES", "PT", "PL", "SE", "NO", "DK",
  "RU", "TR", "CN", "JP", "KR", "MY", "ID", "TH", "PH", "IN",
  "AE", "ZA", "NZ", "AU",
]);

export async function onRequestGet({ params }) {
  const cc = String(params.cc || "").toUpperCase();
  if (!CC_LIST.has(cc)) {
    return Response.json({ ok: false, error: "unsupported country" }, { status: 400 });
  }
  let upstream;
  try {
    upstream = await fetch(`https://download.geonames.org/export/zip/${cc}.zip`, {
      headers: { "User-Agent": "adress-generator/1.0 (+https://github.com/zhengwuji/adress)" },
      cf: { cacheTtl: 21600, cacheEverything: true },
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
      "Cache-Control": "public, max-age=21600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
