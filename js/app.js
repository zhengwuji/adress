/* 美国地址生成器 - 核心逻辑（多国别）
 * 数据：js/countries_data.js（36 国真实城市/邮编/坐标，GeoNames + Census）
 *       js/names.js（36 国元数据 + 多语种人名/电话/街道语料）
 * 真实街道：OpenStreetMap (Nominatim + Overpass API)，失败自动回退内置街道库
 * 地图：Google Maps 免密钥嵌入
 * 数据更新：server.py 提供 /api/update 一键重建；file:// 下提示命令行方式
 */
(function () {
  "use strict";

  const DATA = window.ADDR_COUNTRIES;
  const N = window.ADDR_NAMES;
  const META = N.COUNTRIES;
  const LOCALES = N.LOCALES;

  const $ = (id) => document.getElementById(id);
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const H = { ri: rint, dg: (n) => { let s = ""; for (let i = 0; i < n; i++) s += rint(0, 9); return s; }, rand };
  const flagOf = (cc) => String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

  /* ================= i18n ================= */
  const I18N = {
    zh: {
      "doc.title": "美国地址生成器 - 随机生成真实格式的各国地址",
      "brand": "美国地址生成器",
      "nav.home": "首页", "nav.about": "关于", "nav.api": "API指南", "nav.faq": "常见问题", "nav.lang": "语言",
      "hero.badge": "生成真实格式地址，包含街道、城市、地区、邮编",
      "hero.title": "美国地址生成器",
      "hero.sub": "生成真实格式的全球地址用于开发测试",
      "hero.f1": "内置36个国家/地区的真实城市与邮编数据（GeoNames）",
      "hero.f2": "一键复制功能，方便快速使用",
      "hero.f3": "集成Google Maps地图显示，支持OpenStreetMap真实街道",
      "hero.cardTitle": "地址信息", "hero.states": "可用州", "hero.cities": "可用城市",
      "hero.country": "国家/地区", "hero.randomCountry": "随机国家",
      "card.basic": "基本信息", "card.addr": "地址信息", "card.job": "就业信息",
      "card.credit": "信用卡信息", "card.map": "地图位置", "card.quick": "快速操作",
      "card.filter": "筛选选项", "card.hot": "热门城市", "card.billing": "账单地址表单",
      "billing.firstName": "First name", "billing.lastName": "Last name",
      "billing.address": "Billing address", "billing.city": "City",
      "billing.country": "Country/Region",
      "billing.gst": "GSTIN (optional)",
      "billing.fill": "一键填入", "billing.filled": "表单已按当前信息填入",
      "billing.copyForm": "复制整张表单", "billing.copyBlock": "复制地址块",
      "billing.hint": "点击任意字段可直接复制；字段顺序与 Google 账单地址表单一致，可逐格粘贴。",
      "billing.tipZip": "邮编（Google 表单中按国家显示 ZIP / PIN / Postal code）",
      "billing.tipGst": "GSTIN 为按格式随机生成的虚构税号，仅用于表单格式校验",
      "f.fullName": "全名：", "f.gender": "性别：", "f.dob": "生日：", "f.title": "称谓：",
      "f.hair": "头发颜色：", "f.country": "国家：", "f.street": "街道：", "f.city": "城市：",
      "f.zip": "邮编：", "f.phone": "电话：", "f.email": "邮箱：",
      "f.occupation": "职业：", "f.company": "公司：",
      "f.cardType": "卡片类型：", "f.cardNumber": "卡号：", "f.cardExpiry": "有效期：", "f.cardCvv": "安全码：",
      "map.open": "在 Google Maps 中查看 ↗",
      "q.copyAll": "复制全部信息", "q.random": "随机生成", "q.taxFree": "随机免税地址", "q.export": "导出JSON", "q.regen": "重新生成",
      "q.taxFreeTip": "仅美国支持免税州（AK/DE/MT/NH/OR）",
      "flt.state": "选择州", "flt.city": "选择城市", "flt.anyState": "-- 随机 --", "flt.anyCity": "-- 随机城市 --",
      "flt.house": "仅生成包含门牌号的地址", "flt.houseHint": "启用后生成街道地址中包含数字的地址（如：123 Main St）",
      "flt.osm": "使用 OpenStreetMap 真实街道名", "flt.osmHint": "启用后联网查询所选城市的真实街道名（如谷歌地图所示），失败时自动回退内置街道库",
      "hot.collapse": "✓ 收起列表", "hot.expand": "▸ 展开列表",
      "toast.copied": "已复制", "toast.copyAll": "已复制全部信息", "toast.exported": "JSON 已导出", "toast.copyFail": "复制失败，请手动复制",
      "src.osm": "街道来源：OpenStreetMap 真实街道（该城市已缓存 {n} 条街道）",
      "src.pool": "街道来源：内置街道库（OSM 查询中/不可用，重新生成可获取真实街道）",
      "src.jp": "街道来源：日本街区式编号（丁目-番-号）",
      "update.btn": "更新数据", "update.version": "数据版本",
      "foot.disclaimer": "本工具生成的所有身份信息、地址、电话、邮箱及卡号均为随机虚构数据，仅供软件开发与测试使用，请勿用于伪造身份或其他非法用途。",
      "foot.src": "数据来源：GeoNames (CC BY 4.0)、US Census ZCTA Gazetteer、OpenStreetMap (ODbL)",
      "modal.about": "关于本工具", "modal.api": "API 使用指南", "modal.faq": "常见问题", "modal.update": "更新数据",
      "labels": { fullName: "全名", gender: "性别", dob: "生日", title: "称谓", hair: "头发颜色", country: "国家", street: "街道", city: "城市", state: "州", stateFull: "州全名", zip: "邮编", phone: "电话", email: "邮箱", occupation: "职业", company: "公司", cardType: "卡片类型", cardNumber: "卡号", cardExpiry: "有效期", cardCvv: "安全码", fullAddress: "完整地址" }
    },
    en: {
      "doc.title": "US Address Generator - Random Realistic Worldwide Addresses",
      "brand": "US Address Generator",
      "nav.home": "Home", "nav.about": "About", "nav.api": "API Guide", "nav.faq": "FAQ", "nav.lang": "Language",
      "hero.badge": "Realistic addresses with street, city, region and ZIP code",
      "hero.title": "US Address Generator",
      "hero.sub": "Generate realistic worldwide addresses for development & testing",
      "hero.f1": "Real city & ZIP data for 36 countries/regions (GeoNames)",
      "hero.f2": "One-click copy for quick use",
      "hero.f3": "Google Maps preview with OpenStreetMap real street names",
      "hero.cardTitle": "Address Info", "hero.states": "States", "hero.cities": "Cities",
      "hero.country": "Country/Region", "hero.randomCountry": "Random country",
      "card.basic": "Basic Info", "card.addr": "Address Info", "card.job": "Employment",
      "card.credit": "Credit Card", "card.map": "Map Location", "card.quick": "Quick Actions",
      "card.filter": "Filter Options", "card.hot": "Popular Cities", "card.billing": "Billing Address Form",
      "billing.firstName": "First name", "billing.lastName": "Last name",
      "billing.address": "Billing address", "billing.city": "City",
      "billing.country": "Country/Region",
      "billing.gst": "GSTIN (optional)",
      "billing.fill": "Fill form", "billing.filled": "Form filled from current record",
      "billing.copyForm": "Copy whole form", "billing.copyBlock": "Copy address block",
      "billing.hint": "Click any field to copy it; the field order matches the Google billing address form, so you can paste field by field.",
      "billing.tipZip": "Postal code (shown as ZIP / PIN / Postal code depending on country)",
      "billing.tipGst": "GSTIN is a randomly generated fictional tax number, only for form-format testing",
      "f.fullName": "Full Name:", "f.gender": "Gender:", "f.dob": "Birthday:", "f.title": "Title:",
      "f.hair": "Hair Color:", "f.country": "Country:", "f.street": "Street:", "f.city": "City:",
      "f.zip": "ZIP:", "f.phone": "Phone:", "f.email": "Email:",
      "f.occupation": "Occupation:", "f.company": "Company:",
      "f.cardType": "Card Type:", "f.cardNumber": "Card No.:", "f.cardExpiry": "Expires:", "f.cardCvv": "CVV:",
      "map.open": "Open in Google Maps ↗",
      "q.copyAll": "Copy All", "q.random": "Random Generate", "q.taxFree": "Random Tax-Free Address", "q.export": "Export JSON", "q.regen": "Regenerate",
      "q.taxFreeTip": "US only (tax-free states AK/DE/MT/NH/OR)",
      "flt.state": "Select State", "flt.city": "Select City", "flt.anyState": "-- Random --", "flt.anyCity": "-- Random City --",
      "flt.house": "Only addresses with house numbers", "flt.houseHint": "Generate street addresses containing a number (e.g. 123 Main St)",
      "flt.osm": "Use OpenStreetMap real street names", "flt.osmHint": "Fetch real street names of the selected city online; falls back to the built-in street pool on failure",
      "hot.collapse": "✓ Collapse list", "hot.expand": "▸ Expand list",
      "toast.copied": "Copied", "toast.copyAll": "All info copied", "toast.exported": "JSON exported", "toast.copyFail": "Copy failed, please copy manually",
      "src.osm": "Street source: OpenStreetMap real streets ({n} cached for this city)",
      "src.pool": "Street source: built-in street pool (OSM pending/unavailable, regenerate to try again)",
      "src.jp": "Street source: Japanese district-block format (chome-ban-go)",
      "update.btn": "Update data", "update.version": "Data version",
      "foot.disclaimer": "All names, addresses, phone numbers, emails and card numbers generated by this tool are random and fictional, for software development and testing only. Do not use for identity fraud or any illegal purpose.",
      "foot.src": "Data sources: GeoNames (CC BY 4.0), US Census ZCTA Gazetteer, OpenStreetMap (ODbL)",
      "modal.about": "About", "modal.api": "API Guide", "modal.faq": "FAQ", "modal.update": "Update Data",
      "labels": { fullName: "Full Name", gender: "Gender", dob: "Birthday", title: "Title", hair: "Hair Color", country: "Country", street: "Street", city: "City", state: "State", stateFull: "State Name", zip: "ZIP", phone: "Phone", email: "Email", occupation: "Occupation", company: "Company", cardType: "Card Type", cardNumber: "Card No.", cardExpiry: "Expires", cardCvv: "CVV", fullAddress: "Full Address" }
    }
  };
  let lang = localStorage.getItem("addr_lang") || "zh";
  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.zh[k] || k;

  /* ================= 工具函数 ================= */
  function luhnComplete(prefix) {
    let sum = 0, dbl = true;
    for (let i = prefix.length - 1; i >= 0; i--) {
      let d = +prefix[i];
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return prefix + ((10 - (sum % 10)) % 10);
  }
  function digits(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += rint(0, 9);
    return s;
  }
  function ascii(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z]/g, "").toLowerCase();
  }

  /* ================= 账单地址表单辅助 ================= */
  // 邮编字段在各国的叫法（与 Google 账单地址表单一致）
  const ZIP_LABELS = {
    US: "ZIP code", CA: "Postal code", GB: "Postcode", IE: "Eircode",
    IN: "PIN code", JP: "Postal code", CN: "Postal code", KR: "Postal code",
    BR: "CEP", MX: "Postal code", AR: "Postal code", CL: "Postal code",
    DE: "Postal code", FR: "Postal code", IT: "Postal code", ES: "Postal code",
    PT: "Postal code", NL: "Postal code", BE: "Postal code", AT: "Postal code",
    CH: "Postal code", PL: "Postal code", SE: "Postal code", NO: "Postal code",
    DK: "Postal code", RU: "Postal code", TR: "Postal code",
    MY: "Postcode", ID: "Postal code", TH: "Postal code", PH: "Postal code",
    AE: "Postal code", ZA: "Postal code", NZ: "Postcode", AU: "Postcode",
    CO: "Postal code"
  };
  // 使用 GST / VAT 类税号的国家
  const GST_COUNTRIES = ["IN", "AU", "NZ", "CA"];
  const GST_LABELS = {
    IN: ["GSTIN (optional)", "GSTIN（可选）"],
    AU: ["ABN (optional)", "ABN（可选）"],
    NZ: ["GST number (optional)", "GST 号（可选）"],
    CA: ["GST/HST number (optional)", "GST/HST 号（可选）"]
  };
  function makeGst(cc) {
    const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const ltr = () => L[rint(0, 25)];
    if (cc === "IN") return digits(2) + ltr() + ltr() + ltr() + ltr() + ltr() + digits(4) + ltr() + digits(1) + ltr() + digits(1);
    if (cc === "AU") return digits(2) + " " + digits(3) + " " + digits(3) + " " + digits(3);
    if (cc === "NZ") return digits(3) + "-" + digits(3) + "-" + digits(3);
    return digits(9) + "RT" + digits(4);
  }

  /* ================= OSM 真实街道 ================= */
  const OSM_KEY = "addr_osm_streets_v1";
  let osmCache = {};
  try { osmCache = JSON.parse(localStorage.getItem(OSM_KEY) || "{}"); } catch (e) { osmCache = {}; }
  function saveOsm() {
    try { localStorage.setItem(OSM_KEY, JSON.stringify(osmCache)); } catch (e) { /* ignore */ }
  }
  const inflight = {};

  async function fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try { return await fetch(url, Object.assign({ signal: ctrl.signal }, opts)); }
    finally { clearTimeout(timer); }
  }

  async function fetchRealStreets(cityName, regionName, cc) {
    const base = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=" + cc.toLowerCase();
    let geo = [];
    try {
      geo = await (await fetchWithTimeout(base + "&city=" + encodeURIComponent(cityName) + "&state=" + encodeURIComponent(regionName), {}, 5000)).json();
      if (!geo.length) geo = await (await fetchWithTimeout(base + "&city=" + encodeURIComponent(cityName), {}, 5000)).json();
    } catch (e) { /* network error -> fallback */ }
    if (!geo.length) throw new Error("nominatim: not found");
    const g = geo[0];
    const areaId = g.osm_type === "relation" ? 3600000000 + g.osm_id
      : g.osm_type === "way" ? 2400000000 + g.osm_id : null;
    if (!areaId) throw new Error("nominatim: no area id");
    const q = `[out:json][timeout:20];way(area:${areaId})["highway"~"^(residential|primary|secondary|tertiary|unclassified|living_street)$"]["name"];out tags 400;`;
    // 主站拥塞/限流时自动切换镜像
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.private.coffee/api/interpreter"
    ];
    let json = null;
    for (const ep of endpoints) {
      try {
        const res = await fetchWithTimeout(ep,
          { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q) }, 10000);
        json = await res.json();
        break;
      } catch (e) { /* try next mirror */ }
    }
    if (!json) throw new Error("overpass: all endpoints failed");
    const names = [];
    const seen = {};
    (json.elements || []).forEach((el) => {
      const nm = el.tags && el.tags.name;
      if (nm && nm.length < 60 && !seen[nm]) { seen[nm] = 1; names.push(nm); }
    });
    if (names.length < 5) throw new Error("overpass: too few streets");
    return names.slice(0, 200);
  }

  function getRealStreets(cityName, regionName, cc, onReady) {
    const key = cc + "|" + cityName;
    if (osmCache[key]) return osmCache[key];
    if (inflight[key]) return null;
    inflight[key] = true;
    fetchRealStreets(cityName, regionName, cc)
      .then((names) => { osmCache[key] = names; saveOsm(); if (onReady) onReady(names.length); })
      .catch(() => { if (onReady) onReady(0); })
      .finally(() => { delete inflight[key]; });
    return null;
  }

  /* ================= 国家/地区状态 ================= */
  let currentCountry = "US";
  const CC_LIST = Object.keys(DATA).sort((a, b) => {
    const pa = N.POPULAR_CC.indexOf(a), pb = N.POPULAR_CC.indexOf(b);
    return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb) || a.localeCompare(b);
  });
  // 数据修正：美国海外领地（AS/GU/PR/VI/MP）的 region.n 为空，用州名表补齐，避免界面/账单表单出现 "null"
  Object.keys(DATA).forEach((cc) => {
    const R = DATA[cc].regions || {};
    Object.keys(R).forEach((k) => {
      if (!R[k].n) R[k].n = (cc === "US" && N.US_STATES[k] && N.US_STATES[k].name) ? N.US_STATES[k].name : k;
    });
  });
  const US_HOT_ORDER = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
    "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Seattle", "Denver", "Boston",
    "Washington", "Las Vegas"];

  function regionLabel() { const l = META[currentCountry].regionLabel; return lang === "zh" ? l[0] : l[1]; }
  function countryName(cc) { const m = META[cc]; return lang === "zh" ? m.zh : m.name; }
  function countryStats(cc) {
    const r = DATA[cc].regions;
    return { regions: Object.keys(r).length, cities: Object.values(r).reduce((a, b) => a + b.cities.length, 0) };
  }

  /* ================= 生成逻辑 ================= */
  const FREE_CODES = Object.keys(N.US_STATES).filter((c) => N.US_STATES[c].free);
  let current = null;
  let streetSource = "pool";

  function pickArea(cc, rkey, region) {
    if (cc === "US") return rand(N.AREA_CODES.US[rkey] || N.AREA_CODES.US.CA);
    if (cc === "CA") return rand(N.AREA_CODES.CA[region.n] || N.AREA_CODES.CA["Ontario"]);
    const m = META[cc];
    return m.areas ? rand(m.areas) : "";
  }

  function makeStreet(cc, cityName, regionName, forceNumber) {
    const meta = META[cc];
    let base = null;
    streetSource = "pool";
    if (meta.num !== "jp" && $("chkOsm").checked) {
      const cached = getRealStreets(cityName, regionName, cc, onStreetsCached);
      if (cached) { base = rand(cached); streetSource = "osm"; }
    }
    const num = rint(1, 9999);
    if (meta.num === "jp") {
      streetSource = "jp";
      return `${rint(1, 9)}-${rint(1, 30)}-${rint(1, 20)} ${base || cityName}`;
    }
    if (!base) base = rand(meta.streets && meta.streets.length ? meta.streets : N.US_STREETS);
    if (streetSource === "pool") streetSource = meta.streets && meta.streets.length ? "local" : "pool";
    const withNumber = forceNumber || Math.random() < 0.7;
    if (!withNumber) return base;
    switch (meta.num) {
      case "after": return `${base} ${num}`;
      case "comma": return `${base}, ${num}`;
      case "tr": return `${base} No:${num}`;
      case "id": return `${base} No.${num}`;
      case "cn": return `${base}${num}号`;
      default: return `${num} ${base}`;
    }
  }
  function onStreetsCached(n) {
    if (current && n > 0) { $("streetSrc").textContent = t("src.osm").replace("{n}", n); }
  }

  function makeEmail(loc, first, last) {
    const domain = rand(META[currentCountry].email);
    const lastAscii = loc.asciiLast ? (loc.asciiLast[last] || ascii(last) || "user") : ascii(last) || "user";
    if (loc.asciiLast) return `${lastAscii}${rint(100, 9999)}@${domain}`;
    const f = ascii(first), l = ascii(last);
    if (!f && !l) return `user${rint(1000, 9999)}@${domain}`;
    const pat = rint(0, 3);
    if (pat === 0) return `${f}.${l}${rint(100, 9999)}@${domain}`;
    if (pat === 1) return `${f}${l}${rint(10, 999)}@${domain}`;
    if (pat === 2) return `${f[0] || "u"}.${l}${rint(10, 999)}@${domain}`;
    return `${f}_${l}${rint(10, 99)}@${domain}`;
  }

  function generate(opts) {
    opts = opts || {};
    const cc = currentCountry, meta = META[cc], cdata = DATA[cc];
    const regions = cdata.regions;
    const forceNumber = $("chkHouse").checked;

    let rkey = opts.state || $("selState").value || null;
    let cityName = opts.city || $("selCity").value || null;
    if (opts.taxFree && cc === "US") rkey = rand(FREE_CODES);
    if (rkey && !regions[rkey]) {
      const hit = Object.keys(regions).find((k) => regions[k].n === rkey);
      rkey = hit || null;
    }
    if (!rkey && cityName) {
      rkey = Object.keys(regions).find((k) => regions[k].cities.some((x) => x.n === cityName)) || null;
    }
    if (!rkey || !regions[rkey]) rkey = rand(Object.keys(regions));
    const region = regions[rkey];
    if (cityName && !region.cities.some((x) => x.n === cityName)) cityName = null;
    const city = cityName ? region.cities.find((x) => x.n === cityName) : rand(region.cities);

    const loc = LOCALES[meta.locale];
    const gender = Math.random() < 0.5 ? "Male" : "Female";
    const first = gender === "Male" ? rand(loc.m) : rand(loc.f);
    const last = rand(loc.l);
    const fullName = loc.order === "lf" ? `${last} ${first}` : `${first} ${last}`;
    const dob = new Date(rint(1960, 2004), rint(0, 11), rint(1, 28));
    const zip = rand(city.z);
    const street = makeStreet(cc, city.n, region.n, forceNumber);
    const stateShort = (rkey !== region.n && /^[A-Za-z]{1,3}$/.test(rkey)) ? rkey : region.n;
    const countryDisplay = lang === "zh" ? meta.zh : meta.name;
    const isCn = /\u4e00-\u9fa5/.test(fullName);
    const nameParts = fullName.split(/\s+/);
    const firstName = loc.order === "lf" ? nameParts.slice(1).join(" ") : nameParts[0];
    const lastName = loc.order === "lf" ? nameParts[0] : nameParts.slice(1).join(" ");
    const fullAddress = cc === "US"
      ? `${street}, ${city.n}, ${rkey} ${zip}, United States`
      : cc === "JP" ? `${street}, ${zip}, ${countryDisplay}`
      : `${street}, ${zip} ${city.n}, ${countryDisplay}`;
    // 账单地址表单（Google 表单样式）与「复制地址块」用的合并文本
    const billing = {
      firstName: firstName || fullName,
      lastName: lastName || fullName,
      fullName,
      street,
      city: city.n,
      region: region.n,
      zip,
      country: countryDisplay,
      countryEn: meta.name,
      countryCode: cc,
      gst: GST_COUNTRIES.indexOf(cc) >= 0 ? makeGst(cc) : ""
    };
    const addrBlock = cc === "US" ? `${fullName}\n${street}\n${city.n}, ${stateShort} ${zip}\nUnited States`
      : `${fullName}\n${street}\n${city.n} ${zip}\n${region.n}\n${countryDisplay}`;

    // 信用卡（随机虚构、通过 Luhn 校验，仅供表单测试；luhnComplete 追加校验位）
    const brand = rand(N.CARD_BRANDS);
    let num;
    if (brand === "American Express") num = luhnComplete((Math.random() < 0.5 ? "34" : "37") + digits(12));
    else if (brand === "Visa") num = luhnComplete("4" + digits(14));
    else if (brand === "Mastercard") num = luhnComplete(rand(["51", "52", "53", "54", "55"]) + digits(13));
    else num = luhnComplete(Math.random() < 0.5 ? "6011" + digits(11) : "65" + digits(13));
    const numFmt = brand === "American Express"
      ? num.replace(/^(\d{4})(\d{6})(\d{5})$/, "$1 $2 $3")
      : num.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, "$1 $2 $3 $4");
    const now = new Date();
    const expiry = String(rint(1, 12)).padStart(2, "0") + "/" + (now.getFullYear() + rint(1, 6));

    current = {
      fullName, gender,
      title: gender === "Male" ? rand(loc.tm) : rand(loc.tf),
      dob: (dob.getMonth() + 1) + "/" + dob.getDate() + "/" + dob.getFullYear(),
      hair: rand(N.HAIR),
      country: countryDisplay,
      street, city: city.n, state: stateShort, stateFull: region.n, zip,
      phone: meta.phone(pickArea(cc, rkey, region), H),
      email: makeEmail(loc, first, last),
      occupation: rand(N.OCCUPATIONS),
      company: rand(N.COMPANY_A) + " " + rand(N.COMPANY_B),
      cardType: brand, cardNumber: numFmt, cardExpiry: expiry,
      cardCvv: brand === "American Express" ? String(rint(1000, 9999)) : String(rint(100, 999)),
      fullAddress, addrBlock, billing,
      nameAscii: { first: isCn ? "" : ascii(firstName), last: isCn ? "" : ascii(lastName) },
      isCn,
      location: { lat: city.c[0], lng: city.c[1] },
      generatedAt: new Date().toISOString()
    };
    render();
    return current;
  }

  /* ================= 渲染 ================= */
  const FIELD_IDS = ["fullName", "gender", "dob", "title", "hair", "country", "street", "city",
    "state", "stateFull", "zip", "phone", "email", "occupation", "company",
    "cardType", "cardNumber", "cardExpiry", "cardCvv"];

  function render() {
    FIELD_IDS.forEach((k) => { $("f-" + k).textContent = current[k]; });
    $("heroCity").textContent = current.city + ", " + (currentCountry === "US" ? current.state : currentCountry);
    $("heroAddr").textContent = current.fullAddress;
    const q = encodeURIComponent(current.fullAddress);
    $("mapFrame").src = `https://maps.google.com/maps?q=${q}&z=15&hl=${lang === "zh" ? "zh-CN" : "en"}&output=embed`;
    $("gmapsLink").href = "https://www.google.com/maps/search/?api=1&query=" + q;
    const key = currentCountry + "|" + current.city;
    $("streetSrc").textContent = META[currentCountry].num === "jp" ? t("src.jp")
      : osmCache[key] ? t("src.osm").replace("{n}", osmCache[key].length) : t("src.pool");
    renderBilling();
  }

  /* ================= 账单地址表单（逐字段复制） ================= */
  const BF_FIELDS = ["firstName", "lastName", "street", "city", "state", "zip", "country", "gst"];

  function billingValue(k) {
    const b = current.billing;
    // 账单表单模拟英文站点表单：地区用完整名称、国家/地区固定英文名，便于直接粘贴
    if (k === "state") return b.region;
    if (k === "country") return b.countryEn;
    return b[k] || "";
  }

  function billingFormText() {
    const L = lang === "zh"
      ? { firstName: "First name", lastName: "Last name", street: "Billing address", city: "City",
          state: "State/Province", zip: zipLabelText(), country: "Country/Region", gst: gstLabelText() }
      : { firstName: "First name", lastName: "Last name", street: "Billing address", city: "City",
          state: "State/Province", zip: zipLabelText(), country: "Country/Region", gst: gstLabelText() };
    return ["firstName", "lastName", "street", "city", "state", "zip", "country"]
      .concat(current.billing.gst ? ["gst"] : [])
      .map((k) => `${L[k]}: ${billingValue(k)}`).join("\n");
  }

  function zipLabelText() {
    const cc = currentCountry;
    if (cc === "IN") return "PIN code";
    return ZIP_LABELS[cc] || (lang === "zh" ? "邮编" : "Postal code");
  }
  function fieldLabel(k) {
    const map = lang === "zh"
      ? { firstName: "名", lastName: "姓", street: "账单地址", city: "城市", state: "州/省", zip: "邮编", country: "国家/地区", gst: "税号" }
      : { firstName: "First name", lastName: "Last name", street: "Billing address", city: "City", state: "State/Province", zip: "Postal code", country: "Country/Region", gst: "Tax ID" };
    return map[k] || k;
  }
  function gstLabelText() {
    const pair = GST_LABELS[currentCountry];
    return pair ? pair[lang === "zh" ? 1 : 0] : t("billing.gst");
  }

  function renderBilling() {
    BF_FIELDS.forEach((k) => {
      const el = $("bf-" + k);
      if (el) el.value = k === "gst" ? (current.billing.gst || "") : billingValue(k);
    });
    const zipField = $("bfZipField");
    if (zipField) { $("bf-lblZip").textContent = zipLabelText(); zipField.title = t("billing.tipZip"); }
    const gstField = $("bfGstField");
    if (gstField) {
      const has = !!(current.billing && current.billing.gst);
      gstField.hidden = !has;
      if (has) $("bf-lblGst").textContent = gstLabelText();
    }
  }

  function updateCountryUI() {
    const st = countryStats(currentCountry);
    const lb = regionLabel();
    $("statStates").textContent = st.regions;
    $("statCities").textContent = st.cities;
    $("lblStatRegions").textContent = t("hero.states") === "可用州" && currentCountry === "US" ? "可用州"
      : lang === "zh" ? `可用${lb}` : lb + "s";
    $("lblState").textContent = (lang === "zh" ? lb : lb) + "：";
    $("lblStateFull").textContent = (lang === "zh" ? lb + "全名" : "Full " + lb) + "：";
    $("lblRegionFilter").textContent = (lang === "zh" ? "选择" : "Select ") + lb;
    $("heroCountry").textContent = `${countryName(currentCountry)} ${flagOf(currentCountry)}`;
    $("btnTaxFree").disabled = currentCountry !== "US";
    $("btnTaxFree").title = currentCountry === "US" ? "" : t("q.taxFreeTip");
    renderHotCities();
  }

  /* ================= 复制 / 导出 ================= */
  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); return true; }
    catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt; ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch (e2) { return false; }
    }
  }
  function flash(btn) {
    if (!btn) return;
    btn.classList.add("done");
    setTimeout(() => btn.classList.remove("done"), 900);
  }
  function toast(msg) {
    const el = $("toast");
    el.textContent = msg; el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 1600);
  }

  function copyAllText() {
    const L = I18N[lang].labels;
    const c = current;
    const lb = regionLabel();
    const stLb = lang === "zh" ? lb : lb;
    const stFLb = lang === "zh" ? lb + "全名" : "Full " + lb;
    return [
      `${L.fullName}: ${c.fullName}`, `${L.gender}: ${c.gender}`, `${L.dob}: ${c.dob}`,
      `${L.title}: ${c.title}`, `${L.hair}: ${c.hair}`, "",
      `${L.country}: ${c.country}`, `${L.street}: ${c.street}`, `${L.city}: ${c.city}`,
      `${stLb}: ${c.state}`, `${stFLb}: ${c.stateFull}`, `${L.zip}: ${c.zip}`,
      `${L.phone}: ${c.phone}`, `${L.email}: ${c.email}`, "",
      `${L.occupation}: ${c.occupation}`, `${L.company}: ${c.company}`, "",
      `${L.cardType}: ${c.cardType}`, `${L.cardNumber}: ${c.cardNumber}`,
      `${L.cardExpiry}: ${c.cardExpiry}`, `${L.cardCvv}: ${c.cardCvv}`, "",
      `${L.fullAddress}: ${c.fullAddress}`
    ].join("\n");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "address_" + currentCountry + "_" + current.zip.replace(/\s/g, "") + "_" + Date.now() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast(t("toast.exported"));
  }

  /* ================= 控件初始化 ================= */
  function initCountrySelect() {
    const sel = $("selCountry");
    sel.innerHTML = "";
    CC_LIST.forEach((cc) => {
      const o = document.createElement("option");
      o.value = cc;
      o.textContent = lang === "zh" ? `${META[cc].zh} ${META[cc].name} (${cc})` : `${META[cc].name} (${cc})`;
      sel.appendChild(o);
    });
    sel.value = currentCountry;
  }

  function initFlagChips() {
    const wrap = $("countryChips");
    wrap.innerHTML = "";
    N.POPULAR_CC.forEach((cc) => {
      const b = document.createElement("button");
      b.className = "flag-chip" + (cc === currentCountry ? " active" : "");
      b.type = "button";
      b.textContent = flagOf(cc);
      b.title = countryName(cc) + " (" + cc + ")";
      b.addEventListener("click", () => setCountry(cc));
      wrap.appendChild(b);
    });
  }

  function initRegionSelects() {
    const selState = $("selState"), selCity = $("selCity");
    selState.innerHTML = "";
    const anyS = document.createElement("option");
    anyS.value = ""; anyS.textContent = t("flt.anyState");
    selState.appendChild(anyS);
    Object.keys(DATA[currentCountry].regions).forEach((k) => {
      const reg = DATA[currentCountry].regions[k];
      const o = document.createElement("option");
      o.value = k;
      o.textContent = (k !== reg.n && /^[A-Za-z]{1,3}$/.test(k)) ? `${reg.n} (${k})` : reg.n;
      selState.appendChild(o);
    });
    fillCities();
    selState._fillCities = fillCities;
    function fillCities() {
      const st = selState.value;
      const regs = st ? { [st]: DATA[currentCountry].regions[st] } : DATA[currentCountry].regions;
      selCity.innerHTML = "";
      const any = document.createElement("option");
      any.value = ""; any.textContent = t("flt.anyCity");
      selCity.appendChild(any);
      Object.keys(regs).forEach((k) => {
        regs[k].cities.forEach((cty) => {
          const o = document.createElement("option");
          o.value = cty.n;
          o.textContent = st ? cty.n : `${cty.n} (${cty.z[0]})`;
          selCity.appendChild(o);
        });
      });
    }
  }

  function renderHotCities() {
    const wrap = $("hotCities");
    wrap.innerHTML = "";
    const collapsed = wrap.classList.contains("collapsed");
    let pairs = [];
    const hot = DATA[currentCountry].hot || [];
    if (currentCountry === "US") {
      US_HOT_ORDER.forEach((n) => {
        const hit = hot.find((x) => x.n === n);
        if (hit) pairs.push(hit);
      });
      hot.forEach((x) => { if (pairs.length < 16 && !pairs.some((p) => p.n === x.n)) pairs.push(x); });
    } else pairs = hot.slice(0, 16);
    pairs.forEach((p, i) => {
      const b = document.createElement("button");
      b.className = "hot-chip" + (i >= 4 ? " extra" : "");
      if (collapsed && i >= 4) b.classList.add("collapsed-hide");
      b.innerHTML = '<svg><use href="#i-pin"/></svg>';
      const zh = N.FAMOUS_ZH[p.n];
      b.appendChild(document.createTextNode(lang === "zh" && zh ? zh : p.n));
      b.title = p.n + ", " + (META[currentCountry].regions ? (DATA[currentCountry].regions[p.r] || {}).n || p.r : p.r);
      b.addEventListener("click", () => {
        $("selState").value = p.r;
        $("selState")._fillCities();
        $("selCity").value = p.n;
        persistFilters();
        generate();
        window.scrollTo({ top: document.querySelector(".main").offsetTop - 80, behavior: "smooth" });
      });
      wrap.appendChild(b);
    });
  }

  function persistFilters() {
    localStorage.setItem("addr_filters_" + currentCountry, JSON.stringify({
      state: $("selState").value, city: $("selCity").value,
      house: $("chkHouse").checked, osm: $("chkOsm").checked
    }));
  }
  function restoreFilters() {
    try {
      const f = JSON.parse(localStorage.getItem("addr_filters_" + currentCountry) || "{}");
      if (f.state && DATA[currentCountry].regions[f.state]) $("selState").value = f.state;
      $("selState")._fillCities();
      if (f.city) $("selCity").value = f.city;
      if (typeof f.house === "boolean") $("chkHouse").checked = f.house;
      if (typeof f.osm === "boolean") $("chkOsm").checked = f.osm;
    } catch (e) { /* ignore */ }
  }

  function setCountry(cc, opts) {
    if (!DATA[cc] || cc === currentCountry) { if (opts && opts.regenerate) generate(); return; }
    currentCountry = cc;
    localStorage.setItem("addr_country", cc);
    initCountrySelect();
    initFlagChips();
    initRegionSelects();
    restoreFilters();
    updateCountryUI();
    persistFilters();
    generate();
  }

  /* ================= i18n 渲染 ================= */
  function applyI18n() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t("doc.title");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.getAttribute("data-i18n"));
      if (v) el.textContent = v;
    });
    initCountrySelect();
    initFlagChips();
    initRegionSelects();
    restoreFilters();
    updateCountryUI();
    const collapsed = $("hotCities").classList.contains("collapsed");
    $("hotToggle").textContent = collapsed ? t("hot.expand") : t("hot.collapse");
    if (current) render();
    updateVersionUI();
  }

  /* ================= 数据更新 ================= */
  function dataBuildTime() { return window.ADDR_DATA_BUILD_TIME || "-"; }
  function updateVersionUI() {
    $("dataVersion").textContent = t("update.version") + ": " + dataBuildTime();
  }

  function openUpdateModal() {
    const served = location.protocol === "http:" || location.protocol === "https:";
    if (!served) {
      const cmd = "python tools/update_data.py";
      $("modalBody").innerHTML = `<h3>${t("modal.update")}</h3>
        <p>${lang === "zh"
          ? "当前以 <code>file://</code> 方式打开，浏览器无法直接重建数据。请在项目目录运行以下命令（会重新下载 GeoNames 最新数据并重建 <code>js/countries_data.js</code>），完成后刷新页面即可："
          : "The page was opened via <code>file://</code>, so the browser cannot rebuild the dataset directly. Run the command below in the project folder (re-downloads the latest GeoNames data and rebuilds <code>js/countries_data.js</code>), then refresh the page:"}
        </p><pre>${cmd}</pre>
        <button class="btn soft" id="btnCopyCmd"><svg><use href="#i-copy"/></svg><span>复制命令 / Copy command</span></button>`;
      $("modalMask").hidden = false;
      $("btnCopyCmd").addEventListener("click", async () => { await copyText(cmd); toast(t("toast.copied")); });
      return;
    }
    $("modalBody").innerHTML = `<h3>${t("modal.update")}</h3>
      <p id="updHint">${lang === "zh" ? "正在连接更新服务…" : "Connecting to the updater…"}</p>
      <pre id="updLog" style="max-height:300px;overflow:auto"></pre>`;
    $("modalMask").hidden = false;
    startUpdate();
  }

  async function startUpdate() {
    const hint = $("updHint"), log = $("updLog");
    try {
      const ping = await fetch("/api/ping");
      if (!ping.ok) throw new Error("no updater");
      const p = await ping.json().catch(() => ({}));
      if (p.cf) {
        // Cloudflare Pages 部署：跳转到浏览器内数据更新页
        hint.innerHTML = lang === "zh"
          ? "检测到 Cloudflare 部署，正在打开在线数据更新页…"
          : "Cloudflare deployment detected, opening the online updater…";
        setTimeout(() => { location.href = "/update.html"; }, 600);
        return;
      }
    } catch (e) {
      hint.innerHTML = lang === "zh"
        ? "当前 HTTP 服务不带更新接口。请改用 <code>python server.py</code> 启动本站，或在命令行运行 <code>python tools/update_data.py</code> 后刷新页面。"
        : "This HTTP server has no updater endpoint. Start the site with <code>python server.py</code> instead, or run <code>python tools/update_data.py</code> and refresh.";
      return;
    }
    try {
      const r = await fetch("/api/update", { method: "POST" });
      if (r.status === 409) { hint.textContent = lang === "zh" ? "更新已在进行中…" : "Update already running…"; }
      else if (!r.ok) throw new Error("start failed");
      else hint.textContent = lang === "zh" ? "正在重新下载 GeoNames 数据（约 1-3 分钟）…" : "Re-downloading GeoNames data (1-3 min)…";
    } catch (e) {
      hint.textContent = lang === "zh" ? "更新启动失败。" : "Failed to start the update.";
      return;
    }
    const timer = setInterval(async () => {
      try {
        const s = await (await fetch("/api/update/status")).json();
        log.textContent = (s.log || []).join("\n");
        log.scrollTop = log.scrollHeight;
        if (!s.running && s.started) {
          clearInterval(timer);
          if (s.ok) {
            hint.textContent = lang === "zh" ? "✓ 数据已更新，正在刷新页面…" : "✓ Data updated, reloading…";
            setTimeout(() => location.reload(), 1200);
          } else {
            hint.textContent = lang === "zh" ? "✗ 更新失败，请查看上方日志。" : "✗ Update failed, see the log above.";
          }
        }
      } catch (e) { /* keep polling */ }
    }, 800);
  }

  /* ================= 模态框 ================= */
  const COUNTRY_LIST_TXT = CC_LIST.map((c) => (lang === "zh" ? META[c].zh : META[c].name)).join("、");
  const MODALS = {
    about: () => ({
      title: t("modal.about"),
      html: lang === "zh" ? `
        <p><b>美国地址生成器</b>是一个免费在线工具，用于随机生成<b>真实格式</b>的地址与身份信息，支持切换 <b>${CC_LIST.length} 个国家/地区</b>（${COUNTRY_LIST_TXT}），生成街道、城市、地区、邮编、电话、邮箱、职业与测试卡号，适用于表单校验、注册流程测试、数据库填充等开发场景。</p>
        <h4>数据来源</h4>
        <ul>
          <li>城市与邮编：<b>GeoNames</b> 邮政数据库（CC BY 4.0）与美国人口普查局 <b>ZCTA Gazetteer</b>，均为真实数据；</li>
          <li>街道名：默认来自各语言内置常见街道名库，也可通过 <b>OpenStreetMap (ODbL)</b> 在线查询所选城市的真实街道；</li>
          <li>地图：<b>Google Maps</b> 免密钥嵌入显示生成的地址位置。</li>
        </ul>
        <h4>数据规模与更新</h4>
        <p>${CC_LIST.length} 个国家/地区，共 ${Object.keys(DATA).reduce((a, c) => a + countryStats(c).cities, 0)} 个真实城市（美国 56 个州/地区 ${countryStats("US").cities} 个城市）。数据可随时点击「更新数据」重新从 GeoNames 拉取最新版本。</p>
        <h4>免责声明</h4>
        <p>本站生成的所有身份信息均为随机虚构，不对应任何真实存在的个人或账户；卡号为随机数并通过 Luhn 格式校验，<b>不可用于任何真实交易</b>。请勿将本工具用于伪造身份、欺诈或其他非法用途。</p>`
        : `
        <p><b>US Address Generator</b> is a free online tool that randomly creates <b>realistic-format</b> identity and address data in <b>${CC_LIST.length} countries/regions</b> (${COUNTRY_LIST_TXT}) — street, city, region, ZIP, phone, email, occupation and test card info — for form validation, signup-flow testing, database seeding and other development scenarios.</p>
        <h4>Data Sources</h4>
        <ul>
          <li>Cities &amp; ZIPs: <b>GeoNames</b> postal database (CC BY 4.0) and the US Census <b>ZCTA Gazetteer</b> — real data;</li>
          <li>Streets: per-country built-in pools of common street names, or live <b>OpenStreetMap (ODbL)</b> queries for the selected city;</li>
          <li>Map: keyless <b>Google Maps</b> embed of the generated address.</li>
        </ul>
        <h4>Coverage &amp; updates</h4>
        <p>${CC_LIST.length} countries, ${Object.keys(DATA).reduce((a, c) => a + countryStats(c).cities, 0)} real cities in total (${countryStats("US").cities} in the US across 56 states/territories). Use the "Update data" button to re-download the latest GeoNames datasets at any time.</p>
        <h4>Disclaimer</h4>
        <p>All generated identities are random and fictional and do not correspond to any real person or account. Card numbers are random yet Luhn-valid and <b>cannot be used for real transactions</b>. Do not use this tool for identity fraud or any illegal purpose.</p>`
    }),
    api: () => ({
      title: t("modal.api"),
      html: lang === "zh" ? `
        <p>本工具完全在浏览器本地运行，无需密钥。提供两种"API"调用方式：</p>
        <h4>1. URL 参数（打开页面时自动按条件生成）</h4>
        <table>
          <tr><th>参数</th><th>说明</th><th>示例</th></tr>
          <tr><td><code>country</code></td><td>国家代码（US/DE/JP/CN… 共 ${CC_LIST.length} 国）</td><td><code>?country=DE</code></td></tr>
          <tr><td><code>state</code></td><td>地区（美国用州缩写，其他国家用地区名）</td><td><code>?country=DE&amp;state=Bayern</code></td></tr>
          <tr><td><code>city</code></td><td>城市名</td><td><code>?country=JP&amp;city=Ginza</code></td></tr>
          <tr><td><code>house</code></td><td>1=强制门牌号，0=允许无门牌号</td><td><code>?house=1</code></td></tr>
          <tr><td><code>free</code></td><td>1=美国免税州（AK/DE/MT/NH/OR）</td><td><code>?free=1</code></td></tr>
        </table>
        <pre>?country=GB&amp;city=London&amp;house=1</pre>
        <h4>2. JavaScript 控制台 API</h4>
        <p>页面暴露全局对象 <code>USAddressGen</code>：</p>
        <pre>USAddressGen.generate()                    // 全随机（当前国家）
USAddressGen.generate({ state: 'TX' })     // 指定地区
USAddressGen.generate({ taxFree: true })   // 美国免税州
USAddressGen.setCountry('DE')              // 切换国家
USAddressGen.country                       // 当前国家代码
USAddressGen.stats('JP')                   // {regions, cities}
USAddressGen.last                          // 最近一次生成的记录
USAddressGen.setLang('en')                 // 切换语言</pre>
        <h4>3. 数据更新接口（server.py）</h4>
        <p>使用 <code>python server.py</code> 启动时可用：<code>POST /api/update</code> 触发重建、<code>GET /api/update/status</code> 查询进度、<code>GET /api/ping</code> 探测。数据源为 GeoNames 邮编数据库（每日更新）。</p>`
        : `
        <p>The tool runs 100% locally in your browser, no API key needed. Two "API" entry points:</p>
        <h4>1. URL parameters (auto-generate on load)</h4>
        <table>
          <tr><th>Param</th><th>Meaning</th><th>Example</th></tr>
          <tr><td><code>country</code></td><td>Country code (US/DE/JP/CN… ${CC_LIST.length} total)</td><td><code>?country=DE</code></td></tr>
          <tr><td><code>state</code></td><td>Region (US state abbr, region name elsewhere)</td><td><code>?country=DE&amp;state=Bayern</code></td></tr>
          <tr><td><code>city</code></td><td>City name</td><td><code>?country=JP&amp;city=Ginza</code></td></tr>
          <tr><td><code>house</code></td><td>1 = force house number, 0 = allow none</td><td><code>?house=1</code></td></tr>
          <tr><td><code>free</code></td><td>1 = US tax-free states (AK/DE/MT/NH/OR)</td><td><code>?free=1</code></td></tr>
        </table>
        <pre>?country=GB&amp;city=London&amp;house=1</pre>
        <h4>2. JavaScript console API</h4>
        <p>A global object <code>USAddressGen</code> is exposed:</p>
        <pre>USAddressGen.generate()                    // fully random (current country)
USAddressGen.generate({ state: 'TX' })     // by region
USAddressGen.generate({ taxFree: true })   // US tax-free states
USAddressGen.setCountry('DE')              // switch country
USAddressGen.country                       // current country code
USAddressGen.stats('JP')                   // {regions, cities}
USAddressGen.last                          // last generated record
USAddressGen.setLang('en')                 // switch language</pre>
        <h4>3. Data update endpoints (server.py)</h4>
        <p>When started with <code>python server.py</code>: <code>POST /api/update</code> triggers a rebuild, <code>GET /api/update/status</code> reports progress, <code>GET /api/ping</code> probes availability. Source: the GeoNames postal database (updated daily).</p>`
    }),
    faq: () => ({
      title: t("modal.faq"),
      html: lang === "zh" ? `
        <h4>支持哪些国家？</h4>
        <p>目前内置 ${CC_LIST.length} 个国家/地区的真实城市与邮编数据：${COUNTRY_LIST_TXT}。右上角「国家/地区」卡片可随时切换，数据可点击「更新数据」联网更新。</p>
        <h4>生成的地址是真实存在的吗？</h4>
        <p>城市、地区、邮编均来自真实数据库；街道名可通过 OpenStreetMap 获取所选城市的真实街道。搭配随机门牌号后，大部分地址在地图上可定位到真实街区。但"<b>门牌号 + 街道</b>"的组合是随机的，不保证该具体门牌真实存在，也未被分配给任何真实住户。</p>
        <h4>电话和邮箱是真的吗？</h4>
        <p>电话号码使用各国真实的区号/号段与本地书写格式，但号码本身为随机数，不对应真实用户；邮箱为随机组合的虚构地址。</p>
        <h4>银行卡号可以用于支付吗？</h4>
        <p><b>不可以。</b>卡号是随机生成、仅通过 Luhn 格式校验的测试号码，没有对应任何真实银行账户，无法完成支付。仅用于测试支付表单的格式校验逻辑。</p>
        <h4>什么是"随机免税地址"？</h4>
        <p>美国有 5 个州无州销售税（阿拉斯加 AK、特拉华 DE、蒙大拿 MT、新罕布什尔 NH、俄勒冈 OR），该按钮从这些州随机生成地址，常用于电商运费/税费逻辑测试。仅在美国下可用。</p>
        <h4>「更新数据」是做什么的？</h4>
        <p>GeoNames 邮编数据库每日更新。点击「更新数据」（配合 <code>python server.py</code> 启动）即可重新下载全部国家数据并重建本地数据库，页面自动刷新。</p>
        <h4>数据保存在哪里？会泄露吗？</h4>
        <p>全部生成本地完成，不向任何服务器上传您的数据；街道缓存仅存于浏览器 localStorage。</p>`
        : `
        <h4>Which countries are supported?</h4>
        <p>${CC_LIST.length} countries/regions with real city &amp; ZIP data: ${COUNTRY_LIST_TXT}. Switch anytime from the "Country/Region" card (top right); use "Update data" to refresh the datasets online.</p>
        <h4>Are the addresses real?</h4>
        <p>Cities, regions and ZIP codes come from real databases; street names can be fetched live from OpenStreetMap for the selected city. With a random house number the result usually resolves to a real block on the map. The <b>house number + street</b> combination is random though — it is not guaranteed to be an existing unit and is never assigned to a real resident.</p>
        <h4>Are phone numbers and emails real?</h4>
        <p>Phone numbers use real area codes and local formatting per country, but the digits are random and belong to no one; emails are random fictional combinations.</p>
        <h4>Can I pay with the card numbers?</h4>
        <p><b>No.</b> The card numbers are random, Luhn-valid test numbers with no real bank account behind them. Use them only to test payment-form validation.</p>
        <h4>What is "Random Tax-Free Address"?</h4>
        <p>Five US states levy no statewide sales tax (AK, DE, MT, NH, OR). This button generates an address from those states — handy for testing shipping/tax logic. US only.</p>
        <h4>What does "Update data" do?</h4>
        <p>The GeoNames postal database is updated daily. With the site started via <code>python server.py</code>, the "Update data" button re-downloads all country datasets, rebuilds the local database and reloads the page.</p>
        <h4>Where is my data stored?</h4>
        <p>Everything is generated locally; nothing is uploaded. The street cache lives only in your browser's localStorage.</p>`
    })
  };
  function openModal(kind) {
    const m = MODALS[kind]();
    $("modalBody").innerHTML = "<h3>" + m.title + "</h3>" + m.html;
    $("modalMask").hidden = false;
  }
  function closeModal() { $("modalMask").hidden = true; }

  /* ================= 全局 API ================= */
  window.USAddressGen = {
    generate,
    setCountry,
    get country() { return currentCountry; },
    get last() { return current; },
    setLang(l) { lang = l === "en" ? "en" : "zh"; localStorage.setItem("addr_lang", lang); applyI18n(); },
    get lang() { return lang; },
    billingValue,
    billingFormText,
    get billing() { return current ? current.billing : null; },
    get addrBlock() { return current ? current.addrBlock : ""; },
    countries: CC_LIST.length,
    stats(cc) { return countryStats(cc || currentCountry); }
  };

  /* ================= 事件绑定 ================= */
  function bind() {
    $("btnGen").addEventListener("click", () => generate());
    $("btnRegen").addEventListener("click", () => generate());
    $("btnTaxFree").addEventListener("click", () => generate({ taxFree: true }));
    $("btnCopyAll").addEventListener("click", async (e) => {
      const ok = await copyText(copyAllText());
      toast(ok ? t("toast.copyAll") : t("toast.copyFail"));
      flash(e.currentTarget);
    });
    $("btnExport").addEventListener("click", exportJson);
    $("btnUpdate").addEventListener("click", openUpdateModal);
    $("btnRandCountry").addEventListener("click", () => setCountry(rand(CC_LIST.filter((c) => c !== currentCountry))));
    $("heroAddr").addEventListener("click", async () => {
      const ok = await copyText(current.fullAddress);
      toast(ok ? t("toast.copied") : t("toast.copyFail"));
    });
    $("chkHouse").addEventListener("change", persistFilters);
    $("chkOsm").addEventListener("change", persistFilters);
    $("selCountry").addEventListener("change", (e) => setCountry(e.target.value));
    $("heroBlock").addEventListener("click", async (e) => {
      if (!current) return;
      const ok = await copyText(current.addrBlock || current.fullAddress);
      toast(ok ? t("toast.copied") : t("toast.copyFail"));
      if (ok) flash(e.currentTarget);
    });

    // ===== 账单地址表单：点任一字段即复制该字段 =====
    document.querySelectorAll("#billingForm [data-copy-field]").forEach((f) => {
      const field = f.getAttribute("data-copy-field");
      f.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!current) return;
        const val = field === "gst" ? (current.billing.gst || "") : billingValue(field);
        if (!val) return;
        const ok = await copyText(val);
        if (ok) { toast(t("toast.copied") + " · " + fieldLabel(field) + "：" + val); flash(f); }
        else toast(t("toast.copyFail"));
      });
      f.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f.click(); }
      });
    });
    $("btnFillForm").addEventListener("click", () => { if (current) renderBilling(); toast(t("billing.filled")); });
    $("btnCopyForm").addEventListener("click", async (e) => {
      if (!current) return;
      const ok = await copyText(billingFormText());
      toast(ok ? t("toast.copied") : t("toast.copyFail"));
      if (ok) flash(e.currentTarget);
    });
    $("btnCopyAddrBlock").addEventListener("click", async (e) => {
      if (!current) return;
      const ok = await copyText(current.addrBlock || current.fullAddress);
      toast(ok ? t("toast.copied") : t("toast.copyFail"));
      if (ok) flash(e.currentTarget);
    });

    document.querySelectorAll(".cp").forEach((b) => {
      b.addEventListener("click", async () => {
        const k = b.getAttribute("data-copy");
        const ok = await copyText(current[k] || "");
        if (ok) { toast(t("toast.copied")); flash(b); }
        else toast(t("toast.copyFail"));
      });
    });

    $("hotToggle").addEventListener("click", () => {
      const grid = $("hotCities");
      grid.classList.toggle("collapsed");
      grid.querySelectorAll(".extra").forEach((el) => el.classList.toggle("collapsed-hide", grid.classList.contains("collapsed")));
      $("hotToggle").textContent = grid.classList.contains("collapsed") ? t("hot.expand") : t("hot.collapse");
    });

    $("langBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      $("langMenu").hidden = !$("langMenu").hidden;
    });
    document.addEventListener("click", () => { $("langMenu").hidden = true; });
    document.querySelectorAll("#langMenu button").forEach((b) => {
      b.addEventListener("click", () => window.USAddressGen.setLang(b.dataset.lang));
    });

    $("navAbout").addEventListener("click", (e) => { e.preventDefault(); openModal("about"); });
    $("navApi").addEventListener("click", (e) => { e.preventDefault(); openModal("api"); });
    $("navFaq").addEventListener("click", (e) => { e.preventDefault(); openModal("faq"); });
    $("modalX").addEventListener("click", closeModal);
    $("modalMask").addEventListener("click", (e) => { if (e.target === $("modalMask")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* ================= 启动 ================= */
  function boot() {
    const p = new URLSearchParams(location.search);
    let cc = (p.get("country") || localStorage.getItem("addr_country") || "US").toUpperCase();
    if (!DATA[cc]) cc = "US";
    currentCountry = cc;

    initCountrySelect();
    initFlagChips();
    initRegionSelects();
    restoreFilters();
    applyI18n();
    bind();

    // URL 参数优先于本地记忆的筛选（state/city/house/free 任一存在即按其生成）
    const hasUrlFilter = p.has("state") || p.has("city") || p.has("house") || p.has("free");
    if (hasUrlFilter) {
      // state 支持两种写法：内部 key（US 州缩写 "TX" / 其他国家行政码）或地区英文全名（"Delhi"）
      const rawState = (p.get("state") || "").trim();
      const regions = DATA[currentCountry].regions;
      let stateVal = "";
      if (rawState) {
        if (regions[rawState.toUpperCase()]) stateVal = rawState.toUpperCase();
        else {
          const hit = Object.keys(regions).find((k) => regions[k].n.toLowerCase() === rawState.toLowerCase());
          if (hit) stateVal = hit;
        }
      }
      $("selState").value = stateVal;
      $("selState")._fillCities();
      $("selCity").value = p.get("city") || "";
      if (p.get("house") === "0") $("chkHouse").checked = false;
      if (p.get("house") === "1") $("chkHouse").checked = true;
    }

    const opts = {};
    if (p.get("free") === "1") opts.taxFree = true;
    if (hasUrlFilter && $("selState").value) opts.state = $("selState").value;
    if (hasUrlFilter && p.get("city") && $("selCity").value) opts.city = $("selCity").value;
    generate(opts);
  }

  boot();
})();
