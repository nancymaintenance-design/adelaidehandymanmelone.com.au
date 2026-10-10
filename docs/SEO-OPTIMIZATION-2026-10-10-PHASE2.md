# MEL ONE SEO 第二阶段本地优化记录

日期：2026-10-10。范围：现有静态站点的图片元数据一致性、Service 服务区域、Article 回归覆盖与地区内容盘点。仅更新本地候选，不 push、不部署、不提交任何外部资料。

## 本次变更

1. 页面完成首页替换、侧栏处理后，从最终 main 主体选择首张有内容意义的原始图片。排除 logo、空 alt、aria-hidden 图片及 task-wall 装饰纹理。`og:image`、新增的 `twitter:image` 与 `WebPage.primaryImageOfPage.url` 指向同一绝对 URL，并跟随 `SITE_ORIGIN`。
2. 首页使用实际呈现的 Burnside 铺砖清洗前照片；服务详情使用其已有服务插图；案例详情使用第一张记录照片；含案例的区域 hub 使用其首张可见案例卡片照片。没有内容图片的联系页、指南、suburb 和 404 使用已有 Greater Adelaide 服务区域图作为社交分享兜底，但不生成 `primaryImageOfPage`，也不把兜底图写入 Article。
3. 九个服务详情的 `Service.areaServed` 从已配置的八个区域派生；suburb 的本地 City 覆盖声明保留。未新增承诺或扩大服务区域。
4. 每个已发布 news、guide、case 必须恰好有一个 Article；案例 image 数组必须与源记录所有照片及顺序完全一致；没有配图的指南与 news 不输出 image。继续不补造 `dateModified`。
5. 修正原设计文档中业务图片的措辞，明确共享 LocalBusiness 使用服务区域插图，而 WebPage 使用本页实际内容图片。
6. 修正旧资产测试：原测试仅因过时的首页 OG 引用了已被替换的概念 hero 而通过；现在明确检查 main 中实际 Burnside 照片与装饰纹理，避免把 head 元数据误当成可见内容。

这轮没有改变可见页面布局、业务事实、页面数量、收录策略或既有图片文件。服务页已有 `src/seo-refresh.mjs` 内容优化、案例和指南链接，本轮未重复扩写。

## 32 个 suburb 内容盘点

数据依据：`service-areas.json` 的 popularSuburbs、`suburb-guidance.json`、内容包的案例记录，以及构建后的 32 个 suburb 页面 FAQ。以下是精确文本比较，未做忽略地名后的语义去重；唯一文本不等于已证明独特价值。

| 项目 | 总数 | 唯一文本数 | 多余重复次数 |
|---|---:|---:|---:|
| 实际 description | 32 | 32 | 0 |
| localContext | 32 | 16 | 16 |
| guidance.focus | 32 | 32 | 0 |
| guidance 首条 FAQ 问题 | 32 | 32 | 0 |
| guidance 首条 FAQ 答案 | 32 | 32 | 0 |
| 页面全部 FAQ 问题 | 128 | 128 | 0 |
| 页面全部 FAQ 答案 | 128 | 128 | 0 |

localContext 有 8 组重复，每组 3 个 suburb，共 24 页使用区域通用背景；其余 8 页使用各自源记录背景。每组多余重复 2 次，总计 16 次。重复组如下，顺序对应下表各区域：Adelaide CBD / Kent Town / Bowden；Burnside / Kensington / Magill；Goodwood / Parkside / Millswood；Thebarton / Torrensville / Brompton；West Beach / Glenelg / Semaphore；Prospect / Campbelltown / Golden Grove；Crafers / Aldgate / Blackwood；Brighton / Hallett Cove / Morphett Vale。

18 个案例覆盖 13/32 个 suburb（40.625%），其余 19 个没有同 suburb 实拍案例。8/8 区域 hub 均有本区域案例。案例数量是公开记录覆盖，不代表全部已完成项目；其中 assessment-only 仍保持原有标识。

| 区域 | 4 个 suburb 的实拍记录覆盖（括号为案例数） | 已覆盖 suburb |
|---|---|---:|
| Adelaide CBD & North Adelaide | Adelaide CBD (1)、North Adelaide (2)、Kent Town (0)、Bowden (0) | 2/4 |
| Eastern Suburbs | Norwood (1)、Burnside (2)、Kensington (1)、Magill (0) | 3/4 |
| Inner South | Unley (1)、Goodwood (1)、Parkside (0)、Millswood (0) | 2/4 |
| Inner West | Mile End (1)、Thebarton (0)、Torrensville (0)、Brompton (0) | 1/4 |
| Western Suburbs | Henley Beach (1)、West Beach (0)、Glenelg (0)、Semaphore (0) | 1/4 |
| North & North-East | Modbury (2)、Prospect (1)、Campbelltown (0)、Golden Grove (0) | 2/4 |
| Adelaide Hills & Foothills | Stirling (2)、Crafers (0)、Aldgate (0)、Blackwood (0) | 1/4 |
| Southern Suburbs | Marion (2)、Brighton (0)、Hallett Cove (0)、Morphett Vale (0) | 1/4 |

这些计数用于下一轮人工内容审查，不据此直接 noindex 或合并。下一步应结合真实项目、独特物业/通行情境、GSC 查询及页面表现，优先审查无本地实拍覆盖且背景共用的页面；不能仅更换地名制造差异。

## 验证记录

- TDD 首轮选择 4 项：1 项既有 Article 回归通过，3 项新行为按预期失败（旧首页 OG 图片、无图兜底、缺少 Service.areaServed）；实现后同组 4/4 通过。
- 首次完整套件为 89/91，通过外暴露 2 项失败：旧首页资产断言，以及测试 fixture 删除全部案例导致既有指南链接校验失败。旧断言已改成 main 实际照片；无案例区域 fixture 改为仅调整该区域案例归属，保留有效链接与案例记录。
- 最终 `node --test tests/mel-one-seo.test.cjs tests/mel-one-approved-assets.test.cjs`：21/21 通过，0 失败（SEO 文件 19 项、资产文件 2 项）。
- 最终 `npm test`：91/91 通过，0 失败、0 跳过、0 取消。
- `npm run build`：成功生成 91 个 HTML 页面。
- `npm run check`：90 个可索引页面、91 个 HTML 文件、3727 个本地引用通过；canonical、资产、联系信息、privacy 与 FAQ 一致性通过。sitemap 继续为 90 条，404 继续 `noindex,follow`。
- 图片测试涵盖首页真实照片、服务插图、案例第一张照片、带实拍的区域 hub、无实拍区域 fixture、无图 suburb/指南/联系页、404，并核对资产存在及 main 图片与 schema/OG/Twitter 一致。

本地预览继续使用已运行的 `http://localhost:5173/`，构建更新其静态内容，没有重启服务。

## 审计中尚待输入或实测的建议

- GBP/Place ID、SAB 设置、营业时间、经纬度、priceRange、社媒所有权和 sameAs、目录 NAP 一致性：需要可核验业务资料或账号权限，不能从网站外链推定所有权。
- 团队姓名、经历、保险/执照、售后及保证：需要可公开且已确认的资料。
- 指南特色图、准确修改日期与 sitemap lastmod：需要实际获批图片和内容修改记录，不能使用共享兜底图或今天日期补齐。
- GSC/Bing 验证与提交、GA4/GBP 搜索和转化基线、CrUX/PSI/CWV：需要相应数据/访问；当前本地测试不证明生产排名、收录、富结果资格或真实用户性能。Logo 压缩与 hero preload 应在测量和授权品牌源文件基础上安排。
- CSP nonce/hash、完整浏览器表单/分析回归，以及生产单跳跳转/安全响应头：前一阶段已有本地配置测试；本轮没有部署，所以生产响应仍需获准发布后验证。
- 评价邀请、评价公开展示、真实本地引用与外联：需要业务来源和具体执行范围。本轮未发送请求或新增评价、评分、目录资料。

本记录不表示审计建议已全部完成。
