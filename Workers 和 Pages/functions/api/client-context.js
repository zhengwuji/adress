// Cloudflare Pages Functions: GET /api/client-context
// 返回访问者的公网 IP、国家、省份/州、城市与经纬度，用于 IP 区域精准生成
export async function onRequestGet({ request }) {
  const ip = request.headers.get("cf-connecting-ip") || "";
  const cf = request.cf || {};
  return Response.json({
    ok: true,
    ip,
    country: cf.country || "",
    region: cf.region || "",
    regionCode: cf.regionCode || "",
    city: cf.city || "",
    postalCode: cf.postalCode || "",
    latitude: cf.latitude ? parseFloat(cf.latitude) : null,
    longitude: cf.longitude ? parseFloat(cf.longitude) : null
  }, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache"
    }
  });
}

