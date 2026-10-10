# MEL ONE 本地浏览器验收

日期：2026-10-10。候选地址 http://127.0.0.1:5173/，非线上版本。安装的 Chrome、无界面模式、390×844 / 1440×1000、DPR 1；没有网络或 CPU 降速。不是 Lighthouse、CrUX 或生产 CWV 报告。

## 检查范围

可复现脚本：`scripts/verify-seo-browser.cjs`。默认使用本机已有 Playwright 和 Chrome；其他机器可设置 `SEO_PLAYWRIGHT_MODULE` / `SEO_CHROME_EXECUTABLE`。`SEO_PREVIEW_ORIGIN` 仅接受 localhost / 127.0.0.1，禁止用于生产站。所有非本地请求被拦截，不发送 analytics 或客户询盘。

- 移动端14页：首页、服务总页、5个新服务页、服务标准、1篇修订指南、Norwood / Modbury 地区页、Modbury assessment-only 案例、About、Contact。
- 桌面4页：首页、flyscreen、服务标准、Contact。
- 每页 HTTP200、一个H1、HTTPS www规范链接、全部图片可解码、无横向溢出；记录首屏H1/CTA状态。
- 菜单展开、Escape关闭并恢复焦点；电话点击 `click_to_call` 排队。
- 空表单错误；真实本地503保持用户输入且不记成功转化；拦截模拟200后重置表单并排队 `generate_lead`。
- 实际本地CSP响应头下记录 `securitypolicyviolation` 与页面脚本错误；保存截图及机器输出到被忽略的 `.seo-cache/browser-final/`。

Google tag远程脚本在该脚本中被空响应替代。因此只验证内联bootstrap、队列、本站交互及本地CSP兼容性，不验证真实Google脚本运行、GA4服务器收到事件或真实邮件送达。发布后的授权实测仍必要。

## 初次最终检查及修正

18页功能与结构检查通过，CSP违规0、页面脚本错误0。查看移动首页与桌面flyscreen截图，内容层级、原Logo、案例照片与CTA正常。

早期性能基线的观察器没有覆盖初次渲染；本次把观察器放在页面脚本执行前，发现部分移动导航的初始布局跳动。不能用旧的“短导航未观察到偏移”结果宣称CWV达标。来源追踪确认：延迟JS把导航设为hidden时，页头从607.75px降到86px。3次正常与3次延迟500ms加载均复现0.530678的位移和；仅阻断该脚本时没有这个折叠，排除了图片加载原因。

修正：已有哈希保护的head bootstrap在body首次绘制前设置增强标记；移动CSS立即显示关闭状态。原菜单/Escape交互保留，不依赖远程Google脚本。JS完全禁用时显示导航链接；脚本资源加载失败时移除增强标记，恢复链接。失败后的恢复可能产生布局重排，这是保留导航可用性的降级行为，不计为正常加载达到稳定的证据。

保留 `scripts/diagnose-layout-shift.cjs`：`ASSERT_STABLE=1 node scripts/diagnose-layout-shift.cjs`。修正后3次正常、3次延迟加载的初始位移和均为0；3次脚本阻断及3次JS禁用均可访问导航。失败降级其中一次出现恢复重排，已明确区分。

## 最终结果

最终源码 `3007cac`，主预览5173已重启加载匹配的CSP头：18页全部通过，初始短导航位移和最大值0、CSP违规0、脚本错误0；菜单、电话队列、无效表单、503保留输入、模拟200成功队列均通过。移动与桌面首页H1和主CTA在首屏可见，全部检查页面无横向溢出，照片可解码。

这次本地首页观察到移动LCP2064ms / 桌面208ms；与全量测试同时执行，且不同于早期基线的观察起点和运行负载，不作前后性能改善比较。原始结果仅作本地短导航诊断，CLS这里为观察窗口内非近期输入位移之和，不是生产p75指标或完整会话窗口值；INP未测量。

控制端最终 `npm test` 100/100通过；build97HTML、check96indexable pages /4161local references通过。机器证据在 `.seo-cache/final-test.log` 和 `.seo-cache/browser-final/results.json`；缓存/截图不进入Git。生产响应头、真实GA运行与收件、邮件送达和真实用户CWV，仍须获准发布后另行验证。
