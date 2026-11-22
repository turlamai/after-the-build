# 造完之后：AI 时代普通人的技术通识课

> 答案免费，问题稀缺。AI 替你造出了东西，这本书教你把它真正拿在手里。

一本写给「用 AI 造东西的非程序员」的书。他们不需要学编程，需要的是另一套常识：程序住在哪里、谁能访问它、哪些东西是秘密、钱花在哪、数据丢了怎么办、坏了怎么问。全书按「翻车现场 → 为什么 → 怎么办 → 带走的问题」同一骨架展开，概念讲到「能预测后果」为止，工具只当插图，十年后读仍成立。

## 结构

| 部 | 章节 | 主题 |
|---|---|---|
| 开篇 | 序章 | 一个只有你自己能打开的网页（localhost 悬案） |
| 第一部：世界观 | 第 1-5 章 | 平台形态 / 文件 / 命令行与 GUI / 编程语言 / 网络 |
| 第二部：造完之后 | 第 6-11 章 | 部署 / 验收排错 / 密钥 / 成本 / 数据备份 / 版本依赖 |
| 第三部：拿住之后 | 第 12-14 章 | 安全 / 什么时候该找人 / 维护 |
| 第四部：一页纸 | 第 15 章 + 附录 A-C | 四十个问题 / 黑话词典 / 问 AI 模板库 / 全书概念地图 |

第 15 章（四十个问题）是全书浓缩，可单独抽出使用；每个问题括号内标注了展开它的章节。

## 本地构建与预览

```bash
npm install
npm run build   # 生成 docs/index.html（单文件、无运行时 JS、含深色模式与打印样式）
```

预览直接用浏览器打开 `docs/index.html`。

## 部署

站点是纯静态单文件，任意静态托管皆可。GitHub Pages 路线（已配置）：

1. 仓库 `turlamai/after-the-build`，Pages 源为 main + `/docs`；
2. 自定义域名 `afterthebuild.jrtx.site`：`docs/CNAME` 文件 + DNS CNAME 记录（`afterthebuild` → `turlamai.github.io`）；
3. DNS 生效后 GitHub 自动签发证书，开启 Enforce HTTPS。

## 设计契约

- 视觉令牌对齐家族标准：`tlai-product/references/design-standard.md`（修订 2026-11-minimal-family）与 `turlamai/racket-programming` 的 `design/DESIGN.md`（2026-11-11 契约）。令牌值单一真源是 `build.mjs` 内的 CSS（亮暗成对），不在文档复制数值表。
- 组件语义沿用家族词汇：FeedbackBox（有帮助/反馈问题/编辑本章/读者反馈）、ChapterNav（上一章/返回目录/下一章，正文末尾固定）、侧栏当前章 accent 标亮、代码块双主题深底「展品」式。
- 已记录例外：单文件静态站无构建框架；内联最小 JS 仅两处（TOC 当前章高亮、有帮助态的 localStorage 记忆）；SelectionPill（选中浮出反馈）暂未移植，见 racket 站 components/PageFeedback.tsx；无自托管字体（系统栈）。

## 写作规范

- 排版遵循 tlai-note 共享创作规范（盘古之白、段落 50-160 字、标题层级、加粗与 CJK 边界等）；
- 交付前以 `node --experimental-strip-types ~/Sync/ZCode/skills/tlai-note/scripts/lint.ts --mode=format` 全量检查；
- 源文件为 `chapters/*.md`，`docs/index.html` 为构建产物，改内容只改 md 再重新 build。

## 状态

- v0.4 全稿完成（2026-11-22）：18 个章节文件 + 9 张 SVG 配图，体系结构见附录 C 概念地图。待通读修订。
- 待定项：书名（工作标题《造完之后》，备选《答案免费，问题稀缺》）、许可协议、封面与配图（可用 tlai-illustrate 占位符方案补）。
- 序章故事基于作者家庭真实经历，人物未具名；如需发布请作者确认表述。
