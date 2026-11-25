# AI 时代的基本功：面向 AI 时代的计算机技术基础

> 理解技术原理，掌握工程方法，准确与 AI Agent 协作。

一本面向非计算机专业人士的计算机技术基础教材，也为技术人员提供跨领域知识入口。无需预先掌握编程，但需要理解技术术语、工作机制、工程约束及验证方法，以便与 AI Agent 准确协作。

## 结构

| 部 | 章节 | 主题 |
|---|---|---|
| 开篇 | 序章 | 一个只有你自己能打开的网页（localhost 悬案） |
| 第一部：计算机技术基础 | 第 1-12 章 | 软件平台 / 硬件 / 文件系统 / Shell / 编程语言 / 算法与性能 / 操作系统 / 数据表示 / 网络 / 云计算 / AI 基础 / Agent 协作 |
| 第二部：工程实践 | 第 13-18 章 | 部署 / 测试与排错 / 凭据管理 / 成本 / 数据库与恢复 / 版本管理 |
| 第三部：安全与工程判断 | 第 19-23 章 | 信息安全 / 密码学 / 隐私工程 / 工程决策 / 可靠性 |
| 第四部：综合验证与参考 | 第 24 章 + 附录 A-C | 知识检验与验收 / 技术术语索引 / Agent 工程协作模板 / 学习路线 |

第 24 章（五十个问题）是全书浓缩，可单独抽出使用；每个问题括号内标注了展开它的章节。

## 本地构建与预览

```bash
npm ci
npm run build   # 生成多页静态站：docs/index.html + docs/ch/*.html + style.css / app.js / search.js
```

预览直接用浏览器打开 `docs/index.html`（或 `npx serve docs`）。

## 部署

站点是纯静态多页书站（封面 + 每章一页，对齐 racket-programming 架构），任意静态托管皆可。GitHub Pages 路线（已配置）：

1. 仓库 `turlamai/fundamentals`，Pages 源为 main + `/docs`；
2. 构建产物：`docs/index.html`（封面与全书目录）+ `docs/ch/*.html`（28 个章节页）+ `style.css` / `app.js` / `search.js`（共享）+ `og.png`；
3. 自定义域名 `fundamentals.jrtx.site`：`docs/CNAME` 文件 + DNS CNAME 记录（`fundamentals` → `turlamai.github.io`，仅 DNS 灰云）；
4. DNS 生效后 GitHub 自动签发证书，开启 Enforce HTTPS。旧域名深链由 DNS/仓库改名后的 GitHub 自动重定向承接。

## 设计契约

- 视觉令牌对齐家族标准：`tlai-product/references/design-standard.md`（修订 2026-11-minimal-family，§8 长文与书籍站点基线）与 `turlamai/racket-programming` 的 `design/DESIGN.md`（2026-11-11 契约）。令牌值单一真源是 `build.mjs` 内的 CSS（亮暗成对），不在文档复制数值表。
- 组件语义沿用家族词汇：FeedbackBox（有帮助/反馈问题/编辑本章/读者反馈）、ChapterNav（上一章/返回目录/下一章，跨部翻页标明所属部，正文末尾固定）、侧栏当前章 accent 标亮、代码块双主题深底「展品」式、全文搜索（⌘K 或 /，↑↓ Enter）、正文字号三档、SelectionPill（选中浮出「反馈这段」）。
- 已记录例外：纯静态多页站无构建框架（build.mjs 一次生成全部页面）；内联 vanilla JS 约 300 行；无自托管字体（系统栈）。

## 写作规范

- 首次引入核心术语时给出标准中文、英文名称和常用缩写；定义与机制先于类比。
- 每章应包含技术背景、核心概念、运行机制、真实案例、可验证实践、Agent 协作及知识检验；不机械重复固定栏目。
- 不回避必要的代码、命令、协议字段和公式；解释输入、输出、环境要求和适用边界。
- 区分概念、实现与具体产品；标明简化模型的假设，避免无依据的绝对化结论。
- 保留章节 URL，检查跨章引用、术语索引、示意图及生成站点一致性；实验默认使用测试环境和虚构数据。
- 交付前逐章技术审阅、执行示例与构建；未验证的结果必须明确标注。

- 排版遵循 tlai-note 共享创作规范（盘古之白、段落 50-160 字、标题层级、加粗与 CJK 边界等）；
- 交付前以 `node --experimental-strip-types ~/Sync/ZCode/skills/tlai-note/scripts/lint.ts --mode=format` 全量检查；
- 源文件为 `chapters/*.md`，`docs/` 为构建产物，改内容只改 md 再重新 build。

## 状态

- 技术教材化修订：28 个正文及附录源文件已完成首轮改写，待构建、实验及技术复核通过后发布。
- 序章保留作者家庭经历；正式出版前核对事实表述。
