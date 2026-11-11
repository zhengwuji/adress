# 真实地址与身份生成器 (Realistic Worldwide Address & Identity Generator)

一个纯前端的**全球真实地址与数字身份生成器**，支持全球 **36 个国家/地区** 的真实住宅与商业地址，完美对齐国际标准与主流电商/外贸支付表单规范。内置完整虚拟身份画像、银行测试数据（IBAN/ABA/SWIFT）、信用卡批量生成器与校验器、IP 区域归属地精准生成、Google/高德双地图引擎与火星坐标纠偏。

> 零后端存储依赖，无需配置数据库，生成逻辑 100% 在浏览器本地运行。可直接双击 `index.html` 使用，或一键部署至 Cloudflare Pages。

---

## ✨ 核心功能与亮点

- 🌐 **全球 36 国真实城市/邮编库**：涵盖北美、欧洲、东亚、东南亚、大洋洲、拉美与中东，数据源自 GeoNames（CC BY 4.0）与美国人口普查局 ZCTA Gazetteer，真实准确。
- 📍 **智能 IP 区域预选与定位生成**：支持自动识别当前节点/代理的公网出口 IP 或手动输入 IPv4/IPv6，自动匹配同省同城真实地址，跨境电商与账号防风控必备。
- 👤 **完整数字身份与虚拟指纹**：
  - **基本生理信息**：全名、性别、生日、年龄、星座、头发颜色、血型、身高/体重/BMI 计算、最高学历。
  - **就业与财务**：职业、所属公司、部门级别、合理币种预估月薪、银行支票账户、模拟消费交易明细。
  - **银行测试数据（按国家格式）**：IBAN（MOD97 校验位真实有效，16 国）、美国 ABA 路由号（校验和有效）、加拿大 transit+institution、英国、印度 IFSC、澳洲 BSB、新西兰、日本、中国 CNAPS、巴西、墨西哥 CLABE、南非、韩国，附 SWIFT/BIC 码。
  - **信用卡品牌跟随国家**：中国身份出银联、日本出 JCB、俄罗斯出 Mir、印度出 RuPay、土耳其出 Troy 等，Luhn 合法。
  - **网络与安全指纹**：用户名、随机强密码（大小写+数字+特殊字符）、密保问题与真实回答、操作系统、最新主流桌面/移动端 User-Agent、虚拟文档 IP、MAC 地址、UUID。
- 💳 **信用卡批量生成器**（对齐 BetterBugs.io 并增强）：
  - **12 个卡组织**：Visa / AmericanExpress / ChinaUnionPay（16-19 位）/ DinersClub / Discover / JCB / MasterCard / Maestro / RuPay / Mir / Troy / UATP，全部真实 IIN 号段 + Luhn 校验位补齐。
  - 1-10 张批量生成，Amex 4 位 CID、其余 3 位 CVV，有效期 1-5 年（MM/YY），随机持卡人姓名（跟随所选国家语料）。
  - 品牌配色卡面可视化，任意字段点击复制；支持 **复制全部** 与 **CSV 导出**。
- 🛡️ **信用卡校验器**：粘贴任意卡号（12-19 位）即时校验 Luhn 有效性并按 IIN 号段识别卡组织，边输入边校验。
- 🎲 **种子可复现生成（Seed Mode）**：`USAddressGen.generate({ seed: "demo42" })` 相同种子产出完全一致的身份集，QA 自动化测试可固定数据重放。
- 📋 **Google 账单地址表单（逐字段复制）**：同构对齐 Google / Stripe 账单表单，点击任意输入格直接复制，支持一键复制整表与标准多行地址块（含美/英/加/印等国 GSTIN/税号）。
- 🗺️ **双地图引擎与火星坐标纠偏**：
  - 支持 **Google Maps**、**高德地图 (AMap)** 与 **OpenStreetMap** 三大引擎切换。
  - 内置 **WGS-84 转 GCJ-02（火星坐标系）算法**，精准纠正国内地图坐标偏移，并提供一键高德/谷歌外部导航链接。
- 🔤 **多语言展示与中文拼音对照**：
  - 地址卡片支持 **原语言 (Native)**、**English (拼音)** 与 **中文对照** 实时切换。
  - 针对中国地址提供标准英文拼音邮政规范（如 `No. 88 South Zhongguancun Street, Haidian District, Beijing, 100081, China`）。
- 🔍 **可搜索 Combobox 下拉选择器**：支持关键词即时模糊搜索州/省与城市，并显示实时可用数量统计（如 `匹配 15 / 56 州`）。
- 🌍 **按大洲分类国家导航**：支持按北美洲、欧洲、东亚/东南亚、中东/南亚、大洋洲、拉美/非洲分类筛选，一键无缝换国。
- ⭐ **收藏夹与最近历史记录**：基于 `localStorage` 离线持久化存储，支持单条地址加星收藏、恢复最近 20 条历史生成记录、单独复制或批量导出。
- 📦 **批量生成与 CSV / JSON 导出**：可一次性随机生成 5/10/20/50 条真实地址，支持在线表格预览与一键导出 UTF-8 CSV / JSON。
- 🇺🇸 **美国地址细节增强**：ZIP+4 扩展邮编、可开关的 Apt/Suite/Unit 公寓单元号。
- ⚡ **全局快捷键与交互优化**：
  - 按 **空格键 (Space)** 立即重新随机生成；
  - 页面任意字段文本 **双击 (Double Click)** 快速复制。

---

## 🚀 运行方式

### 方式一（本地服务，推荐）
```bash
python server.py
# 打开 http://127.0.0.1:8790/
```
提供本地静态资源托管与数据更新接口（`/api/ping`、`/api/client-context`、`/api/update`）。

### 方式二（静态 HTTP 服务）
```bash
python -m http.server 8080
# 打开 http://127.0.0.1:8080/
```

### 方式三（纯前端直接打开）
直接双击根目录下的 `index.html`（通过 `file://` 打开，全部生成功能、收藏夹与导出功能 100% 完整可用）。

---

## ☁️ Cloudflare Pages / Workers 部署

项目包含完整的 Cloudflare Pages 部署目录 `Workers 和 Pages/`：
1. 本地目录：`Workers 和 Pages/`
2. 包含 Pages Functions 接口：
   - `GET /api/client-context`：利用 Cloudflare 边缘环境自动读取访问者的 IP、国家、省份、城市与经纬度。
   - `GET /api/zip/{CC}`：GeoNames 邮编数据代理转发与边缘缓存。
   - `GET /api/gaz`：美国人口普查 ZCTA 坐标表代理。
   - `GET /api/ping`：更新服务状态探测。

### 部署命令
```bash
cd "Workers 和 Pages"
npx wrangler pages deploy . --project-name=adress --branch=main
```

---

## 🛠️ URL 参数与控制台 API

### URL 参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `country` | 国家代码（36 国） | `?country=DE`、`?country=JP` |
| `state` | 地区（美国用州缩写，其他国家支持名称或代码） | `?country=US&state=CA`、`?country=IN&state=Delhi` |
| `city` | 城市名 | `?city=Los Angeles` |
| `house` | 1=强制门牌号，0=允许无门牌号 | `?house=1` |
| `free` | 1=仅限美国免税州 (AK/DE/MT/NH/OR) | `?free=1` |
| `cards` | 深链批量生成测试卡（品牌:数量，1-10） | `?cards=JCB:5`、`?cards=ChinaUnionPay` |
| `seed` | 种子模式，相同 seed 复现相同身份集 | `?seed=demo42`、`?country=JP&seed=demo42` |
| `unit` | 0=关闭美国公寓/单元号 | `?country=US&unit=0` |

### JavaScript 控制台 API
页面全局挂载 `USAddressGen` 对象：
```javascript
USAddressGen.generate()                      // 随机生成
USAddressGen.generate({ state: 'CA' })       // 指定地区生成
USAddressGen.generate({ taxFree: true })     // 免税州生成
USAddressGen.generate({ seed: 'demo42' })    // 种子可复现生成
USAddressGen.setCountry('JP')                // 切换国家
USAddressGen.generateCards('JCB', 5)         // 批量生成 5 张 JCB 测试卡
USAddressGen.validateCard('37726726799758')  // 校验卡号: { valid, brand, formatted }
USAddressGen.setAmapKey('你的高德Key')        // 本地配置高德地图 Key（仓库不存放任何密钥）
USAddressGen.cards                           // 当前批量生成的卡片数组
USAddressGen.getFavorites()                  // 获取所有收藏夹数据
USAddressGen.exportFavoritesCsv()            // 导出收藏夹 CSV
USAddressGen.last                            // 获取最近一次生成的完整数据对象
```

### 测试基线
```bash
node tools/test_gen.mjs   # 卡组织/IBAN/ABA/PRNG 不变量测试（无需浏览器）
```

---

## 🔐 安全说明
仓库内**不存放任何第三方服务密钥**：高德地图 Key 仅保存在访问者浏览器本地 `localStorage`（控制台 `USAddressGen.setAmapKey(...)` 或 URL 参数 `?amapkey=...` 配置），未配置时自动回退 Google Maps / OpenStreetMap 引擎。

---

## 📜 免责声明
本工具生成的所有个人姓名、生日、地址、电话、邮箱、卡号、银行账号、密码及网络指纹均为**随机虚构数据**：
- 卡号仅通过 Luhn 校验位算法生成，银行账号/IBAN/SWIFT 仅符合格式与校验位规则，均没有真实银行账户关联，**不可用于任何真实交易**。
- 请勿将本工具用于任何违法欺诈、伪造个人身份或其他非法用途。仅供软件开发测试、表单布局验证及风控测试使用。
