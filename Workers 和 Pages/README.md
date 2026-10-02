# 地址生成器 · Cloudflare Workers / Pages 版

与主项目完全相同的**多国地址生成器**（36 国真实城市数据、本地化生成、OSM 真实街道、Google 地图、中英双语），改造为可直接部署到 **Cloudflare Pages + Pages Functions** 的版本。

**零存储依赖**：不使用 KV / R2 / D1 / Durable Objects——生成逻辑 100% 在浏览器本地运行；Functions 只做两个数据代理（转发 GeoNames 与人口普查文件，边缘缓存后透传），完全在免费额度内。

## 目录内容

```
index.html               页面结构
update.html              数据更新页（浏览器内重建 countries_data.js）
css/style.css            样式
js/countries_data.js     36 国真实城市/邮编/坐标（构建产物，含数据版本戳）
js/names.js              各国元数据 + 24 语种人名池
js/app.js                生成逻辑、国家切换、OSM 真实街道、地图、i18n
functions/api/ping.js    GET  /api/ping      探测更新服务（返回 cf:true）
functions/api/zip/[cc].js GET /api/zip/{CC}  GeoNames 邮编 zip 代理（36 国白名单 + 边缘缓存）
functions/api/gaz.js     GET  /api/gaz       美国人口普查 ZCTA 坐标表代理（领地坐标用）
_headers                 静态资源缓存策略
wrangler.toml            Cloudflare 配置
```

## 部署方法

### 方式一：命令行（推荐）

```bash
cd "Workers 和 Pages"
npx wrangler login                 # 首次使用需登录（浏览器授权）
npx wrangler pages deploy . --project-name=adress --branch=main
```

完成后输出形如 `https://xxxx.adress.pages.dev` 的线上地址（项目名可自行更换）。

### 方式二：GitHub 自动部署

在 Cloudflare Dashboard → Workers & Pages → 创建 Pages 项目 → 连接 GitHub 仓库 `zhengwuji/adress`：
- 构建命令：留空
- 输出目录：`Workers 和 Pages`

之后每次 `git push` 自动重新部署。

## 数据更新（无需 KV 的方案）

GeoNames 数据每日更新。由于 Pages 是纯静态托管、且不使用任何存储，更新采用**浏览器内重建**方案：

1. 打开线上站点，点击国家卡片右下角「**更新数据**」→ 自动跳转到 `/update.html`（也可直接访问该地址）；
2. 点「开始更新」→ 页面经 `/api/zip/{CC}` 代理依次拉取 36 国最新数据（约 100MB，1-3 分钟），在你的浏览器中完成解析、过滤、构建（逻辑与主项目 `tools/build_data.py` 完全一致）；
3. 构建完成后下载新的 `countries_data.js`，替换项目中的 `js/countries_data.js`；
4. 重新部署（`npx wrangler pages deploy .` 或推送 GitHub 触发自动部署），页面上的「数据版本」时间戳即为新版本。

> 为什么不直接在服务端重建？Workers 免费版有 CPU 时间限制且无免费持久存储；浏览器端重建不受限制、零成本，且数据仍然只经过本站代理的官方源头（GeoNames / 美国人口普查局）。

## 本地预览

```bash
cd "Workers 和 Pages"
npx wrangler pages dev . --port 8788
# 打开 http://127.0.0.1:8788/
```

本地预览同样带 Functions 代理，「更新数据」全流程可测试。

## 与主项目的差异

| 项目 | 主项目（本地版） | 本目录（Cloudflare 版） |
|------|------------------|--------------------------|
| 生成功能 | 相同（纯前端） | 相同（纯前端） |
| 运行方式 | `python server.py` / 双击 index.html | Cloudflare Pages 托管 |
| 数据更新 | 页面内一键重建（server.py 接口）或命令行 | `/update.html` 浏览器内重建 + 重新部署 |
| 存储 | 本地文件 | 无（不用 KV/R2，仅 Functions 代理 + 边缘缓存） |

## 免责声明

本工具生成的所有身份信息、地址、电话、邮箱及卡号均为**随机虚构数据**：卡号仅通过 Luhn 格式校验、无对应真实账户，**不可用于任何真实交易**。仅供软件开发与测试使用，请勿用于伪造身份、欺诈或其他非法用途。
