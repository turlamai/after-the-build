# 造完之后：AI 时代普通人的技术通识课

> 答案免费，问题稀缺。AI 替你造出了东西，这本书教你把它真正拿在手里。

一本写给「用 AI 造东西的非程序员」的书，覆盖计算机全景常识。他们不需要学编程，需要的是另一套常识：机器由什么组成、程序住在哪里、谁能访问它、哪些东西是秘密、钱花在哪、数据丢了怎么办、AI 到底是什么、坏了怎么问。全书按「翻车现场 → 为什么 → 怎么办 → 带走的问题」同一骨架展开，概念讲到「能预测后果」为止，工具只当插图，十年后读仍成立。

## 结构

| 部 | 章节 | 主题 |
|---|---|---|
| 开篇 | 序章 | 一个只有你自己能打开的网页（localhost 悬案） |
| 第一部：世界观 | 第 1-11 章 | 平台形态 / 机器解剖 / 文件 / 命令行与 GUI / 编程语言 / 操作系统 / 数据与编码 / 网络 / 云的地图 / AI 全景 / 和 AI 分工 |
| 第二部：造完之后 | 第 12-17 章 | 部署 / 验收排错 / 密钥 / 成本 / 数据备份 / 版本依赖 |
| 第三部：拿住之后 | 第 18-22 章 | 安全 / 加密与哈希 / 隐私与追踪 / 什么时候该找人 / 维护 |
| 第四部：一页纸 | 第 23 章 + 附录 A-C | 五十个问题 / 黑话词典 / 问 AI 模板库 / 全书概念地图 |

第 23 章（五十个问题）是全书浓缩，可单独抽出使用；每个问题括号内标注了展开它的章节。

## 本地构建与预览

```bash
npm install
npm run build   # 生成多页静态站：docs/index.html + docs/ch/*.html + style.css / app.js / search.js
```

预览直接用浏览器打开 `docs/index.html`（或 `npx serve docs`）。

## 部署

站点是纯静态多页书站（封面 + 每章一页，对齐 racket-programming 架构），任意静态托管皆可。GitHub Pages 路线（已配置）：

1. 仓库 `turlamai/after-the-build`，Pages 源为 main + `/docs`；
2. 构建产物：`docs/index.html`（封面与全书目录）+ `docs/ch/*.html`（27 个章节页）+ `style.css` / `app.js` / `search.js`（共享）+ `og.png`；
3. 自定义域名 `afterthebuild.jrtx.site`：`docs/CNAME` 文件 + DNS CNAME 记录（`afterthebuild` → `turlamai.github.io`）；
4. DNS 生效后 GitHub 自动签发证书，开启 Enforce HTTPS。旧单页深链（`/#章 slug`）由首页脚本自动重定向到对应章节页。

## 设计契约

- 视觉令牌对齐家族标准：`tlai-product/references/design-standard.md`（修订 2026-11-minimal-family）与 `turlamai/racket-programming` 的 `design/DESIGN.md`（2026-11-11 契约）。令牌值单一真源是 `build.mjs` 内的 CSS（亮暗成对），不在文档复制数值表。
- 组件语义沿用家族词汇：FeedbackBox（有帮助/反馈问题/编辑本章/读者反馈）、ChapterNav（上一章/返回目录/下一章，跨部翻页标明所属部，正文末尾固定）、侧栏当前章 accent 标亮、代码块双主题深底「展品」式、全文搜索（⌘K 或 /，↑↓ Enter）、正文字号三档。
- 已记录例外：纯静态多页站无构建框架（build.mjs 一次生成全部页面）；内联 vanilla JS 约 250 行（搜索/进度/续读/复制/抽屉/字号/键盘翻章/旧深链重定向）；SelectionPill（选中浮出反馈）暂未移植，见 racket 站 components/PageFeedback.tsx；无自托管字体（系统栈）。

## 写作规范

- 排版遵循 tlai-note 共享创作规范（盘古之白、段落 50-160 字、标题层级、加粗与 CJK 边界等）；
- 交付前以 `node --experimental-strip-types ~/Sync/ZCode/skills/tlai-note/scripts/lint.ts --mode=format` 全量检查；
- 源文件为 `chapters/*.md`，`docs/` 为构建产物，改内容只改 md 再重新 build。

## 状态

- v1.1 全稿完成（2026-11-22）：多页架构（封面 + 27 章节页）+ 17 张 SVG 配图 + 商业级阅读体验。待通读修订。
- 待定项：书名（工作标题《造完之后》，备选《答案免费，问题稀缺》）、许可协议、封面图。
- 序章故事基于作者家庭真实经历，人物未具名；如需发布请作者确认表述。
