/* 生成器不变量测试基线（Node 直跑，无需浏览器）
 * 用法: node tools/test_gen.mjs
 * 覆盖: 卡组织 BIN/长度/Luhn/分组不变量、校验器品牌识别往返、
 *       有效期与 CVV 规则（Amex 4 位 CID）、IBAN MOD97、ABA 校验和、种子 PRNG 确定性。 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const CC = require("../js/cc_core.js");

let passed = 0, failed = 0;
const problems = [];
function check(cond, msg) {
  if (cond) { passed++; return true; }
  failed++; problems.push(msg);
  return false;
}

/* mulberry32 独立实现，用于与 cc_core 内部交叉验证 */
function refMulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 1. 卡号生成不变量（每品牌 2000 张） ---------- */
const PREFIX_CHECK = {
  Visa: (n) => n.startsWith("4"),
  AmericanExpress: (n) => ["34", "37"].includes(n.slice(0, 2)),
  ChinaUnionPay: (n) => n.startsWith("62") && n.length >= 16 && n.length <= 19,
  DinersClub: (n) => ["36", "38", "39"].some((p) => n.startsWith(p)),
  Discover: (n) => ["6011", "65"].some((p) => n.startsWith(p)) || (/^64[4-9]/.test(n)),
  JCB: (n) => { const v = +n.slice(0, 4); return v >= 3528 && v <= 3589; },
  MasterCard: (n) => /^(5[1-5])/.test(n) || (+n.slice(0, 4) >= 2221 && +n.slice(0, 4) <= 2720),
  Maestro: (n) => ["5018", "5020", "5038", "6304", "6390", "6759", "6761", "6762", "6763", "0604", "56", "57", "58"].some((p) => n.startsWith(p)),
  RuPay: (n) => ["81", "82", "508"].some((p) => n.startsWith(p)),
  Mir: (n) => /^220[0-4]/.test(n),
  Troy: (n) => n.startsWith("9792"),
  UATP: (n) => n.startsWith("1"),
  Elo: (n) => /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|506699|5067\d{2}|509\d{3}|627780|636297|636368|650[4-9]\d{2}|651[6-9]\d{2}|655[0-1]\d{2})/.test(n) &&
    !(n.startsWith("5067") && +n.slice(4, 6) > 78),
  Hipercard: (n) => /^(606282|3841)/.test(n),
  Dankort: (n) => n.startsWith("5019")
};
const rng = CC.mulberry32(20261112);
const N = 2000;
for (const brand of Object.keys(CC.RULES)) {
  const lens = new Set();
  for (let i = 0; i < N; i++) {
    const n = CC.makeNumber(brand, rng);
    lens.add(n.length);
    if (!check(CC.luhnValid(n), `${brand} luhn-fail ${n}`)) break;
    if (!check(PREFIX_CHECK[brand](n), `${brand} prefix-fail ${n}`)) break;
    // 分组还原必须等于原始号码（含银联余数尾组）
    const g = CC.groupNumber(n, brand);
    if (!check(g.replace(/\s/g, "") === n, `${brand} group-loss ${n} -> ${g}`)) break;
    // 校验器必须识别回同一品牌
    if (!check(CC.detectBrand(n) === brand, `${brand} detect-mismatch ${n} -> ${CC.detectBrand(n)}`)) break;
  }
  console.log(`${brand.padEnd(16)} lengths=[${[...lens].sort().join(",")}] ${N} ok`);
}

/* ---------- 2. 有效期与 CVV ---------- */
{
  const now = new Date();
  const yy = now.getFullYear();
  let badExp = 0, badCvv = 0;
  for (let i = 0; i < 5000; i++) {
    const m = /^(\d{2})\/(\d{2})$/.exec(CC.makeExpiry(rng, now));
    const mo = +m[1], yr = +m[2];
    if (mo < 1 || mo > 12 || yr - (yy % 100) < 1 || yr - (yy % 100) > 5) badExp++;
    if (!/^\d{4}$/.test(CC.makeCvv("AmericanExpress", rng))) badCvv++;
    if (!/^\d{3}$/.test(CC.makeCvv("Visa", rng))) badCvv++;
  }
  check(badExp === 0, `expiry out-of-range x${badExp}`);
  check(badCvv === 0, `cvv format x${badCvv}`);
  console.log(`expiry(MM/YY, +1~5y) & CVV(Amex 4 / other 3) ok`);
}

/* ---------- 3. IBAN MOD97 ---------- */
for (const cc of Object.keys(CC.IBAN_SPECS)) {
  for (let i = 0; i < 200; i++) {
    const iban = CC.makeIban(cc, rng);
    const spec = CC.IBAN_SPECS[cc];
    if (!check(iban && iban.length === spec[0], `${cc} iban-length ${iban && iban.length}`)) break;
    const body = iban.slice(4) + iban.slice(0, 4);
    let rem = 0;
    for (const ch of body) {
      const v = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
      for (const d of v) rem = (rem * 10 + +d) % 97;
    }
    if (!check(rem === 1, `${cc} iban-mod97-fail ${iban}`)) break;
  }
  console.log(`IBAN ${cc} (len ${CC.IBAN_SPECS[cc][0]}) mod97 ok`);
}

/* ---------- 4. ABA 校验和 ---------- */
{
  let bad = 0;
  for (let i = 0; i < 500; i++) {
    const a = CC.makeAba(rng);
    const d = a.split("").map(Number);
    // 标准公式：3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6+d9) ≡ 0 (mod 10)
    const s = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5] + d[8]);
    if (a.length !== 9 || s % 10 !== 0) bad++;
  }
  check(bad === 0, `ABA checksum x${bad}`);
  console.log("ABA routing checksum ok");
}

/* ---------- 5. 种子 PRNG 确定性 ---------- */
{
  const a = CC.mulberry32(CC.hashSeed("demo42"));
  const b = CC.mulberry32(CC.hashSeed("demo42"));
  const c = CC.mulberry32(CC.hashSeed("demo43"));
  const r = refMulberry32(CC.hashSeed("demo42"));
  const sa = Array.from({ length: 8 }, () => a()).join(",");
  const sb = Array.from({ length: 8 }, () => b()).join(",");
  const sc = Array.from({ length: 8 }, () => c()).join(",");
  const sr = Array.from({ length: 8 }, () => r()).join(",");
  check(sa === sb, "same-seed sequences differ");
  check(sa !== sc, "different seeds collide");
  check(sa === sr, "mulberry32 impl drift vs reference");
  console.log("seed PRNG determinism ok");
}

/* ---------- 6. validate() 完整路径 ---------- */
{
  const okCard = CC.validate("79927398713"); // 经典 Luhn 示例（13 位，Visa 前缀 7? 实际品牌应为 Unknown）
  check(typeof okCard.valid === "boolean" && okCard.brand !== undefined, "validate() shape");
  const known = CC.validate("4111111111111111");
  check(known.valid === true && known.brand === "Visa", `validate 4111... -> ${known.brand}/${known.valid}`);
  const bad = CC.validate("4111111111111112");
  check(bad.valid === false && bad.brand === "Visa", `validate bad-luhn -> ${bad.valid}`);
  const short = CC.validate("123");
  check(short.valid === false, "validate too-short");
  console.log("validate() path ok");
}

/* ---------- 结果 ---------- */
console.log("\n========================================");
console.log(`passed=${passed} failed=${failed}`);
if (failed) { console.log(problems.slice(0, 20).join("\n")); process.exit(1); }
console.log("ALL TESTS PASSED");
