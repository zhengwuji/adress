/* 信用卡 / 银行数据纯逻辑模块（app.js 与 tools/test_gen.mjs 共用）
 * 内容：mulberry32 种子 PRNG、Luhn 校验、卡组织 BIN 规则、号段识别（校验器）、
 *       IBAN(MOD97)/ABA/IFSC/BSB/CNAPS 等银行账号生成、SWIFT/BIC 生成。
 * 所有函数不触碰 DOM；随机性全部由调用方注入的 rng（() => [0,1)）驱动，
 * 便于 seed 可复现生成与 Node 环境单测。 */
(function (global) {
  "use strict";

  /* ================= 种子 PRNG ================= */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 字符串/任意值 → 32 位种子（xmur3 简化版） */
  function hashSeed(v) {
    const s = String(v);
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }

  const ri = (rng, a, b) => Math.floor(rng() * (b - a + 1)) + a;
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const digits = (rng, n) => { let s = ""; for (let i = 0; i < n; i++) s += ri(rng, 0, 9); return s; };

  /* ================= Luhn ================= */
  function luhnValid(s) {
    let sum = 0, dbl = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = +s[i];
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  /* 对前缀补一位校验位，返回完整合法卡号 */
  function luhnComplete(prefix) {
    let sum = 0, dbl = true;
    for (let i = prefix.length - 1; i >= 0; i--) {
      let d = +prefix[i];
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return prefix + ((10 - (sum % 10)) % 10);
  }

  /* ================= 卡组织规则 =================
   * bin:  字符串或 (rng) => 字符串
   * len:  数字或 (rng) => 数字（银联 16-19 位按张随机）
   * 号段为各组织当前真实有效的 IIN/BIN 段（2024-2026 常见段全集） */
  const RULES = {
    /* Visa：全 4 号段，但避开 Elo 共用 BIN（401178/401179/431274/438935/451416/457393/457631/457632） */
    Visa:            {
      bin: (rng) => {
        const avoid = ["01178", "01179", "31274", "38935", "51416", "57393", "57631", "57632"];
        let s5;
        do { s5 = String(ri(rng, 0, 99999)).padStart(5, "0"); } while (avoid.includes(s5));
        return "4" + s5;
      },
      len: 16
    },
    AmericanExpress: { bin: (rng) => pick(rng, ["34", "37"]), len: 15 },
    /* 银联：62 全段 16-19 位，避开 Elo 的 627780 */
    ChinaUnionPay:   {
      bin: (rng) => {
        let s4;
        do { s4 = String(ri(rng, 0, 9999)).padStart(4, "0"); } while (s4 === "7780");
        return "62" + s4;
      },
      len: (rng) => ri(rng, 16, 19)
    },
    DinersClub:      { bin: (rng) => pick(rng, ["36", "38", "39"]), len: 14 },
    /* Discover：6011 / 644-649 / 65，但 65 段避开 Elo 共用子段（6504-6509、6516-6519、6550-6551） */
    Discover:        {
      bin: (rng) => {
        const bad = new Set(["04", "05", "06", "07", "08", "09", "16", "17", "18", "19", "50", "51"]);
        let s2;
        do { s2 = String(ri(rng, 0, 99)).padStart(2, "0"); } while (bad.has(s2));
        return pick(rng, ["6011", "65" + s2, String(ri(rng, 644, 649))]);
      },
      len: 16
    },
    JCB:             { bin: (rng) => String(ri(rng, 3528, 3589)), len: 16 },
    MasterCard:      { bin: (rng) => pick(rng, [String(ri(rng, 51, 55)), String(ri(rng, 2221, 2720))]), len: 16 },
    Maestro:         { bin: (rng) => pick(rng, ["5018", "5020", "5038", "6304", "6390", "6759", "6761", "6762", "6763", "0604", "56", "57", "58"]), len: 16 },
    RuPay:           { bin: (rng) => pick(rng, ["81", "82", "508"]), len: 16 },
    Mir:             { bin: (rng) => pick(rng, ["2200", "2201", "2202", "2203", "2204"]), len: 16 },
    Troy:            { bin: "9792", len: 16 },
    UATP:            { bin: "1", len: 15 },
    /* 巴西主流：Elo 真实 6 位 BIN（含 506699-506778 / 509000-509999 / 6504-6551 段） */
    Elo:             {
      bin: (rng) => pick(rng, [
        "401178", "401179", "431274", "438935", "451416", "457393", "457631", "457632", "504175",
        "506699", "5067" + String(ri(rng, 0, 78)).padStart(2, "0"),
        "509" + String(ri(rng, 0, 999)).padStart(3, "0"),
        "627780", "636297", "636368",
        "650" + ri(rng, 4, 9) + String(ri(rng, 0, 9)),
        "651" + ri(rng, 6, 9) + String(ri(rng, 0, 9)),
        "655" + ri(rng, 0, 1) + String(ri(rng, 0, 9))
      ]),
      len: 16
    },
    /* 巴西 Hipercard：3841 / 606282 */
    Hipercard:       { bin: (rng) => pick(rng, ["3841", "606282"]), len: 16 },
    /* 丹麦 Dankort：5019 */
    Dankort:         { bin: "5019", len: 16 }
  };

  /* 展示名（内部键 → 用户可见名） */
  const DISPLAY = {
    Visa: "Visa", MasterCard: "MasterCard", AmericanExpress: "American Express",
    ChinaUnionPay: "China UnionPay", DinersClub: "Diners Club International",
    Discover: "Discover", JCB: "JCB", Maestro: "Maestro",
    RuPay: "RuPay", Mir: "Mir", Troy: "Troy", UATP: "UATP",
    Elo: "Elo", Hipercard: "Hipercard", Dankort: "Dankort"
  };

  /* 分组排版（Amex 4-4-4-3 / Diners 4-4-4-2，其余 4-4-4-4 + 余数尾组） */
  const GROUPS = { AmericanExpress: [4, 4, 4, 3], DinersClub: [4, 4, 4, 2] };
  function groupNumber(num, brand) {
    const gs = GROUPS[brand] || [4, 4, 4, 4];
    const out = [];
    let pos = 0;
    for (const g of gs) {
      if (pos + g <= num.length) { out.push(num.slice(pos, pos + g)); pos += g; }
    }
    if (pos < num.length) out.push(num.slice(pos));
    return out.join(" ");
  }

  /* 按规则生成一张卡号（BIN + 随机位 + Luhn 校验位） */
  function makeNumber(brand, rng) {
    const rule = RULES[brand];
    if (!rule) throw new Error("Unsupported card type: " + brand);
    const bin = typeof rule.bin === "function" ? rule.bin(rng) : rule.bin;
    const len = typeof rule.len === "function" ? rule.len(rng) : rule.len;
    let num = bin;
    while (num.length < len - 1) num += String(ri(rng, 0, 9));
    for (let d = 0; d <= 9; d++) if (luhnValid(num + d)) { num += String(d); break; }
    if (num.length !== len) throw new Error("Generated card number does not match the required length");
    return num;
  }

  /* 有效期：1-12 月 / 明年起 1-5 年，MM/YY */
  function makeExpiry(rng, now) {
    const base = now || new Date();
    return String(ri(rng, 1, 12)).padStart(2, "0") + "/" + String(base.getFullYear() + ri(rng, 1, 5)).slice(2);
  }

  /* CVV：Amex 4 位 CID，其余 3 位 */
  function makeCvv(brand, rng) {
    return brand === "AmericanExpress" ? String(ri(rng, 1000, 9999)) : String(ri(rng, 100, 999));
  }

  /* ================= 国家 → 常见卡组织 ================= */
  const COUNTRY_BRANDS = {
    US: ["Visa", "MasterCard", "AmericanExpress", "Discover"],
    CA: ["Visa", "MasterCard", "AmericanExpress"],
    MX: ["Visa", "MasterCard"],
    BR: ["Elo", "Hipercard", "Visa", "MasterCard"],
    AR: ["Visa", "MasterCard"],
    CL: ["Visa", "MasterCard"],
    CO: ["Visa", "MasterCard"],
    GB: ["Visa", "MasterCard", "Maestro", "AmericanExpress"],
    IE: ["Visa", "MasterCard"],
    DE: ["Visa", "MasterCard", "Maestro"],
    FR: ["Visa", "MasterCard", "Maestro"],
    ES: ["Visa", "MasterCard", "Maestro"],
    IT: ["Visa", "MasterCard", "Maestro"],
    NL: ["Visa", "MasterCard", "Maestro"],
    BE: ["Visa", "MasterCard", "Maestro"],
    AT: ["Visa", "MasterCard", "Maestro"],
    CH: ["Visa", "MasterCard"],
    PT: ["Visa", "MasterCard", "Maestro"],
    PL: ["Visa", "MasterCard", "Maestro"],
    SE: ["Visa", "MasterCard", "Maestro"],
    NO: ["Visa", "MasterCard"],
    DK: ["Dankort", "Visa", "MasterCard", "Maestro"],
    RU: ["Mir", "Visa", "MasterCard"],
    TR: ["Troy", "Visa", "MasterCard"],
    CN: ["ChinaUnionPay", "Visa", "MasterCard"],
    JP: ["JCB", "Visa", "MasterCard"],
    KR: ["Visa", "MasterCard"],
    IN: ["RuPay", "Visa", "MasterCard"],
    AE: ["Visa", "MasterCard"],
    ID: ["Visa", "MasterCard"],
    MY: ["Visa", "MasterCard"],
    TH: ["Visa", "MasterCard"],
    PH: ["Visa", "MasterCard"],
    AU: ["Visa", "MasterCard", "AmericanExpress"],
    NZ: ["Visa", "MasterCard"],
    ZA: ["Visa", "MasterCard"]
  };
  function countryBrands(cc) {
    return COUNTRY_BRANDS[cc] || ["Visa", "MasterCard"];
  }

  /* ================= 校验器：号段识别 =================
   * 顺序即优先级（号段更具体的在前），与 makeNumber 的 BIN 完全兼容：
   * Elo/Hipercard 的 6 位/4 位专属号段先于银联/Diners/Discover 检查，
   * Dankort(5019) 先于 Maestro 的 50 段，RuPay(508) 先于 Maestro 的 5 段。 */
  const VAL_RULES = [
    ["Elo", /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|506699|5067[0-6]\d|50677[0-8]|509\d{3}|627780|636297|636368|650[4-9]\d{2}|651[6-9]\d{2}|655[0-1]\d{2})/, [16]],
    ["Hipercard", /^(606282|3841)/, [16, 19]],
    ["Dankort", /^5019/, [16]],
    ["AmericanExpress", /^(34|37)/, [15]],
    ["ChinaUnionPay", /^62/, [16, 17, 18, 19]],
    ["DinersClub", /^(36|38|39)/, [14, 16, 19]],
    ["Discover", /^(6011|65|64[4-9])/, [16, 19]],
    ["JCB", /^35[2-8]/, [16, 17, 18, 19]],
    ["MasterCard", /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/, [16]],
    ["RuPay", /^(81|82|508)/, [16]],
    ["Mir", /^220[0-4]/, [16]],
    ["Troy", /^9792/, [16]],
    ["Maestro", /^(5018|5020|5038|5893|6304|6390|6759|676[123]|0604|5[6-8])/, [12, 13, 14, 15, 16, 17, 18, 19]],
    ["Visa", /^4/, [13, 16, 19]],
    ["UATP", /^1/, [15]]
  ];
  function detectBrand(digitsStr) {
    for (const [brand, re, lens] of VAL_RULES) {
      if (re.test(digitsStr) && lens.includes(digitsStr.length)) return brand;
    }
    return "Unknown";
  }

  /* 完整校验：Luhn + 品牌识别 */
  function validate(numStr) {
    const digits = String(numStr || "").replace(/\D/g, "");
    if (digits.length < 12 || digits.length > 19) return { digits, valid: false, brand: "Unknown", reason: "length" };
    const brand = detectBrand(digits);
    const valid = luhnValid(digits);
    return { digits, valid, brand, formatted: groupNumber(digits, brand === "Unknown" ? "" : brand) };
  }

  /* ================= 银行账号生成 =================
   * IBAN 国家走真实 MOD97 校验位；非 IBAN 国家输出当地常用格式 */
  const IBAN_SPECS = {
    /* cc: [总长度, BBAN 段定义]，段: n=数字, a=大写字母, c=字母数字 */
    GB: [22, [["a", 4], ["n", 6], ["n", 8]]],
    IE: [22, [["a", 4], ["n", 6], ["n", 8]]],
    DE: [22, [["n", 8], ["n", 10]]],
    FR: [27, [["n", 5], ["n", 5], ["n", 11], ["n", 2]]],
    ES: [24, [["n", 4], ["n", 4], ["n", 2], ["n", 10]]],
    IT: [27, [["a", 1], ["n", 5], ["n", 5], ["c", 12]]],
    NL: [18, [["a", 4], ["n", 10]]],
    BE: [16, [["n", 3], ["n", 7], ["n", 2]]],
    AT: [20, [["n", 5], ["n", 11]]],
    CH: [21, [["n", 5], ["c", 12]]],
    PT: [25, [["n", 4], ["n", 4], ["c", 11], ["n", 2]]],
    PL: [28, [["n", 24]]],
    SE: [24, [["n", 3], ["n", 19]]],
    NO: [15, [["n", 4], ["n", 6], ["n", 1]]],
    DK: [18, [["n", 4], ["n", 10]]],
    TR: [26, [["n", 5], ["a", 1], ["c", 16]]]
  };

  function ibanCheckDigits(cc, bban) {
    const s = bban + cc + "00";
    let rem = 0;
    for (const ch of s) {
      const v = (ch >= "A" && ch <= "Z") ? String(ch.charCodeAt(0) - 55) : ch;
      for (const d of v) rem = (rem * 10 + +d) % 97;
    }
    return String(98 - rem).padStart(2, "0");
  }

  function makeIban(cc, rng) {
    const spec = IBAN_SPECS[cc];
    if (!spec) return null;
    const [total, parts] = spec;
    const bbanLen = total - 4;
    let bban = "";
    for (const [kind, n] of parts) {
      const pool = kind === "n" ? "0123456789" : kind === "a" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (let i = 0; i < n; i++) bban += pool[Math.floor(rng() * pool.length)];
    }
    // 长度兜底（保证 BBAN 段之和与总长一致）
    while (bban.length < bbanLen) bban += "0";
    if (bban.length > bbanLen) bban = bban.slice(0, bbanLen);
    return cc + ibanCheckDigits(cc, bban) + bban;
  }

  /* 美国 ABA 路由号：3(d1+d4+d7) + 7(d2+d5+d8) + (d3+d6) 校验 */
  function makeAba(rng) {
    const d = [];
    for (let i = 0; i < 8; i++) d.push(ri(rng, 0, 9));
    const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + (d[2] + d[5]);
    const check = (10 - (sum % 10)) % 10;
    return d.join("") + check;
  }

  /* 加拿大 transit + institution */
  function makeCaAccount(rng) {
    const inst = pick(rng, ["001", "002", "003", "004", "006", "010", "016", "020", "030", "032", "039", "040", "080"]);
    return digits(rng, 5) + "-" + inst;
  }

  /* 印度 IFSC：4 字母 + 0 + 6 数字 */
  function makeIfsc(rng) {
    const banks = ["HDFC", "ICIC", "SBIN", "PUNB", "UTIB", "KKBK", "YESB", "IDIB", "BARB", "CNRB"];
    return pick(rng, banks) + "0" + digits(rng, 6);
  }

  /* 澳洲 BSB + 账号 */
  function makeBsb(rng) {
    return digits(rng, 3) + "-" + digits(rng, 3) + " " + digits(rng, 8);
  }

  /* 新西兰 bank-branch-account-suffix */
  function makeNzAccount(rng) {
    return String(ri(rng, 1, 30)).padStart(2, "0") + "-" + digits(rng, 4) + "-" + digits(rng, 7) + "-" + String(ri(rng, 0, 999)).padStart(3, "0");
  }

  /* 日本 bank-branch-account */
  function makeJpAccount(rng) {
    return digits(rng, 4) + "-" + digits(rng, 3) + "-" + digits(rng, 7);
  }

  /* 中国 CNAPS 12 位联行号 */
  function makeCnaps(rng) {
    return digits(rng, 12);
  }

  /* 巴西 银行-网点-账号 */
  function makeBrAccount(rng) {
    return digits(rng, 3) + "-" + digits(rng, 5) + "-" + digits(rng, 8) + "-" + String(ri(rng, 0, 9));
  }

  /* 墨西哥 CLABE 18 位 */
  function makeClabe(rng) { return digits(rng, 18); }

  /* 南非 branch code */
  function makeZaAccount(rng) { return digits(rng, 6) + " " + digits(rng, 9); }

  /* 韩国银行-账号 */
  function makeKrAccount(rng) { return digits(rng, 3) + "-" + digits(rng, 6) + "-" + String(ri(rng, 0, 9)); }

  /* 其余国家：通用纯数字账号 */
  function makeGenericAccount(rng) { return digits(rng, ri(rng, 9, 12)); }

  function makeBankAccount(cc, rng) {
    switch (cc) {
      case "US": return makeAba(rng);
      case "CA": return makeCaAccount(rng);
      case "IN": return makeIfsc(rng);
      case "AU": return makeBsb(rng);
      case "NZ": return makeNzAccount(rng);
      case "JP": return makeJpAccount(rng);
      case "CN": return makeCnaps(rng);
      case "BR": return makeBrAccount(rng);
      case "MX": return makeClabe(rng);
      case "ZA": return makeZaAccount(rng);
      case "KR": return makeKrAccount(rng);
      default: {
        const iban = makeIban(cc, rng);
        return iban || makeGenericAccount(rng);
      }
    }
  }

  /* SWIFT/BIC：4 字母银行码 + 国家 + 2 位地区码 + (XXX | 3 位) */
  const SWIFT_BANKS = ["CITI", "HSBC", "BARC", "DEUT", "BNPA", "CHAS", "UNCR", "ABNA", "IRVT", "MHCB", "SCBL", "TRBK", "BOFA", "WFBI", "ICBK", "BKCH", "SBIN", "HDFC", "NORQ", "MIZU"];
  function makeSwift(cc, rng) {
    const loc = pick(rng, ["US", "UK", "GB", "MM", "33", "21", "DE", "FR", "SG", "HK"]).slice(0, 2);
    const tail = rng() < 0.6 ? "XXX" : pick(rng, ["HQB", "012", "110", "AT1", "205"]);
    return pick(rng, SWIFT_BANKS) + cc + loc + tail;
  }

  function makeBankInfo(cc, rng) {
    return { account: makeBankAccount(cc, rng), swift: makeSwift(cc, rng) };
  }

  /* ================= 导出 ================= */
  const CC_CORE = {
    mulberry32, hashSeed, ri, pick, digits,
    luhnValid, luhnComplete,
    RULES, DISPLAY, GROUPS, groupNumber,
    makeNumber, makeExpiry, makeCvv,
    COUNTRY_BRANDS, countryBrands,
    VAL_RULES, detectBrand, validate,
    IBAN_SPECS, ibanCheckDigits, makeIban, makeAba,
    makeBankAccount, makeSwift, makeBankInfo
  };

  global.CC_CORE = CC_CORE;
  if (typeof module !== "undefined" && module.exports) module.exports = CC_CORE;
})(typeof window !== "undefined" ? window : globalThis);
