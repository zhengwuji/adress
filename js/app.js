/* 美国与全球真实地址生成器 - 核心逻辑（全功能增强版）
 * 数据：js/countries_data.js（36 国真实城市/邮编/坐标，GeoNames + Census）
 *       js/names.js（36 国元数据 + 多语种人名/电话/街道/网络指纹/大洲）
 * 功能：IP区域定位、数字指纹、多语言/拼音对照、高德/谷歌双地图、可搜索Combobox、收藏夹与批量导出
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

  /* ================= i18n 字典 ================= */
  const I18N = {
    zh: {
      "doc.title": "真实地址生成器 - 随机生成真实多国地址、账单表单与数字指纹",
      "brand": "真实地址生成器",
      "nav.home": "首页", "nav.about": "关于", "nav.api": "API指南", "nav.faq": "常见问题", "nav.lang": "语言",
      "nav.fav": "收藏夹", "nav.hist": "历史记录", "nav.batch": "批量生成",
      "hero.badge": "生成真实格式地址，包含街道、城市、地区、邮编与数字指纹",
      "hero.title": "真实地址生成器",
      "hero.sub": "全球36国真实住宅与商业地址 · 智能IP归属地匹配 · 账单表单逐格复制 · 开发与风控测试",
      "hero.f1": "内置36国真实城市/邮编（GeoNames/Census）",
      "hero.f_ip": "支持根据代理IP智能匹配同区域真实地址",
      "hero.f2": "Google账单表单对齐，点击任意字段即刻复制",
      "hero.f3": "Google Maps + 高德地图双引擎预览与火星坐标纠偏",
      "hero.cardTitle": "地址信息", "hero.states": "可用州", "hero.cities": "可用城市",
      "hero.country": "国家/地区", "hero.randomCountry": "随机国家",
      "ip.title": "IP 区域预选生成",
      "ip.desc": "智能解析当前代理/公网 IP 或手动输入 IPv4/IPv6，自动匹配同城同省真实地址",
      "ip.detect": "识别当前 IP",
      "ip.gen": "按 IP 区域生成",
      "card.basic": "基本信息", "card.addr": "地址信息", "card.job": "就业与财务信息",
      "card.digital": "网络与数字指纹",
      "card.credit": "信用卡测试信息", "card.map": "地图位置", "card.quick": "快速操作",
      "card.filter": "筛选选项", "card.hot": "热门城市", "card.billing": "账单地址表单",
      "billing.firstName": "First name", "billing.lastName": "Last name",
      "billing.address": "Billing address", "billing.city": "City",
      "billing.country": "Country/Region",
      "billing.gst": "GSTIN (optional)",
      "billing.fill": "一键填入", "billing.filled": "表单已按当前信息填入",
      "billing.copyForm": "复制整张表单", "billing.copyBlock": "复制地址块",
      "billing.hint": "点击任意字段可直接复制；顺序与 Google 账单地址表单一致，可逐格粘贴。",
      "billing.tipZip": "邮编（Google 表单中按国家显示 ZIP / PIN / Postal code）",
      "billing.tipGst": "GSTIN 为按格式随机生成的虚构税号，仅用于表单格式校验",
      "f.fullName": "全名：", "f.gender": "性别：", "f.dob": "生日：", "f.age": "年龄：",
      "f.zodiac": "星座：", "f.title": "称谓：", "f.hair": "头发颜色：", "f.blood": "血型：",
      "f.body": "身材/BMI：", "f.edu": "最高学历：",
      "f.occupation": "职业：", "f.company": "公司：", "f.dept": "部门/性质：",
      "f.salary": "预估月薪：", "f.account": "银行账户：", "f.trans": "模拟交易：",
      "f.username": "用户名：", "f.password": "强密码：", "f.secQ": "密保问题：",
      "f.secA": "密保答案：", "f.os": "操作系统：", "f.ua": "User-Agent：",
      "f.docIp": "虚拟 IP：", "f.mac": "MAC 地址：", "f.uuid": "UUID：", "f.url": "个人主页：",
      "f.country": "国家：", "f.street": "街道：", "f.city": "城市：", "f.zip": "邮编：",
      "f.phone": "电话：", "f.email": "邮箱：", "f.fullAddr": "单行地址：",
      "f.cardType": "卡片组织：", "f.cardNumber": "卡号：", "f.cardExpiry": "有效期：", "f.cardCvv": "安全码：",
      "addr.native": "原语言", "addr.en": "English (拼音)", "addr.zh": "中文对照",
      "map.openGmaps": "在 Google Maps 中查看 ↗", "map.openAmap": "在高德地图查看 ↗",
      "q.copyAll": "复制全部信息", "q.random": "随机生成 (Space)", "q.taxFree": "随机免税地址",
      "q.fav": "收藏此地址", "q.batch": "批量生成与导出", "q.export": "JSON", "q.exportCsv": "CSV", "q.regen": "重新生成",
      "q.taxFreeTip": "仅美国支持免税州（AK/DE/MT/NH/OR）",
      "flt.state": "选择州", "flt.city": "选择城市", "flt.anyState": "-- 搜索或选择州/省 --", "flt.anyCity": "-- 搜索或选择城市 --",
      "flt.house": "仅生成包含门牌号的地址", "flt.houseHint": "启用后生成街道地址中包含数字的地址（如：123 Main St）",
      "flt.osm": "使用 OpenStreetMap 真实街道名", "flt.osmHint": "启用后联网查询所选城市的真实街道名（如谷歌地图所示），失败时自动回退内置街道库",
      "hot.collapse": "✓ 收起列表", "hot.expand": "▸ 展开列表",
      "toast.copied": "已复制", "toast.copyAll": "已复制全部信息", "toast.exported": "JSON 已导出", "toast.exportedCsv": "CSV 已导出",
      "toast.copyFail": "复制失败，请手动复制", "toast.favAdded": "⭐ 已加入收藏夹", "toast.favRemoved": "已从收藏夹移除",
      "toast.ipSuccess": "✓ 已按 IP 归属匹配区域并生成地址", "toast.ipFail": "IP 区域解析失败，请检查网络或更换 IP",
      "src.osm": "街道来源：OpenStreetMap 真实街道（该城市已缓存 {n} 条街道）",
      "src.pool": "街道来源：内置街道库（OSM 查询中/不可用，重新生成可获取真实街道）",
      "src.jp": "街道来源：日本街区式编号（丁目-番-号）",
      "update.btn": "更新数据", "update.version": "数据版本",
      "foot.disclaimer": "本工具生成的所有身份信息、地址、电话、邮箱、卡号及网络指纹均为随机虚构数据，仅供软件开发、表单测试与风控实验使用，请勿用于伪造身份或其他非法用途。",
      "foot.src": "数据来源：GeoNames (CC BY 4.0)、US Census ZCTA Gazetteer、OpenStreetMap (ODbL)",
      "modal.about": "关于本工具", "modal.api": "API 使用指南", "modal.faq": "常见问题", "modal.update": "更新数据",
      "modal.fav": "已收藏地址", "modal.hist": "最近生成历史", "modal.batch": "批量地址生成器",
      "labels": {
        fullName: "全名", gender: "性别", dob: "生日", age: "年龄", zodiac: "星座", title: "称谓", hair: "头发颜色",
        bloodType: "血型", bodyStats: "身材/BMI", education: "最高学历", occupation: "职业", company: "公司",
        department: "部门", salary: "预估月薪", accountDisplayName: "银行账户", transactionDesc: "模拟交易",
        username: "用户名", password: "强密码", securityQuestion: "密保问题", securityAnswer: "密保答案",
        os: "操作系统", userAgent: "User-Agent", docIp: "虚拟 IP", macAddress: "MAC 地址", uuid: "UUID",
        personalUrl: "个人主页", country: "国家", street: "街道", city: "城市", state: "州", stateFull: "州全名",
        zip: "邮编", phone: "电话", email: "邮箱", fullAddress: "完整地址", cardType: "卡片组织", cardNumber: "卡号",
        cardExpiry: "有效期", cardCvv: "安全码"
      }
    },
    en: {
      "doc.title": "Realistic Address Generator - Worldwide Address, Billing Form & Digital Fingerprint",
      "brand": "Address Generator",
      "nav.home": "Home", "nav.about": "About", "nav.api": "API Guide", "nav.faq": "FAQ", "nav.lang": "Language",
      "nav.fav": "Favorites", "nav.hist": "History", "nav.batch": "Batch Gen",
      "hero.badge": "Realistic worldwide identities, residential addresses & digital fingerprints",
      "hero.title": "Realistic Address Generator",
      "hero.sub": "Real 36-country residential & business addresses · IP geo-targeting · Google billing form copy · Sandbox testing",
      "hero.f1": "Real cities & postal codes across 36 countries (GeoNames/Census)",
      "hero.f_ip": "Smart geo-targeting based on proxy/public IP address",
      "hero.f2": "One-click copy aligned with Google Billing Address forms",
      "hero.f3": "Dual-engine preview with Google Maps & AMap plus GCJ-02 calibration",
      "hero.cardTitle": "Address Info", "hero.states": "States", "hero.cities": "Cities",
      "hero.country": "Country/Region", "hero.randomCountry": "Random country",
      "ip.title": "IP Region Geo-Targeting",
      "ip.desc": "Resolve current proxy/client IP or enter custom IPv4/IPv6 to match local addresses",
      "ip.detect": "Use Current IP",
      "ip.gen": "Generate by IP",
      "card.basic": "Basic Profile", "card.addr": "Address Info", "card.job": "Employment & Finance",
      "card.digital": "Digital Persona & Security",
      "card.credit": "Test Card Info", "card.map": "Map Location", "card.quick": "Quick Actions",
      "card.filter": "Filter Options", "card.hot": "Popular Cities", "card.billing": "Billing Address Form",
      "billing.firstName": "First name", "billing.lastName": "Last name",
      "billing.address": "Billing address", "billing.city": "City",
      "billing.country": "Country/Region",
      "billing.gst": "GSTIN (optional)",
      "billing.fill": "Fill form", "billing.filled": "Form filled from current record",
      "billing.copyForm": "Copy whole form", "billing.copyBlock": "Copy address block",
      "billing.hint": "Click any field to copy it; the field order matches the Google billing address form.",
      "billing.tipZip": "Postal code (shown as ZIP / PIN / Postal code depending on country)",
      "billing.tipGst": "GSTIN is a randomly generated fictional tax number for form testing",
      "f.fullName": "Full Name:", "f.gender": "Gender:", "f.dob": "Birthday:", "f.age": "Age:",
      "f.zodiac": "Zodiac:", "f.title": "Title:", "f.hair": "Hair Color:", "f.blood": "Blood Type:",
      "f.body": "Body/BMI:", "f.edu": "Education:",
      "f.occupation": "Occupation:", "f.company": "Company:", "f.dept": "Department:",
      "f.salary": "Salary:", "f.account": "Account:", "f.trans": "Transaction:",
      "f.username": "Username:", "f.password": "Password:", "f.secQ": "Security Q:",
      "f.secA": "Security A:", "f.os": "OS:", "f.ua": "User-Agent:",
      "f.docIp": "Mock IP:", "f.mac": "MAC Address:", "f.uuid": "UUID:", "f.url": "Profile URL:",
      "f.country": "Country:", "f.street": "Street:", "f.city": "City:", "f.zip": "Postal Code:",
      "f.phone": "Phone:", "f.email": "Email:", "f.fullAddr": "Single Line:",
      "f.cardType": "Card Network:", "f.cardNumber": "Card No.:", "f.cardExpiry": "Expires:", "f.cardCvv": "CVV:",
      "addr.native": "Native", "addr.en": "English (Pinyin)", "addr.zh": "Chinese",
      "map.openGmaps": "Open in Google Maps ↗", "map.openAmap": "Open in AMap ↗",
      "q.copyAll": "Copy All", "q.random": "Random Generate (Space)", "q.taxFree": "Random Tax-Free Address",
      "q.fav": "Bookmark", "q.batch": "Batch Generator", "q.export": "JSON", "q.exportCsv": "CSV", "q.regen": "Regenerate",
      "q.taxFreeTip": "US only (tax-free states AK/DE/MT/NH/OR)",
      "flt.state": "Select State", "flt.city": "Select City", "flt.anyState": "-- Search or Select Region --", "flt.anyCity": "-- Search or Select City --",
      "flt.house": "Only addresses with house numbers", "flt.houseHint": "Generate street addresses containing a number (e.g. 123 Main St)",
      "flt.osm": "Use OpenStreetMap real street names", "flt.osmHint": "Fetch real street names of the selected city online; falls back to the built-in pool on failure",
      "hot.collapse": "✓ Collapse list", "hot.expand": "▸ Expand list",
      "toast.copied": "Copied", "toast.copyAll": "All info copied", "toast.exported": "JSON exported", "toast.exportedCsv": "CSV exported",
      "toast.copyFail": "Copy failed, please copy manually", "toast.favAdded": "⭐ Added to favorites", "toast.favRemoved": "Removed from favorites",
      "toast.ipSuccess": "✓ Generated address matching detected IP region", "toast.ipFail": "Failed to resolve IP location",
      "src.osm": "Street source: OpenStreetMap real streets ({n} cached for this city)",
      "src.pool": "Street source: built-in street pool (OSM pending/unavailable, regenerate to try again)",
      "src.jp": "Street source: Japanese district-block format (chome-ban-go)",
      "update.btn": "Update data", "update.version": "Data version",
      "foot.disclaimer": "All names, addresses, phone numbers, emails, card numbers and network fingerprints are fictional, for development and testing only.",
      "foot.src": "Data sources: GeoNames (CC BY 4.0), US Census ZCTA Gazetteer, OpenStreetMap (ODbL)",
      "modal.about": "About", "modal.api": "API Guide", "modal.faq": "FAQ", "modal.update": "Update Data",
      "modal.fav": "Saved Favorites", "modal.hist": "Recent History", "modal.batch": "Batch Address Generator",
      "labels": {
        fullName: "Full Name", gender: "Gender", dob: "Birthday", age: "Age", zodiac: "Zodiac", title: "Title", hair: "Hair Color",
        bloodType: "Blood Type", bodyStats: "Body/BMI", education: "Education", occupation: "Occupation", company: "Company",
        department: "Department", salary: "Salary", accountDisplayName: "Account", transactionDesc: "Transaction",
        username: "Username", password: "Password", securityQuestion: "Security Question", securityAnswer: "Security Answer",
        os: "OS", userAgent: "User-Agent", docIp: "Mock IP", macAddress: "MAC Address", uuid: "UUID",
        personalUrl: "Profile URL", country: "Country", street: "Street", city: "City", state: "State", stateFull: "State Name",
        zip: "ZIP", phone: "Phone", email: "Email", fullAddress: "Full Address", cardType: "Card Type", cardNumber: "Card No.",
        cardExpiry: "Expires", cardCvv: "CVV"
      }
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
    return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z]/g, "").toLowerCase();
  }

  function makePassword() {
    const u = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const l = "abcdefghijkmnopqrstuvwxyz";
    const d = "23456789";
    const s = "!@#$%^&*";
    let p = [rand(u), rand(u), rand(l), rand(l), rand(l), rand(d), rand(d), rand(s), rand(u), rand(l), rand(d), rand(s)];
    for (let i = p.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p.join("");
  }

  function makeUuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function makeMac() {
    const hex = "0123456789ABCDEF";
    const pair = () => hex[rint(0, 15)] + hex[rint(0, 15)];
    return `${pair()}:${pair()}:${pair()}:${pair()}:${pair()}:${pair()}`;
  }

  function getZodiac(m, d) {
    const list = N.ZODIAC_SIGNS || [];
    for (const z of list) {
      if ((m === z.m1 && d >= z.d1) || (m === z.m2 && d <= z.d2)) {
        return lang === "zh" ? `${z.zh} (${z.en})` : `${z.en} (${z.zh})`;
      }
    }
    return lang === "zh" ? "天蝎座 (Scorpio)" : "Scorpio (天蝎座)";
  }

  /* ================= 火星坐标转换 (WGS-84 -> GCJ-02) ================= */
  function transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }
  function transformLon(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  }
  function wgs84ToGcj02(lat, lng) {
    const a = 6378245.0, ee = 0.00669342162296594323;
    if (lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271) return [lat, lng];
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLon(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng];
  }

  /* ================= 账单地址表单辅助 ================= */
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

  async function fetchWithTimeout(url, opts, ms = 6000) {
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
    } catch (e) { /* fallback */ }
    if (!geo.length) throw new Error("nominatim: not found");
    const g = geo[0];
    const areaId = g.osm_type === "relation" ? 3600000000 + g.osm_id
      : g.osm_type === "way" ? 2400000000 + g.osm_id : null;
    if (!areaId) throw new Error("nominatim: no area id");
    const q = `[out:json][timeout:20];way(area:${areaId})["highway"~"^(residential|primary|secondary|tertiary|unclassified|living_street)$"]["name"];out tags 400;`;
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
      } catch (e) { /* next */ }
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
  let currentAddrLang = "native"; // "native" | "en" | "zh"
  let currentMapType = "google";  // "google" | "amap" | "osm"
  let currentContinent = "all";

  const CC_LIST = Object.keys(DATA).sort((a, b) => {
    const pa = N.POPULAR_CC.indexOf(a), pb = N.POPULAR_CC.indexOf(b);
    return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb) || a.localeCompare(b);
  });

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

  /* ================= 收藏夹与历史记录存储 ================= */
  const FAV_KEY = "addr_favorites_v2";
  const HIST_KEY = "addr_history_v2";

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveFavorites(arr) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); updateFavBadge(); } catch (e) { }
  }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch (e) { return []; }
  }
  function addHistory(rec) {
    try {
      let h = getHistory();
      h = [rec].concat(h.filter((x) => x.id !== rec.id)).slice(0, 20);
      localStorage.setItem(HIST_KEY, JSON.stringify(h));
    } catch (e) { }
  }
  function updateFavBadge() {
    const cnt = getFavorites().length;
    const badge = $("navFavBadge");
    if (badge) badge.textContent = cnt;
    const heroBtn = $("heroFavBtn");
    if (heroBtn && current) {
      const isFav = getFavorites().some((x) => x.id === current.id);
      heroBtn.classList.toggle("active", isFav);
    }
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
    if (meta.num !== "jp" && $("chkOsm") && $("chkOsm").checked) {
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
    const withNumber = forceNumber || Math.random() < 0.75;
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
    if (current && n > 0 && $("streetSrc")) { $("streetSrc").textContent = t("src.osm").replace("{n}", n); }
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
    const forceNumber = $("chkHouse") ? $("chkHouse").checked : true;

    let rkey = opts.state || ($("selState") ? $("selState").value : null);
    let cityName = opts.city || ($("selCity") ? $("selCity").value : null);
    if (opts.taxFree && cc === "US") rkey = rand(FREE_CODES);
    if (rkey && !regions[rkey]) {
      const hit = Object.keys(regions).find((k) => regions[k].n.toLowerCase() === rkey.toLowerCase());
      rkey = hit || null;
    }
    if (!rkey && cityName) {
      rkey = Object.keys(regions).find((k) => regions[k].cities.some((x) => x.n.toLowerCase() === cityName.toLowerCase())) || null;
    }
    if (!rkey || !regions[rkey]) rkey = rand(Object.keys(regions));
    const region = regions[rkey];
    if (cityName && !region.cities.some((x) => x.n.toLowerCase() === cityName.toLowerCase())) cityName = null;
    const city = cityName ? region.cities.find((x) => x.n.toLowerCase() === cityName.toLowerCase()) : rand(region.cities);

    const loc = LOCALES[meta.locale];
    const gender = Math.random() < 0.5 ? "Male" : "Female";
    const first = gender === "Male" ? rand(loc.m) : rand(loc.f);
    const last = rand(loc.l);
    const fullName = loc.order === "lf" ? `${last} ${first}` : `${first} ${last}`;
    const birthYear = rint(1965, 2004);
    const birthMonth = rint(1, 12);
    const birthDay = rint(1, 28);
    const dob = new Date(birthYear, birthMonth - 1, birthDay);
    const age = new Date().getFullYear() - birthYear;
    const zodiac = getZodiac(birthMonth, birthDay);

    const zip = rand(city.z);
    const street = makeStreet(cc, city.n, region.n, forceNumber);
    const stateShort = (rkey !== region.n && /^[A-Za-z]{1,3}$/.test(rkey)) ? rkey : region.n;
    const countryDisplay = lang === "zh" ? meta.zh : meta.name;
    const isCn = cc === "CN" || /\u4e00-\u9fa5/.test(fullName);
    const nameParts = fullName.split(/\s+/);
    const firstName = loc.order === "lf" ? nameParts.slice(1).join(" ") : nameParts[0];
    const lastName = loc.order === "lf" ? nameParts[0] : nameParts.slice(1).join(" ");

    // 多语言地址拼装
    let fullAddressNative = "";
    let fullAddressEn = "";
    let fullAddressZh = "";

    if (cc === "US") {
      fullAddressNative = `${street}, ${city.n}, ${stateShort} ${zip}, United States`;
      fullAddressEn = fullAddressNative;
      fullAddressZh = `美国 ${N.US_STATES[stateShort] ? N.US_STATES[stateShort].name : region.n} ${N.FAMOUS_ZH[city.n] || city.n}市 ${street}，邮编 ${zip}`;
    } else if (cc === "CN") {
      fullAddressNative = `${region.n}${city.n}${street}`;
      const streetEn = N.CN_STREETS_EN[street.replace(/\d+号$/, "")]
        ? `${street.match(/\d+号$/) ? "No. " + street.match(/\d+号$/)[0].replace("号", "") + " " : ""}${N.CN_STREETS_EN[street.replace(/\d+号$/, "")]}`
        : street;
      const provEn = N.CN_PROVINCES_EN[region.n] || region.n;
      fullAddressEn = `${streetEn}, ${city.n}, ${provEn} ${zip}, China`;
      fullAddressZh = `${region.n} ${city.n} ${street}，邮政编码 ${zip}`;
    } else if (cc === "JP") {
      fullAddressNative = `${region.n} ${city.n} ${street}, ${zip}, 日本`;
      fullAddressEn = `${street}, ${city.n}, ${region.n} ${zip}, Japan`;
      fullAddressZh = `日本 ${region.n} ${N.FAMOUS_ZH[city.n] || city.n} ${street}，邮编 ${zip}`;
    } else {
      fullAddressNative = `${street}, ${zip} ${city.n}, ${meta.name}`;
      fullAddressEn = `${street}, ${city.n}, ${region.n} ${zip}, ${meta.name}`;
      fullAddressZh = `${meta.zh} ${region.n} ${N.FAMOUS_ZH[city.n] || city.n} ${street}，邮编 ${zip}`;
    }

    // 账单地址表单
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

    const addrBlock = cc === "US"
      ? `${fullName}\n${street}\n${city.n}, ${stateShort} ${zip}\nUnited States`
      : `${fullName}\n${street}\n${city.n} ${zip}\n${region.n}\n${countryDisplay}`;

    // 信用卡
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
    const cardCvv = brand === "American Express" ? String(rint(1000, 9999)) : String(rint(100, 999));

    // 数字身份与网络指纹
    const userHandle = (ascii(first)[0] || "u") + ascii(last) + rint(10, 99);
    const secQObj = rand(N.SECURITY_QUESTIONS);
    const secAnswer = lang === "zh" ? rand(secQObj.ansZh) : rand(secQObj.ansEn);
    const heightCm = gender === "Male" ? rint(170, 188) : rint(158, 175);
    const weightKg = gender === "Male" ? rint(64, 88) : rint(48, 68);
    const bmi = (weightKg / ((heightCm / 100) ** 2)).toFixed(1);
    const bloodType = rand(N.BLOOD_TYPES);
    const eduObj = rand(N.EDUCATION_LEVELS);
    const deptObj = rand(N.DEPARTMENTS);
    const currency = cc === "US" ? "$" : cc === "GB" ? "£" : cc === "JP" ? "¥" : cc === "CN" ? "¥" : "€";
    const salaryVal = `${currency}${rint(3200, 9600).toLocaleString()}${lang === "zh" ? " / 月" : " / mo"}`;
    const accountDisplayName = `${fullName} · ${lang === "zh" ? "支票账户" : "Checking Account"}`;
    const transactionDesc = rand(N.TRANSACTION_DESCS);

    const recordId = "addr_" + cc + "_" + Date.now().toString(36) + "_" + rint(100, 999);

    current = {
      id: recordId,
      countryCode: cc,
      fullName, gender,
      title: gender === "Male" ? rand(loc.tm) : rand(loc.tf),
      dob: `${dob.getFullYear()}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
      age, zodiac,
      hair: rand(N.HAIR),
      bloodType,
      bodyStats: `${heightCm} cm / ${weightKg} kg (BMI: ${bmi})`,
      education: lang === "zh" ? eduObj.zh : eduObj.en,
      occupation: rand(N.OCCUPATIONS),
      company: rand(N.COMPANY_A) + " " + rand(N.COMPANY_B),
      department: lang === "zh" ? deptObj.zh : deptObj.en,
      salary: salaryVal,
      accountDisplayName,
      transactionDesc,
      username: userHandle,
      password: makePassword(),
      securityQuestion: lang === "zh" ? secQObj.zh : secQObj.en,
      securityAnswer: secAnswer,
      os: rand(N.OPERATING_SYSTEMS),
      userAgent: rand(N.USER_AGENTS),
      docIp: `198.51.100.${rint(2, 250)}`,
      macAddress: makeMac(),
      uuid: makeUuid(),
      personalUrl: `https://github.com/${userHandle}`,
      country: countryDisplay,
      street, city: city.n, state: stateShort, stateFull: region.n, zip,
      phone: meta.phone(pickArea(cc, rkey, region), H),
      email: makeEmail(loc, first, last),
      fullAddress: fullAddressNative,
      variants: {
        native: fullAddressNative,
        en: fullAddressEn,
        zh: fullAddressZh
      },
      addrBlock, billing,
      cardType: brand, cardNumber: numFmt, cardExpiry: expiry, cardCvv,
      location: { lat: city.c[0], lng: city.c[1] },
      generatedAt: new Date().toISOString()
    };

    addHistory(current);
    render();
    updateFavBadge();
    return current;
  }

  /* ================= 渲染 ================= */
  const FIELD_IDS = [
    "fullName", "gender", "dob", "age", "zodiac", "title", "hair", "blood", "body", "edu",
    "occupation", "company", "dept", "salary", "account", "trans",
    "username", "password", "secQ", "secA", "os", "ua", "docIp", "mac", "uuid", "url",
    "country", "street", "city", "state", "stateFull", "zip", "phone", "email", "fullAddr",
    "cardType", "cardNumber", "cardExpiry", "cardCvv"
  ];

  function render() {
    if (!current) return;

    // 字段取值映射
    const valMap = {
      fullName: current.fullName, gender: current.gender, dob: current.dob,
      age: `${current.age} ${lang === "zh" ? "岁" : "yrs"}`, zodiac: current.zodiac,
      title: current.title, hair: current.hair, blood: current.bloodType,
      body: current.bodyStats, edu: current.education,
      occupation: current.occupation, company: current.company, dept: current.department,
      salary: current.salary, account: current.accountDisplayName, trans: current.transactionDesc,
      username: current.username, password: current.password,
      secQ: current.securityQuestion, secA: current.securityAnswer,
      os: current.os, ua: current.userAgent, docIp: current.docIp,
      mac: current.macAddress, uuid: current.uuid, url: current.personalUrl,
      country: current.country, street: current.street, city: current.city,
      state: current.state, stateFull: current.stateFull, zip: current.zip,
      phone: current.phone, email: current.email,
      fullAddr: current.variants[currentAddrLang] || current.fullAddress,
      cardType: current.cardType, cardNumber: current.cardNumber,
      cardExpiry: current.cardExpiry, cardCvv: current.cardCvv
    };

    FIELD_IDS.forEach((k) => {
      const el = $("f-" + k);
      if (el) el.textContent = valMap[k] || "--";
    });

    $("heroCity").textContent = current.city + ", " + (currentCountry === "US" ? current.state : currentCountry);
    $("heroAddr").textContent = current.variants[currentAddrLang] || current.fullAddress;

    renderMap();
    renderBilling();

    const key = currentCountry + "|" + current.city;
    const srcEl = $("streetSrc");
    if (srcEl) {
      srcEl.textContent = META[currentCountry].num === "jp" ? t("src.jp")
        : osmCache[key] ? t("src.osm").replace("{n}", osmCache[key].length) : t("src.pool");
    }
  }

  function renderMap() {
    if (!current) return;
    const lat = current.location.lat;
    const lng = current.location.lng;
    const frame = $("mapFrame");
    const gLink = $("gmapsLink");
    const aLink = $("amapLink");

    const [gcjLat, gcjLng] = wgs84ToGcj02(lat, lng);
    const qAddr = encodeURIComponent(current.fullAddress);

    if (gLink) gLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;
    if (aLink) {
      aLink.href = `https://uri.amap.com/marker?position=${gcjLng.toFixed(6)},${gcjLat.toFixed(6)}&name=${qAddr}&coordinate=gaode&callnative=0`;
      aLink.style.display = currentCountry === "CN" ? "inline-block" : "none";
    }

    if (currentMapType === "google") {
      frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(lat + "," + lng)}&z=15&hl=${lang === "zh" ? "zh-CN" : "en"}&output=embed`;
    } else if (currentMapType === "amap") {
      // 高德地图：使用高德开放平台或备用坐标标记页
      frame.src = `https://m.amap.com/picker/?center=${gcjLng.toFixed(6)},${gcjLat.toFixed(6)}&radius=1000&key=AMAP_KEY_REMOVED`;
    } else {
      // OpenStreetMap
      const d = 0.008;
      frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${(lng - d).toFixed(5)}%2C${(lat - d).toFixed(5)}%2C${(lng + d).toFixed(5)}%2C${(lat + d).toFixed(5)}&layer=mapnik&marker=${lat.toFixed(5)}%2C${lng.toFixed(5)}`;
    }
  }

  /* ================= 账单地址表单 ================= */
  const BF_FIELDS = ["firstName", "lastName", "street", "city", "state", "zip", "country", "gst"];

  function billingValue(k) {
    const b = current.billing;
    if (k === "state") return b.region;
    if (k === "country") return b.countryEn;
    return b[k] || "";
  }

  function billingFormText() {
    const L = {
      firstName: "First name", lastName: "Last name", street: "Billing address", city: "City",
      state: "State/Province", zip: zipLabelText(), country: "Country/Region", gst: gstLabelText()
    };
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
    if (!current) return;
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

  /* ================= 复制 / 导出 / 收藏 ================= */
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
    if (!el) return;
    el.textContent = msg; el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 1800);
  }

  function copyAllText() {
    const L = I18N[lang].labels;
    const c = current;
    const lb = regionLabel();
    return [
      `=== ${L.fullName} ===`,
      `${L.fullName}: ${c.fullName}`, `${L.gender}: ${c.gender}`, `${L.dob}: ${c.dob} (${L.age}: ${c.age})`,
      `${L.zodiac}: ${c.zodiac}`, `${L.bloodType}: ${c.bloodType}`, `${L.bodyStats}: ${c.bodyStats}`,
      `${L.education}: ${c.education}`, "",
      `=== ${L.occupation} ===`,
      `${L.occupation}: ${c.occupation}`, `${L.company}: ${c.company}`, `${L.department}: ${c.department}`,
      `${L.salary}: ${c.salary}`, `${L.accountDisplayName}: ${c.accountDisplayName}`, `${L.transactionDesc}: ${c.transactionDesc}`, "",
      `=== ${L.country} & ${L.street} ===`,
      `${L.country}: ${c.country}`, `${L.street}: ${c.street}`, `${L.city}: ${c.city}`,
      `${lb}: ${c.state} (${c.stateFull})`, `${L.zip}: ${c.zip}`, `${L.phone}: ${c.phone}`, `${L.email}: ${c.email}`,
      `${L.fullAddress}: ${c.fullAddress}`, "",
      `=== ${L.username} & ${L.password} ===`,
      `${L.username}: ${c.username}`, `${L.password}: ${c.password}`,
      `${L.securityQuestion}: ${c.securityQuestion} -> ${c.securityAnswer}`,
      `${L.os}: ${c.os}`, `${L.userAgent}: ${c.userAgent}`,
      `${L.docIp}: ${c.docIp} · ${L.macAddress}: ${c.macAddress}`, `${L.uuid}: ${c.uuid}`, "",
      `=== ${L.cardType} ===`,
      `${L.cardType}: ${c.cardType}`, `${L.cardNumber}: ${c.cardNumber}`, `${L.cardExpiry}: ${c.cardExpiry} (CVV: ${c.cardCvv})`
    ].join("\n");
  }

  function exportJson() {
    if (!current) return;
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "address_" + currentCountry + "_" + current.zip.replace(/\s/g, "") + "_" + Date.now() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast(t("toast.exported"));
  }

  function exportCsv(list) {
    const items = list || (current ? [current] : []);
    if (!items.length) return;
    const headers = ["ID", "Country", "Full Name", "Gender", "Birthday", "Street", "City", "Region", "ZIP", "Phone", "Email", "Card Type", "Card Number", "Expiry", "CVV", "Username", "Password"];
    const rows = items.map((r) => [
      r.id, r.countryCode, `"${r.fullName}"`, r.gender, r.dob, `"${r.street}"`, `"${r.city}"`, `"${r.stateFull}"`, `"${r.zip}"`,
      `"${r.phone}"`, r.email, r.cardType, `"${r.cardNumber}"`, r.cardExpiry, r.cardCvv, r.username, `"${r.password}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(",")].concat(rows.map((e) => e.join(","))).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "addresses_" + currentCountry + "_" + Date.now() + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast(t("toast.exportedCsv"));
  }

  function toggleFavorite() {
    if (!current) return;
    let favs = getFavorites();
    const idx = favs.findIndex((x) => x.id === current.id);
    if (idx >= 0) {
      favs.splice(idx, 1);
      saveFavorites(favs);
      toast(t("toast.favRemoved"));
    } else {
      favs.unshift(current);
      saveFavorites(favs);
      toast(t("toast.favAdded"));
    }
    updateFavBadge();
  }

  /* ================= IP 区域识别与生成 ================= */
  async function fetchIpLocation(targetIp) {
    targetIp = (targetIp || "").trim();
    // 1. 如果无输入且在支持环境，先尝试 /api/client-context
    if (!targetIp) {
      try {
        const cf = await (await fetchWithTimeout("/api/client-context", {}, 3000)).json();
        if (cf && cf.ok && cf.country) {
          return { ip: cf.ip, countryCode: cf.country.toUpperCase(), region: cf.region || "", city: cf.city || "", source: "Cloudflare" };
        }
      } catch (e) { }
    }

    // 2. ipwhois.app (稳定、跨域友好、免费)
    const url1 = targetIp ? `https://ipwhois.app/json/${encodeURIComponent(targetIp)}` : "https://ipwhois.app/json/";
    try {
      const res = await (await fetchWithTimeout(url1, {}, 4500)).json();
      if (res && res.success !== false && res.country_code) {
        return { ip: res.ip, countryCode: res.country_code.toUpperCase(), region: res.region || "", city: res.city || "", source: "ipwhois" };
      }
    } catch (e) { }

    // 3. ipapi.co 备用
    const url2 = targetIp ? `https://ipapi.co/${encodeURIComponent(targetIp)}/json/` : "https://ipapi.co/json/";
    try {
      const res2 = await (await fetchWithTimeout(url2, {}, 4500)).json();
      if (res2 && res2.country_code) {
        return { ip: res2.ip, countryCode: res2.country_code.toUpperCase(), region: res2.region || "", city: res2.city || "", source: "ipapi" };
      }
    } catch (e) { }

    throw new Error("IP lookup failed");
  }

  async function generateByIp(customIp) {
    const badge = $("ipStatusBadge");
    if (badge) {
      badge.hidden = false;
      badge.className = "ip-status-badge warning";
      badge.textContent = lang === "zh" ? "正在定位 IP 归属地…" : "Detecting IP region…";
    }
    try {
      const loc = await fetchIpLocation(customIp);
      const cc = loc.countryCode;
      let matchedState = null;
      let matchedCity = null;

      // 切换国家（如果在支持列表中）
      if (DATA[cc]) {
        currentCountry = cc;
        localStorage.setItem("addr_country", cc);
        initCountrySelect();
        initFlagChips();
        updateCountryUI();
      }

      const cdata = DATA[currentCountry];
      if (cdata && cdata.regions) {
        // 尝试匹配地区
        const regKeys = Object.keys(cdata.regions);
        const searchReg = (loc.region || "").toLowerCase();
        const hitKey = regKeys.find((k) => k.toLowerCase() === searchReg || cdata.regions[k].n.toLowerCase() === searchReg || cdata.regions[k].n.toLowerCase().includes(searchReg));
        if (hitKey) {
          matchedState = hitKey;
          const regObj = cdata.regions[hitKey];
          const searchCity = (loc.city || "").toLowerCase();
          const hitCity = regObj.cities.find((c) => c.n.toLowerCase() === searchCity || c.n.toLowerCase().includes(searchCity));
          if (hitCity) matchedCity = hitCity.n;
        }
      }

      const opt = {};
      if (matchedState) opt.state = matchedState;
      if (matchedCity) opt.city = matchedCity;
      generate(opt);

      // 同步更新 Combobox 界面显示
      syncCombos();

      if (badge) {
        badge.className = "ip-status-badge";
        const regStr = [countryName(currentCountry), current.state, current.city].filter(Boolean).join(" ");
        badge.textContent = `✓ ${loc.ip} · ${regStr}`;
      }
      toast(t("toast.ipSuccess"));
    } catch (err) {
      if (badge) {
        badge.className = "ip-status-badge error";
        badge.textContent = lang === "zh" ? "IP 解析失败，请检查输入或网络" : "IP lookup failed";
      }
      toast(t("toast.ipFail"));
    }
  }

  /* ================= 可搜索 Combobox ================= */
  let stateOptions = [];
  let cityOptions = [];

  function initComboboxes() {
    const stInput = $("comboStateInput");
    const stBtn = $("comboStateBtn");
    const stList = $("comboStateList");

    const ctInput = $("comboCityInput");
    const ctBtn = $("comboCityBtn");
    const ctList = $("comboCityList");

    function renderStateList(filterText = "") {
      const regs = DATA[currentCountry].regions || {};
      const keys = Object.keys(regs);
      const ft = filterText.trim().toLowerCase();
      const matched = keys.filter((k) => {
        const name = regs[k].n.toLowerCase();
        return !ft || k.toLowerCase().includes(ft) || name.includes(ft);
      });

      stList.innerHTML = "";
      const anyOpt = document.createElement("div");
      anyOpt.className = "combo-opt" + ($("selState").value === "" ? " selected" : "");
      anyOpt.innerHTML = `<span>${t("flt.anyState")}</span><span class="opt-count">${keys.length}</span>`;
      anyOpt.onclick = () => selectState("");
      stList.appendChild(anyOpt);

      matched.forEach((k) => {
        const reg = regs[k];
        const opt = document.createElement("div");
        opt.className = "combo-opt" + ($("selState").value === k ? " selected" : "");
        const label = (k !== reg.n && /^[A-Za-z]{1,3}$/.test(k)) ? `${reg.n} (${k})` : reg.n;
        opt.innerHTML = `<span>${label}</span><span class="opt-count">${reg.cities.length}</span>`;
        opt.onclick = () => selectState(k);
        stList.appendChild(opt);
      });

      if (!matched.length) {
        stList.innerHTML = `<div class="combo-empty">${lang === "zh" ? "无匹配州/省" : "No matching region"}</div>`;
      }
    }

    function selectState(val) {
      $("selState").value = val;
      const regs = DATA[currentCountry].regions || {};
      stInput.value = val ? (regs[val] ? regs[val].n : val) : "";
      stList.hidden = true;
      populateCities();
      persistFilters();
    }

    function populateCities() {
      const st = $("selState").value;
      const regs = st ? { [st]: DATA[currentCountry].regions[st] } : DATA[currentCountry].regions;
      let allCities = [];
      Object.keys(regs).forEach((k) => {
        regs[k].cities.forEach((c) => allCities.push(c));
      });
      cityOptions = allCities;
      renderCityList("");
    }

    function renderCityList(filterText = "") {
      const ft = filterText.trim().toLowerCase();
      const matched = cityOptions.filter((c) => !ft || c.n.toLowerCase().includes(ft) || (N.FAMOUS_ZH[c.n] && N.FAMOUS_ZH[c.n].includes(ft)));

      ctList.innerHTML = "";
      const anyOpt = document.createElement("div");
      anyOpt.className = "combo-opt" + ($("selCity").value === "" ? " selected" : "");
      anyOpt.innerHTML = `<span>${t("flt.anyCity")}</span><span class="opt-count">${cityOptions.length}</span>`;
      anyOpt.onclick = () => selectCity("");
      ctList.appendChild(anyOpt);

      matched.slice(0, 80).forEach((c) => {
        const opt = document.createElement("div");
        opt.className = "combo-opt" + ($("selCity").value === c.n ? " selected" : "");
        const zh = N.FAMOUS_ZH[c.n];
        const label = lang === "zh" && zh ? `${c.n} · ${zh}` : c.n;
        opt.innerHTML = `<span>${label}</span><span class="opt-count">${c.z[0]}</span>`;
        opt.onclick = () => selectCity(c.n);
        ctList.appendChild(opt);
      });

      if (!matched.length) {
        ctList.innerHTML = `<div class="combo-empty">${lang === "zh" ? "无匹配城市" : "No matching city"}</div>`;
      }
    }

    function selectCity(val) {
      $("selCity").value = val;
      ctInput.value = val || "";
      ctList.hidden = true;
      persistFilters();
    }

    stInput.onfocus = () => { renderStateList(stInput.value); stList.hidden = false; ctList.hidden = true; };
    stInput.oninput = () => { renderStateList(stInput.value); stList.hidden = false; };
    stBtn.onclick = (e) => { e.stopPropagation(); stList.hidden = !stList.hidden; ctList.hidden = true; if (!stList.hidden) renderStateList(); };

    ctInput.onfocus = () => { populateCities(); renderCityList(ctInput.value); ctList.hidden = false; stList.hidden = true; };
    ctInput.oninput = () => { renderCityList(ctInput.value); ctList.hidden = false; };
    ctBtn.onclick = (e) => { e.stopPropagation(); ctList.hidden = !ctList.hidden; stList.hidden = true; if (!ctList.hidden) { populateCities(); renderCityList(); } };

    document.addEventListener("click", (e) => {
      if (!$("comboStateWrap").contains(e.target)) stList.hidden = true;
      if (!$("comboCityWrap").contains(e.target)) ctList.hidden = true;
    });

    // 暴露同步更新接口
    window._combos = { selectState, selectCity, populateCities };
  }

  function syncCombos() {
    if (!window._combos) return;
    const regs = DATA[currentCountry].regions || {};
    const stVal = $("selState").value;
    const ctVal = $("selCity").value;
    $("comboStateInput").value = stVal ? (regs[stVal] ? regs[stVal].n : stVal) : "";
    $("comboCityInput").value = ctVal || "";
    window._combos.populateCities();
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

  function initContinentTabs() {
    const wrap = $("continentTabs");
    if (!wrap) return;
    wrap.innerHTML = "";
    const conts = [
      { id: "all", zh: "全部", en: "All" },
      { id: "na", zh: "北美洲", en: "N. America" },
      { id: "eu", zh: "欧洲", en: "Europe" },
      { id: "ea", zh: "亚洲", en: "Asia" },
      { id: "sa", zh: "中东/南亚", en: "MidEast" },
      { id: "oc", zh: "大洋洲", en: "Oceania" },
      { id: "la", zh: "拉美/非洲", en: "LatAm/Africa" }
    ];
    conts.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "continent-chip" + (c.id === currentContinent ? " active" : "");
      b.textContent = lang === "zh" ? c.zh : c.en;
      b.onclick = () => {
        currentContinent = c.id;
        document.querySelectorAll(".continent-chip").forEach((el) => el.classList.remove("active"));
        b.classList.add("active");
        initFlagChips();
      };
      wrap.appendChild(b);
    });
  }

  function initFlagChips() {
    const wrap = $("countryChips");
    wrap.innerHTML = "";
    let list = N.POPULAR_CC;
    if (currentContinent !== "all" && N.CONTINENTS[currentContinent]) {
      list = N.CONTINENTS[currentContinent].cc;
    }
    list.forEach((cc) => {
      if (!DATA[cc]) return;
      const b = document.createElement("button");
      b.className = "flag-chip" + (cc === currentCountry ? " active" : "");
      b.type = "button";
      b.textContent = flagOf(cc);
      b.title = countryName(cc) + " (" + cc + ")";
      b.addEventListener("click", () => setCountry(cc));
      wrap.appendChild(b);
    });
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
        if (window._combos) {
          window._combos.selectState(p.r);
          window._combos.selectCity(p.n);
        }
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
      if (f.city) $("selCity").value = f.city;
      if (typeof f.house === "boolean") $("chkHouse").checked = f.house;
      if (typeof f.osm === "boolean") $("chkOsm").checked = f.osm;
      syncCombos();
    } catch (e) { }
  }

  function setCountry(cc, opts) {
    if (!DATA[cc] || cc === currentCountry) { if (opts && opts.regenerate) generate(); return; }
    currentCountry = cc;
    localStorage.setItem("addr_country", cc);
    initCountrySelect();
    initFlagChips();
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
    initContinentTabs();
    initFlagChips();
    updateCountryUI();
    const collapsed = $("hotCities").classList.contains("collapsed");
    $("hotToggle").textContent = collapsed ? t("hot.expand") : t("hot.collapse");
    if (current) render();
    updateVersionUI();
    updateFavBadge();
  }

  function dataBuildTime() { return window.ADDR_DATA_BUILD_TIME || "-"; }
  function updateVersionUI() {
    $("dataVersion").textContent = t("update.version") + ": " + dataBuildTime();
  }

  /* ================= 模态框逻辑 ================= */
  function openModal(title, html) {
    $("modalBody").innerHTML = `<h3>${title}</h3>` + html;
    $("modalMask").hidden = false;
  }
  function closeModal() { $("modalMask").hidden = true; }

  function openFavoritesModal() {
    const favs = getFavorites();
    if (!favs.length) {
      openModal(t("modal.fav"), `<p style="text-align:center;padding:24px 0;color:var(--muted)">${lang === "zh" ? "暂无收藏记录。点击生成结果上的 ⭐ 即可收藏优质地址。" : "No saved favorites yet. Click the ⭐ star button to save realistic addresses."}</p>`);
      return;
    }
    let rows = favs.map((f, i) => `
      <tr>
        <td><b>${flagOf(f.countryCode)} ${f.country}</b></td>
        <td><b>${f.fullName}</b></td>
        <td>${f.city}, ${f.state}</td>
        <td><code style="font-size:11px">${f.zip}</code></td>
        <td>
          <div class="act-btn-group">
            <button class="mini-action" onclick="window.USAddressGen.loadFavorite(${i})">${lang === "zh" ? "载入" : "Load"}</button>
            <button class="mini-action" onclick="window.USAddressGen.copyFavorite(${i})">${lang === "zh" ? "复制" : "Copy"}</button>
            <button class="mini-action danger" onclick="window.USAddressGen.deleteFavorite(${i})">${lang === "zh" ? "删除" : "Del"}</button>
          </div>
        </td>
      </tr>
    `).join("");

    const html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span>${lang === "zh" ? "共收藏 " + favs.length + " 条真实地址" : favs.length + " saved addresses"}</span>
        <div style="display:flex;gap:8px">
          <button class="btn soft" onclick="window.USAddressGen.exportFavoritesCsv()"><svg style="width:14px;height:14px;margin-right:4px"><use href="#i-download"/></svg>CSV</button>
          <button class="btn ghost" onclick="window.USAddressGen.clearFavorites()">${lang === "zh" ? "清空" : "Clear"}</button>
        </div>
      </div>
      <div class="fav-table-wrap">
        <table class="fav-table">
          <thead><tr><th>${lang === "zh" ? "国家" : "Country"}</th><th>${lang === "zh" ? "姓名" : "Name"}</th><th>${lang === "zh" ? "城市/地区" : "City/State"}</th><th>${lang === "zh" ? "邮编" : "ZIP"}</th><th>${lang === "zh" ? "操作" : "Action"}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    openModal(t("modal.fav"), html);
  }

  function openHistoryModal() {
    const hist = getHistory();
    if (!hist.length) {
      openModal(t("modal.hist"), `<p style="text-align:center;padding:24px 0;color:var(--muted)">${lang === "zh" ? "暂无生成历史" : "No recent history"}</p>`);
      return;
    }
    let rows = hist.map((h, i) => `
      <tr>
        <td><b>${flagOf(h.countryCode)} ${h.country}</b></td>
        <td>${h.fullName}</td>
        <td>${h.city}, ${h.state}</td>
        <td><button class="mini-action" onclick="window.USAddressGen.loadHistory(${i})">${lang === "zh" ? "重新载入" : "Restore"}</button></td>
      </tr>
    `).join("");

    const html = `
      <p style="margin:0 0 10px;font-size:12.5px;color:var(--muted)">${lang === "zh" ? "记录最近生成的 20 条地址，点击任意一条可立即恢复并在卡片中展示：" : "Last 20 generated addresses. Click to restore:"}</p>
      <div class="fav-table-wrap">
        <table class="fav-table">
          <thead><tr><th>${lang === "zh" ? "国家" : "Country"}</th><th>${lang === "zh" ? "姓名" : "Name"}</th><th>${lang === "zh" ? "城市" : "City"}</th><th>${lang === "zh" ? "操作" : "Action"}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
    openModal(t("modal.hist"), html);
  }

  function openBatchModal() {
    const html = `
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
        <label><b>${lang === "zh" ? "生成数量：" : "Count:"}</b>
          <select id="batchCount" style="padding:6px 10px;border-radius:8px;border:1px solid var(--line);margin-left:6px">
            <option value="5">5 条 (Records)</option>
            <option value="10" selected>10 条 (Records)</option>
            <option value="20">20 条 (Records)</option>
            <option value="50">50 条 (Records)</option>
          </select>
        </label>
        <button class="btn solid" id="btnRunBatch">${lang === "zh" ? "立即生成" : "Generate Now"}</button>
      </div>
      <div id="batchResultArea">
        <p style="color:var(--muted);font-size:13px">${lang === "zh" ? "选择生成数量并点击「立即生成」，结果支持一键导出为 CSV 电子表格或 JSON 格式。" : "Choose batch count and generate to export to CSV / JSON."}</p>
      </div>
    `;
    openModal(t("modal.batch"), html);

    $("btnRunBatch").onclick = () => {
      const cnt = parseInt($("batchCount").value, 10) || 10;
      const list = [];
      for (let i = 0; i < cnt; i++) list.push(generate());
      let previewRows = list.slice(0, 10).map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><b>${r.fullName}</b></td>
          <td>${r.street}</td>
          <td>${r.city}, ${r.state}</td>
          <td>${r.zip}</td>
          <td>${r.phone}</td>
        </tr>
      `).join("");

      $("batchResultArea").innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="color:var(--blue-700)">✓ ${lang === "zh" ? `已生成 ${list.length} 条真实地址` : `Generated ${list.length} records`}</strong>
          <div style="display:flex;gap:8px">
            <button class="btn soft" id="btnBatchCsv"><svg style="width:14px;height:14px;margin-right:4px"><use href="#i-download"/></svg>CSV</button>
            <button class="btn ghost" id="btnBatchJson"><svg style="width:14px;height:14px;margin-right:4px"><use href="#i-download"/></svg>JSON</button>
          </div>
        </div>
        <div class="batch-table-wrap">
          <table class="batch-table">
            <thead><tr><th>#</th><th>${lang === "zh" ? "姓名" : "Name"}</th><th>${lang === "zh" ? "街道" : "Street"}</th><th>${lang === "zh" ? "城市/地区" : "City"}</th><th>${lang === "zh" ? "邮编" : "ZIP"}</th><th>${lang === "zh" ? "电话" : "Phone"}</th></tr></thead>
            <tbody>${previewRows}</tbody>
          </table>
        </div>
      `;
      $("btnBatchCsv").onclick = () => exportCsv(list);
      $("btnBatchJson").onclick = () => {
        const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `batch_addresses_${currentCountry}_${Date.now()}.json`;
        document.body.appendChild(a); a.click(); a.remove();
      };
    };
  }

  function openUpdateModal() {
    const served = location.protocol === "http:" || location.protocol === "https:";
    if (!served) {
      const cmd = "python tools/update_data.py";
      openModal(t("modal.update"), `
        <p>${lang === "zh"
          ? "当前以 <code>file://</code> 方式打开，浏览器无法直接重建数据。请在项目目录运行以下命令（会重新下载 GeoNames 最新数据并重建 <code>js/countries_data.js</code>），完成后刷新页面即可："
          : "The page was opened via <code>file://</code>, run the command below to update datasets:"}
        </p><pre>${cmd}</pre>
        <button class="btn soft" id="btnCopyCmd"><svg><use href="#i-copy"/></svg><span>复制命令 / Copy command</span></button>`);
      $("btnCopyCmd").addEventListener("click", async () => { await copyText(cmd); toast(t("toast.copied")); });
      return;
    }
    openModal(t("modal.update"), `
      <p id="updHint">${lang === "zh" ? "正在连接更新服务…" : "Connecting to the updater…"}</p>
      <pre id="updLog" style="max-height:300px;overflow:auto"></pre>`);
    startUpdate();
  }

  async function startUpdate() {
    const hint = $("updHint"), log = $("updLog");
    try {
      const ping = await fetch("/api/ping");
      if (!ping.ok) throw new Error("no updater");
      const p = await ping.json().catch(() => ({}));
      if (p.cf) {
        hint.innerHTML = lang === "zh" ? "检测到 Cloudflare 部署，正在打开在线数据更新页…" : "Opening the online updater…";
        setTimeout(() => { location.href = "/update.html"; }, 600);
        return;
      }
    } catch (e) {
      hint.innerHTML = lang === "zh"
        ? "当前 HTTP 服务不带更新接口。请改用 <code>python server.py</code> 启动，或在命令行运行 <code>python tools/update_data.py</code>。"
        : "This server has no updater endpoint. Start with <code>python server.py</code> or run <code>python tools/update_data.py</code>.";
      return;
    }
    try {
      const r = await fetch("/api/update", { method: "POST" });
      if (r.status === 409) { hint.textContent = lang === "zh" ? "更新已在进行中…" : "Update already running…"; }
      else if (!r.ok) throw new Error("start failed");
      else hint.textContent = lang === "zh" ? "正在重新下载 GeoNames 数据（约 1-3 分钟）…" : "Re-downloading GeoNames data…";
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
            hint.textContent = lang === "zh" ? "✗ 更新失败，请查看上方日志。" : "✗ Update failed.";
          }
        }
      } catch (e) { }
    }, 800);
  }

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
    stats(cc) { return countryStats(cc || currentCountry); },
    getFavorites,
    loadFavorite(idx) {
      const fav = getFavorites()[idx];
      if (fav) { current = fav; currentCountry = fav.countryCode; updateCountryUI(); render(); closeModal(); toast(t("toast.copied") + " · " + fav.fullName); }
    },
    copyFavorite(idx) {
      const fav = getFavorites()[idx];
      if (fav) { copyText(fav.addrBlock || fav.fullAddress); toast(t("toast.copied")); }
    },
    deleteFavorite(idx) {
      let favs = getFavorites();
      favs.splice(idx, 1);
      saveFavorites(favs);
      openFavoritesModal();
    },
    clearFavorites() {
      saveFavorites([]);
      openFavoritesModal();
    },
    exportFavoritesCsv() { exportCsv(getFavorites()); },
    loadHistory(idx) {
      const h = getHistory()[idx];
      if (h) { current = h; currentCountry = h.countryCode; updateCountryUI(); render(); closeModal(); }
    }
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
    $("btnExportCsv").addEventListener("click", () => exportCsv([current]));
    $("btnUpdate").addEventListener("click", openUpdateModal);
    $("btnRandCountry").addEventListener("click", () => setCountry(rand(CC_LIST.filter((c) => c !== currentCountry))));

    // 收藏按钮
    $("btnFav").addEventListener("click", toggleFavorite);
    $("heroFavBtn").addEventListener("click", toggleFavorite);
    $("navFavBtn").addEventListener("click", openFavoritesModal);
    $("navHistBtn").addEventListener("click", openHistoryModal);
    $("navBatchBtn").addEventListener("click", (e) => { e.preventDefault(); openBatchModal(); });
    $("btnBatch").addEventListener("click", openBatchModal);

    // IP 定位生成
    $("btnDetectIp").addEventListener("click", () => {
      $("ipInput").value = "";
      generateByIp("");
    });
    $("btnGenIp").addEventListener("click", () => {
      generateByIp($("ipInput").value);
    });
    $("ipInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); $("btnGenIp").click(); }
    });

    // 账单地址复制
    $("heroAddr").addEventListener("click", async () => {
      const ok = await copyText(current.variants[currentAddrLang] || current.fullAddress);
      toast(ok ? t("toast.copied") : t("toast.copyFail"));
    });
    $("heroBlock").addEventListener("click", async (e) => {
      if (!current) return;
      const ok = await copyText(current.addrBlock || current.fullAddress);
      toast(ok ? t("toast.copied") : t("toast.copyFail"));
      if (ok) flash(e.currentTarget);
    });

    document.querySelectorAll("#billingForm [data-copy-field]").forEach((f) => {
      const field = f.getAttribute("data-copy-field");
      f.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!current) return;
        const val = field === "gst" ? (current.billing.gst || "") : billingValue(field);
        if (!val) return;
        const ok = await copyText(val);
        if (ok) { toast(t("toast.copied") + " · " + fieldLabel(field) + "：" + val); flash(f); }
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

    // 多语言地址切换 Tab
    document.querySelectorAll("#addrLangTabs button").forEach((b) => {
      b.addEventListener("click", () => {
        document.querySelectorAll("#addrLangTabs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        currentAddrLang = b.dataset.addrLang;
        render();
      });
    });

    // 地图引擎切换 Tab
    document.querySelectorAll("#mapTabs button").forEach((b) => {
      b.addEventListener("click", () => {
        document.querySelectorAll("#mapTabs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        currentMapType = b.dataset.mapType;
        renderMap();
      });
    });

    // 通用卡片行双击快速复制
    document.addEventListener("dblclick", async (e) => {
      const valEl = e.target.closest(".row .val, strong");
      if (valEl && valEl.textContent && valEl.textContent !== "--") {
        const ok = await copyText(valEl.textContent.trim());
        if (ok) toast(t("toast.copied") + ": " + valEl.textContent.trim());
      }
    });

    // 复制按钮点击
    document.querySelectorAll(".cp").forEach((b) => {
      b.addEventListener("click", async () => {
        const k = b.getAttribute("data-copy");
        let txt = current[k] || "";
        if (k === "fullAddress") txt = current.variants[currentAddrLang] || current.fullAddress;
        if (!txt) return;
        const ok = await copyText(txt);
        if (ok) { toast(t("toast.copied")); flash(b); }
      });
    });

    // 空格键快捷重新生成
    document.addEventListener("keydown", (e) => {
      if (e.key === " " && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA" && $("modalMask").hidden) {
        e.preventDefault();
        generate();
      }
    });

    $("chkHouse").addEventListener("change", persistFilters);
    $("chkOsm").addEventListener("change", persistFilters);
    $("selCountry").addEventListener("change", (e) => setCountry(e.target.value));

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

    $("navAbout").addEventListener("click", (e) => { e.preventDefault(); openModal(t("modal.about"), MODALS.about()); });
    $("navApi").addEventListener("click", (e) => { e.preventDefault(); openModal(t("modal.api"), MODALS.api()); });
    $("navFaq").addEventListener("click", (e) => { e.preventDefault(); openModal(t("modal.faq"), MODALS.faq()); });
    $("modalX").addEventListener("click", closeModal);
    $("modalMask").addEventListener("click", (e) => { if (e.target === $("modalMask")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  const MODALS = {
    about: () => lang === "zh" ? `
      <p><b>真实地址生成器</b>是一款针对跨境电商、海外注册、开发者表单测试与风控实验打造的全功能真实地址与身份模拟工具，内置全球 <b>${CC_LIST.length} 个国家/地区</b>（GeoNames + US Census 官方数据源）的真实城市、区号与邮编，同时支持 <b>OpenStreetMap 真实街道</b> 实时抓取与双地图定位。</p>
      <h4>核心特性</h4>
      <ul>
        <li><b>智能 IP 归属地匹配</b>：自动识别代理 IP 或输入指定 IP，秒级生成同城真实地址；</li>
        <li><b>全套虚拟数字指纹</b>：不仅提供姓名和街道，还提供学历、星座、月薪、密码、密保问题、操作系统与 User-Agent；</li>
        <li><b>Google 账单地址表单</b>：逐格点击复制、整表一键复制，与主流外贸/订阅支付表单完美对齐；</li>
        <li><b>双地图与火星坐标纠偏</b>：无缝切换 Google Maps 与高德地图 (AMap)，内置 WGS-84 转 GCJ-02 算法；</li>
        <li><b>收藏夹与批量导出</b>：本地离线保存满意的地址，随时导出 CSV / JSON。</li>
      </ul>` : `
      <p><b>Realistic Address Generator</b> is a developer & testing suite providing realistic worldwide residential addresses, identities, and digital fingerprints across <b>${CC_LIST.length} countries</b>.</p>`,
    api: () => lang === "zh" ? `
      <p>工具提供 URL 参数与控制台 JS API 两种调用方式：</p>
      <h4>URL 快捷参数</h4>
      <table>
        <tr><th>参数</th><th>说明</th><th>示例</th></tr>
        <tr><td><code>country</code></td><td>国家代码（36 国）</td><td><code>?country=DE</code></td></tr>
        <tr><td><code>state</code></td><td>州/省</td><td><code>?country=US&state=CA</code></td></tr>
        <tr><td><code>city</code></td><td>城市名</td><td><code>?city=Los Angeles</code></td></tr>
        <tr><td><code>free</code></td><td>1=美国免税州</td><td><code>?free=1</code></td></tr>
      </table>` : `<p>See README.md for full console & URL API guide.</p>`,
    faq: () => lang === "zh" ? `
      <h4>Q: 生成的地址是真实存在的吗？</h4>
      <p>是的，城市、邮编、坐标均来自 GeoNames 真实官方库；开启 OpenStreetMap 选项时街道名直接来自地图官方测绘数据。</p>
      <h4>Q: IP 区域预选如何运作？</h4>
      <p>工具会智能查询当前节点出口 IP 的经纬度与行政区划，自动切换至该国并将筛选器锁定在该城市，生成同城真实住宅地址。</p>` : `<p>See FAQ in documentation.</p>`
  };

  /* ================= 启动 ================= */
  function boot() {
    const p = new URLSearchParams(location.search);
    let cc = (p.get("country") || localStorage.getItem("addr_country") || "US").toUpperCase();
    if (!DATA[cc]) cc = "US";
    currentCountry = cc;

    initCountrySelect();
    initContinentTabs();
    initFlagChips();
    initComboboxes();
    restoreFilters();
    applyI18n();
    bind();

    const hasUrlFilter = p.has("state") || p.has("city") || p.has("house") || p.has("free");
    if (hasUrlFilter) {
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
      if (window._combos) {
        window._combos.selectState(stateVal);
        window._combos.selectCity(p.get("city") || "");
      }
      if (p.get("house") === "0") $("chkHouse").checked = false;
      if (p.get("house") === "1") $("chkHouse").checked = true;
    }

    const opts = {};
    if (p.get("free") === "1") opts.taxFree = true;
    if (hasUrlFilter && $("selState").value) opts.state = $("selState").value;
    if (hasUrlFilter && $("selCity").value) opts.city = $("selCity").value;

    generate(opts);
  }

  boot();
})();
