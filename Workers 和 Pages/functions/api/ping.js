// 探测更新服务可用性（Cloudflare Pages Functions 版）
export async function onRequestGet() {
  return Response.json({ ok: true, updater: true, cf: true });
}
