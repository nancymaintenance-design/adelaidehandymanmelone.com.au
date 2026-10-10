# MEL ONE SEO 第三阶段：营业信息与企业身份精修

日期：2026-10-10。仅本地候选版本，未经确认不 push GitHub、不触发 Vercel 部署，也不修改 GSC/GA4/GBP 账号设置。

## 本轮依据与实现范围

用户确认：每周七天，09:00–21:00；网站现有 ABN 和社媒外链为该业务资料。营业时间按 Adelaide 当地时间展示，不写固定 UTC 偏移，避免夏令时误解。

- 将已确认营业时间、法定公司名称、ABN、ACN、注册查询链接及现有社媒链接集中管理，避免页脚、About、Contact 和结构化数据各写一套。
- LocalBusiness 增加 `legalName`、ABN `PropertyValue` 标识、七天的 `openingHoursSpecification`，以及 Instagram、YouTube、TikTok 的 `sameAs`。
- 营业时间同时呈现在页脚和 About / Contact 内容中，`llms.txt` 同步企业身份与时间。
- Google Reviews 短链接继续保留为可点击外链；尚未可靠解析到稳定商家资料 URL，暂不放入 `sameAs`，不编造 Place ID、评分或评论数。
- 保留现有 Adelaide 联系地址、电话、邮箱、服务地区、案例、canonical 与页面收录策略。不增加节假日保证、24 小时服务、到店接待、执照或保险承诺。

Google 官方将营业时间列为 LocalBusiness 可表达的信息；结构化数据不保证搜索结果一定展示。[Google LocalBusiness 文档](https://developers.google.com/search/docs/appearance/structured-data/local-business)

## ABN 核查与地址区别

ABN Lookup 返回公司名称 MEL ONE PROPERTY MAINTENANCE PTY LTD、ABN 39 666 325 408、ACN 666 325 408，与网站一致。其记录中的主营业地区为 **VIC 3027**；网页抓取记录显示提取日期为 2026-09-29，不把它描述成 Adelaide 地址的注册证明。[ABN 官方记录](https://abr.business.gov.au/ABN/View?abn=39666325408)

业务方已确认：该 ABN 法律实体运营 Adelaide 服务，拥有独立 Adelaide 团队，63 Pirie St Adelaide SA 5000 为真实经营场所，来访需预约。公司、团队和该地址的关系已确认；GBP / 发票 / 目录资料仍应按已批准的联系方式维护，本轮未代为提交外部修改。

## GSC 实测基线

读取方式：本机已有 Google CLI / ADC 凭据，只读请求。技能默认配置虽未配置，但已有凭据可读取该站 GSC，不能因此报告“没有 Google 权限”。GA4 是否可读取单独判断，GSC 权限不等于 GA4 权限。

请求窗口：2026-09-10 至 2026-10-07，28 天，web / final。最新有数据日期是 10 月 6 日，10 月 7 日没有返回行，因此以下是窗口内已返回的 final 数据，不宣称每一天均已完成处理。GSC 日期按太平洋时区。对比期：2026-08-13 至 2026-09-09。

| 本期属性级指标 | 值 |
|---|---:|
| 点击 | 3 |
| 展示 | 89 |
| CTR | 3.37% |
| 平均排名 | 17.48 |

首页贡献全部 3 次点击；首页页面级展示 56，CTR 5.36%，平均排名 5.61。对比期返回无行，不据此计算增长率，也不推断网站此前没有访客。

已披露查询中，`shower screen repairs adelaide` 有 7 次展示、平均排名约 41.29；`home repairs adelaide` 有 3 次展示、平均排名约 17.67。样本很小，只列为后续观察方向，不据此保证排名或扩建相近页面。已有 shower screen 服务页与真实案例应优先维护，而非添加无证据地区页。

查询披露行、页面行与属性汇总的展示数不能直接相加或强制对齐：隐私过滤和聚合方式不同。完整读取结果、收录核查与 GA4 权限诊断见同目录 `GOOGLE-CLI-CHECK-2026-10-10.md`。

抽样 URL Inspection 确认首页和 `/service-areas/` 均为 Submitted and indexed，Google / 用户 canonical 一致，robots 和索引允许、抓取成功。只验证这两条 URL，不推断全站已收录。线上 sitemap 返回 79 条已提交 web URL、0 错误、0 警告；本地候选有 90 条，数量不同需获准发布后核对，不能将旧接口的 indexed:0 当成“全站零收录”。

## 后续优先级

1. 先确认本地页面营业时间、ABN、社媒与联系方式正确；批准后才安排发布和生产验证。
2. 补齐 GA4 analytics.readonly 授权后，将 `G-9KMWMVLZ3` 对应到真正的数字 Property ID，核查自然搜索落地页、`click_to_call` 与 `generate_lead`；Measurement ID 不能当作 Property ID。
3. 持续积累 GSC 查询与页面数据，再决定标题/摘要精调；当前不宜用单次个位数展示判断页面成败。
4. 沿用第二阶段盘点，为缺乏同 suburb 实拍案例的页面补充真实证据；不虚构项目、评价或团队资质。

## 验证与本地预览

- 任务实现提交：`7045abb`；聚焦测试 28/28、完整测试 92/92 通过；新回归先确认缺少 legalName 的预期失败，再实现后通过。
- 构建生成 91 个 HTML；检查通过 90 个可索引页面、3727 个本地引用。
- 独立任务审查：规范符合、质量通过，无 Critical / Important / Minor 问题。
- 最终全分支审查（`520b349..ae7534c`）：可交本地验收，无 Critical / Important / Minor 问题；生产跳转/响应头、真实邮件与分析接收不在本次本地验证结论内。
- 控制器核查首页、About、Contact、服务区域总页的生成 JSON-LD：七天 09:00–21:00、ABN、三个社媒一致。
- 本地 HTTP 核查首页、About、Contact、带参数 Contact、llms.txt 均返回 200 并包含确认时间。带参数联系页 canonical 仍为 `/contact/` 干净 URL；GSC 出现带参数 URL 不直接认定为重复索引缺陷。

本地预览：[首页](http://localhost:5173/) · [关于我们](http://localhost:5173/about/) · [联系页](http://localhost:5173/contact/)。本地表单不发送真实咨询。未部署，线上尚未包含本轮变化。
# Confirmed identity correction — 10 October 2026

The user has confirmed that MEL ONE PROPERTY MAINTENANCE PTY LTD is the operating legal entity for the Adelaide service, with an independent Adelaide team and genuine business premises at 63 Pirie St Adelaide SA 5000. Visits are by appointment. Any earlier question in this report about the company/address relationship is superseded by this confirmation; it is not an unresolved ABR-address issue. Broader-domain contact differences do not authorize copying contact details or claiming cross-domain ownership. The website retains 0416 614 281 and admin@melonemaintenance.com.au.
