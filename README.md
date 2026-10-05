# 美国地址生成器 (US Address Generator)

一个纯前端的**多国地址生成器**，随机生成真实格式的身份与地址信息（全名、生日、街道、城市、地区、邮编、电话、邮箱、职业、公司、测试卡号）。内置 **36 个国家/地区** 的真实城市数据，可在页面右上角一键切换国家，实现方式与最初的美国生成器完全一致。

> 无需安装任何依赖，无需联网即可生成（联网仅用于增强功能：OSM 真实街道、Google 地图、更新数据）。

## 功能

- **全球 36 国一键切换**：右上角「国家/地区」卡片，下拉选择 + 12 国旗标快捷键 + 随机国家按钮；美国默认 56 个州/地区、4046 城市，其他国家各约 300 个真实城市（共 13000+）
- **真实数据底库**：城市、邮编、坐标来自 GeoNames 邮编数据库（CC BY 4.0）与美国人口普查局 ZCTA Gazetteer
- **本地化生成**：各国使用本地语料——人名（24 个语种池，中日韩按「姓 名」顺序）、真实区号与本地电话格式、本地邮箱域名、符合当地书写习惯的街道/门牌格式（如德 `Hauptstraße 12`、法 `12 Rue de la Paix`、中 `中山路88号`、日 `2-3-1 街区名`）
- **OpenStreetMap 真实街道**：可选开启，联网查询所选城市的真实街道名（Nominatim 定位 + Overpass API 取路名，多镜像自动回退），缓存于浏览器本地，失败自动回退内置街道库
- **Google Maps 地图显示**：免密钥嵌入地图定位生成的地址
- **筛选选项**：按地区/城市筛选（标签随国家自动变化：州/省/邦/大区/都道府県…）；「仅生成包含门牌号的地址」开关
- **账单地址表单（可直接复制）**：中列新增一张与 Google 账单地址表单同构的卡片——First name / Last name / Billing address / City / State·Province / 邮编（美国 ZIP code、英国 Postcode、印度 PIN code…）/ Country·Region，印度等国家额外显示 GSTIN（可选）；**点击任意字段即复制该字段的值**，另有「复制整张表单」与「复制地址块」（姓名+街道+城市州邮编的多行地址块，Hero 卡片也有一键入口）
- **快速操作**：复制全部信息 / 随机生成 / 随机免税地址（美国 AK、DE、MT、NH、OR）/ 导出 JSON
- **热门城市**：按当前国家自动切换（纽约、伦敦、柏林、东京银座…），支持折叠
- **中英双语**：右上角「语言」切换，自动记忆
- **手动更新数据**：点击「更新数据」即可重新下载 GeoNames 最新数据（详见下文），数据版本号实时显示
- **关于 / API指南 / 常见问题**：导航栏弹窗说明文档

## 运行方式

```bash
# 方式一（推荐）：本地服务，支持页面内一键更新数据
python server.py
# 打开 http://127.0.0.1:8765/

# 方式二：普通静态服务（生成功能完整，更新按钮会提示命令行方式）
python -m http.server 8765

# 方式三：直接双击 index.html（file:// 打开，生成功能完整）
```

## 使用方法

1. **启动页面**：任选上面一种运行方式打开页面（推荐 `python server.py`）。
2. **生成地址**：点击蓝色区域的「生成地址」按钮，右侧卡片立即显示一套随机身份信息（姓名、生日、职业、公司、街道地址、电话、邮箱、信用卡测试卡号），下方同步显示 Google 地图定位。
3. **切换国家**：右侧「国家/地区」卡片中，用下拉菜单选择 36 国之一，或点击国旗快捷按钮、骰子按钮随机换国；切换后所有筛选、热门城市、地址格式自动跟随。
4. **按地区/城市筛选**：左侧「筛选选项」中选择州/省等地区和城市，再点生成，即只在该范围内随机。
5. **复制 / 导出**：每张卡片右上角有一键复制按钮；「快速操作」区支持复制全部信息、导出 JSON 文件。
6. **免税地址**：点「随机免税地址」只在美国 5 个免税州（AK、DE、MT、NH、OR）中生成。
7. **真实街道（可选）**：勾选「使用 OpenStreetMap 真实街道名」，联网查询所选城市的真实路名，结果缓存在浏览器本地。
8. **更新数据**：点国家卡片右下角「更新数据」重新拉取 GeoNames 最新邮编库（详见下节）。
9. **切换语言**：右上角「语言」按钮中/英切换，自动记忆选择。

## 手动更新数据

GeoNames 邮编数据库每日更新。两种更新方式：

1. **页面内更新**（需 `python server.py` 启动）：点击国家卡片右下角「更新数据」→ 显示实时进度日志 → 完成后自动刷新页面。
2. **命令行更新**（任何运行方式都可用）：

```bash
python tools/update_data.py    # 等价于 python tools/build_data.py --force
```

## URL 参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `country` | 国家代码（36 国） | `?country=DE` |
| `state` | 地区（美国用州缩写，其他国家支持行政码或地区英文全名） | `?country=DE&state=Bayern`、`?country=IN&state=Delhi` |
| `city` | 城市名 | `?country=JP&city=Ginza` |
| `house` | 1=强制门牌号，0=允许无门牌号 | `?house=1` |
| `free` | 1=美国免税州 | `?free=1` |

## 控制台 API

页面暴露全局对象 `USAddressGen`：

```js
USAddressGen.generate()                    // 全随机（当前国家）
USAddressGen.generate({ state: 'TX' })     // 指定地区
USAddressGen.generate({ taxFree: true })   // 美国免税州
USAddressGen.setCountry('DE')              // 切换国家
USAddressGen.country                       // 当前国家代码
USAddressGen.stats('JP')                   // {regions, cities}
USAddressGen.last                          // 最近一次生成的记录
USAddressGen.billing                       // 账单表单字段对象（firstName/lastName/street/city/region/zip/country/gst）
USAddressGen.addrBlock                     // 可直接粘贴的多行地址块
USAddressGen.billingFormText()             // 「复制整张表单」的多行文本
USAddressGen.setLang('en')                 // 切换语言
```

数据更新接口（`server.py`）：`POST /api/update` 触发重建、`GET /api/update/status` 进度、`GET /api/ping` 探测。

## 目录结构

```
index.html              页面结构
server.py               本地服务（静态文件 + 数据更新接口）
css/style.css           样式
js/countries_data.js    36 国真实城市/邮编/坐标（构建产物，含数据版本戳）
js/names.js             各国元数据（中英文名/地区标签/电话/邮箱/街道池/门牌风格）+ 24 语种人名池
js/app.js               生成逻辑、国家切换、OSM 真实街道、地图、i18n、更新弹窗
tools/build_data.py     数据构建脚本（--force 强制重新下载）
tools/update_data.py    命令行一键更新入口
```

> 注：`tools/*.txt` 为 GeoNames 原始数据缓存（约 120MB），**不随仓库分发**、已在 `.gitignore` 中排除；首次构建时脚本会自动下载。

重建数据：

```bash
python tools/build_data.py            # 使用 tools/ 下缓存
python tools/build_data.py --force    # 强制重新下载全部国家
```

## 更新内容

### v1.1.1（2026-10-05）— 账单地址表单

- **新增「账单地址表单」卡片**：字段顺序与 Google Payments 账单地址表单一致（First name / Last name / Billing address / City / State·Province / 邮编 / Country·Region / GSTIN 可选），逐字段点击即复制，可直接粘贴到站长后台或支付页表单
- **国家化字段标签**：邮编按国家显示 ZIP code / Postcode / PIN code / CEP 等；印度、澳大利亚、新西兰、加拿大额外显示 GSTIN / ABN / GST / HST（可选）字段，税号按各国格式随机生成且标注为虚构
- **地址块一键复制**：「复制地址块」输出「姓名 + 街道 + 城市/州/邮编 + 国家」多行文本，Hero 卡片顶部同步提供入口
- **URL 参数增强**：`?country=IN&state=Delhi` 现在同时支持内部行政码（`state=07`）与地区英文全名（`state=Delhi`），URL 参数优先于本地记忆的筛选
- 复制地址信息卡片中的街道/城市/地区/邮编后，账单表单同步展示所复制的那条地址（不再与「地址信息」卡片错位）

### v1.1.0（2026-10-02）— 全球化升级

- **新增 36 国切换**：Hero 区右侧新增「国家/地区」卡片——下拉选择 36 国 + 12 国国旗快捷按钮 + 随机国家按钮，美国默认打开
- **真实城市数据扩展到全球**：接入 GeoNames 邮编数据库，共 13000+ 真实城市（美国 56 州/地区 4046 城，其余各国各约 300 城），地区筛选标签随国家自动变化（州/省/邦/大区/都道府県…）
- **本地化生成**：24 个语种人名池（中日韩按「姓 名」顺序）、各国真实区号与电话格式、本地邮箱域名、当地街道/门牌书写风格（德 `Hauptstraße 12`、法 `12 Rue de la Paix`、中 `中山路88号`、日 `2-3-1 街区名` 等）
- **OpenStreetMap 真实街道**：Nominatim 定位 + Overpass API 取路名（3 镜像自动回退），浏览器本地缓存，失败回退内置街道库
- **热门城市随国家切换**：纽约、伦敦、柏林、东京银座等 16 城快捷入口
- **一键更新数据**：页面内点击「更新数据」即可重新下载最新 GeoNames 数据，实时显示进度日志，完成后自动刷新；也支持命令行 `python tools/update_data.py`
- **中英双语界面**、URL 参数直达（`?country=DE&state=Bayern`）、控制台 API（`USAddressGen`）
- 数据版本号显示：国家卡片实时展示当前数据构建时间

### v1.0.0（2026-10-02）— 首个版本

- 美国地址生成器：姓名、生日、职业、公司、街道地址、州/城市/邮编、电话、邮箱、Luhn 校验测试卡号
- 按 50 州 + DC + 5 海外领地筛选城市（共 4046 城市），免税州快捷生成
- 一键复制、导出 JSON、Google Maps 免密钥地图嵌入
- 纯前端实现，无任何依赖，双击 `index.html` 即可使用

## 数据来源

- 城市与邮编：[GeoNames 邮政数据库](https://download.geonames.org/export/zip/)（CC BY 4.0）
- 美国领地邮编坐标：美国人口普查局 [ZCTA Gazetteer](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/)（公有领域）；领地城市→邮编映射为人工整理
- 真实街道：[OpenStreetMap](https://www.openstreetmap.org)（ODbL，经 Nominatim / Overpass API）
- 地图：Google Maps 免密钥嵌入

## 免责声明

本工具生成的所有身份信息、地址、电话、邮箱及卡号均为**随机虚构数据**：卡号仅通过 Luhn 格式校验、无对应真实账户，**不可用于任何真实交易**。仅供软件开发与测试使用，请勿用于伪造身份、欺诈或其他非法用途。
