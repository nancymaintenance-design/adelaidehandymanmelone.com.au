# Curated bilingual llms.txt / 双语精选索引维护

Scope: Adelaide Handyman MEL ONE only. Production origin is the existing `build.mjs` configuration, not a request Host. No runtime model calls, crawling or extra dependencies.

范围仅为 Adelaide Handyman MEL ONE。正式域名复用现有构建配置，不读取请求 Host；没有运行时模型调用、爬站或额外依赖。

## Single selection / 单一精选清单

- Edit `src/llms-selection.json` only when a genuinely useful published destination changes. Each entry records an existing English owner route and group; `/zh/` pairing is derived. Do not add all sitemap routes or change owner URLs for this file.
- 仅在重要公开页面发生变化时修改精选清单；每项只保存原有英文路由和分组，自动取得中文对应页。不要复制全量 sitemap，也不要为索引重新分配 Owner。
- `src/llms-index.mjs` reads final bilingual HTML after the existing labels, translation and machine-data stages. Titles use H1; descriptions use the first substantive main paragraph. Check both languages whenever that paragraph changes.
- 标题取实际 H1，说明取正文首段；正文变更时复核中英两版含义。没有单独维护的页面摘要数据库。
- The final stage replaces the generator's historical intermediate indexes. The published root file contains 18 reviewed pairs (36 links); the existing `/zh/llms.txt` URL contains the same 18 Chinese destinations. Both are generated from the same selection and HTML.
- 最终阶段替换旧生成器的中间索引；根文件为 18 对 / 36 个链接，保留的中文索引为同一清单中的 18 个中文页面。不新增 Markdown 页面副本或 llms-full.txt。

## Validation / 验证

Run `pnpm i18n:extract`, `pnpm build`, `node --test test/llms-*.test.mjs`, `pnpm check:bilingual` and `pnpm test`. The final generator rejects missing pages, sitemap omissions, noindex, incorrect languages, canonical or reciprocal alternates before replacing either index. It does not fix SEO metadata or policy silently.

执行上述命令；缺页、sitemap 缺项、noindex、语言、canonical 或互指错误会阻止生成，不会静默修复页面。索引介绍中的新增说明也必须中英文同步审阅；它不出现在网站界面，不属于 HTML 翻译提取器的词条。

GET the local `/llms.txt` and `/zh/llms.txt` and inspect the body, UTF-8 content type, and both Accept-Language variants. GET every selected production URL with low concurrency, finite timeouts/retries; record final URL, body, language and metadata. A simulated User-Agent success is not verified bot access or indexing.

Run `node scripts/check-llms-links.mjs` for the read-only production URL check. It emits JSON to stdout, uses two workers with 15-second timeouts and at most two attempts, and never saves or deploys anything. A production index mismatch is expected before an approved release; the target HTML pages must still pass their checks.

本地 GET 验证真实文本、UTF-8 类型及不同 Accept-Language；线上逐条低并发检查，超时不得当作 404。新文本索引必须在另获发布授权后，才能声称线上已验证。

## Safety and release / 安全与发布

This change does not alter HTML, CSS/JS, routes, canonical, hreflang, robots, WAF, training-crawler policy or editor drafts. robots.txt is not authentication. Do not bypass deployment protection or publish without approval. Revert only this curated-index integration if needed; leave existing page/policy changes alone.

不修改页面、爬虫策略、后台鉴权或草稿。不自动推送、部署；需要回退时仅撤销本索引生成改动，不回退其他网站成果。llms.txt is optional navigation, not a Google ranking/indexing or AI recommendation switch.
