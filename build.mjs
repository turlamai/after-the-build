// Build a multi-page book site from chapters/*.md into docs/.
// Family design tokens follow turlamai/racket-programming design/DESIGN.md (2026-11-11 contract)
// and tlai-product design-standard.md (2026-11-20-minimal-family, §8 book-site baseline).
// Layout parity with the racket book site (2026-11-23): home = no sidebar, centered;
// chapter pages = collapsible sidebar + per-part collapse; content column 65ch.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const REPO = 'turlamai/fundamentals';
const SITE = 'https://fundamentals.jrtx.site';
const BOOK = 'AI 时代的基本功';

const TOC = [
  {
    "part": "",
    "files": [
      "00-prologue.md"
    ]
  },
  {
    "part": "第一部 · 信息与计算",
    "desc": "从信息、位和编码到计算规则",
    "files": [
      "01-information.md",
      "02-binary.md",
      "03-bytes.md",
      "04-text-encoding.md",
      "05-computation.md"
    ]
  },
  {
    "part": "第二部 · 计算机内部",
    "desc": "数字电路、指令、处理器与存储",
    "files": [
      "06-digital-logic.md",
      "07-storing-state.md",
      "08-memory-addresses.md",
      "09-instructions.md",
      "10-processor.md",
      "11-storage-hierarchy.md"
    ]
  },
  {
    "part": "第三部 · 程序与操作系统",
    "desc": "语言、运行环境、内核、进程和文件",
    "files": [
      "12-programming-language.md",
      "13-programming-rules.md",
      "14-code-to-execution.md",
      "15-computer-startup.md",
      "16-operating-system.md",
      "17-processes-threads.md",
      "18-virtual-memory.md",
      "19-files-and-directories.md",
      "20-system-permissions.md",
      "21-terminal-shell.md"
    ]
  },
  {
    "part": "第四部 · 应用软件",
    "desc": "界面、模块、构建及平台",
    "files": [
      "22-input-output-events.md",
      "23-graphical-interface.md",
      "24-software-modules.md",
      "25-libraries-frameworks.md",
      "26-build-packaging.md",
      "27-platforms-compatibility.md",
      "28-software-updates.md"
    ]
  },
  {
    "part": "第五部 · 网络与 Web",
    "desc": "从设备通信到浏览器与网络应用",
    "files": [
      "29-network-communication.md",
      "30-local-network.md",
      "31-ip-addresses.md",
      "32-routing-internet.md",
      "33-tcp-udp.md",
      "34-ports-sockets.md",
      "35-dns.md",
      "36-http.md",
      "37-browser.md",
      "38-frontend-backend.md",
      "39-localhost-deployment.md"
    ]
  },
  {
    "part": "第六部 · 数据与数据库",
    "desc": "数据格式、查询、事务与恢复",
    "files": [
      "40-data-formats.md",
      "41-structured-data.md",
      "42-relational-database.md",
      "43-sql.md",
      "44-database-indexes.md",
      "45-database-transactions.md",
      "46-data-durability.md"
    ]
  },
  {
    "part": "第七部 · 服务器与云计算",
    "desc": "部署、虚拟化、云服务与容量",
    "files": [
      "47-server-environment.md",
      "48-hosting-and-domains.md",
      "49-virtual-machines.md",
      "50-containers.md",
      "51-cloud-services.md",
      "52-load-balancing-cdn.md",
      "53-capacity-and-cost.md"
    ]
  },
  {
    "part": "第八部 · 软件工程",
    "desc": "需求、测试、版本、发布与可靠性",
    "files": [
      "54-requirements.md",
      "55-algorithms-and-measurement.md",
      "56-software-testing.md",
      "57-debugging.md",
      "58-git-version-control.md",
      "59-ci-build-pipeline.md",
      "60-release-and-rollback.md",
      "61-observability.md",
      "62-software-reliability.md"
    ]
  },
  {
    "part": "第九部 · 安全与隐私",
    "desc": "身份、密码学、HTTPS 与数据保护",
    "files": [
      "63-authentication-authorization.md",
      "64-security-boundaries.md",
      "65-cryptographic-hash.md",
      "66-symmetric-encryption.md",
      "67-public-key-cryptography.md",
      "68-signatures-certificates.md",
      "69-tls-https.md",
      "70-secret-management.md",
      "71-data-privacy.md"
    ]
  },
  {
    "part": "第十部 · AI 与 Agent",
    "desc": "模型、上下文、检索与可验证执行",
    "files": [
      "72-models-and-data.md",
      "73-training-inference.md",
      "74-tokens.md",
      "75-context-and-attention.md",
      "76-embeddings-retrieval.md",
      "77-rag.md",
      "78-tool-calling.md",
      "79-tool-protocols.md",
      "80-agent-execution.md",
      "81-agent-verification.md"
    ]
  },
  {
    "part": "第十一部 · 从想法到产品",
    "desc": "完整教学项目与工程验收",
    "files": [
      "82-product-requirements.md",
      "83-product-architecture.md",
      "84-running-the-project.md",
      "85-product-verification.md",
      "86-maintaining-a-product.md"
    ]
  },
  {
    "part": "附录 · 参考与复习",
    "desc": "术语索引、Agent 协作模板、知识路线与五十个问题",
    "files": [
      "appendix-a-glossary.md",
      "appendix-b-ai-templates.md",
      "appendix-c-concept-map.md",
      "appendix-d-review.md"
    ]
  }
];

const LEGACY = {
  "01-platforms": "27-platforms-compatibility",
  "02-machine": "10-processor",
  "03-files": "19-files-and-directories",
  "04-cli-gui": "21-terminal-shell",
  "05-language": "12-programming-language",
  "06-efficiency": "55-algorithms-and-measurement",
  "07-os": "16-operating-system",
  "08-data-shapes": "41-structured-data",
  "09-network": "29-network-communication",
  "10-cloud": "51-cloud-services",
  "11-ai-landscape": "72-models-and-data",
  "12-ai-collab": "80-agent-execution",
  "13-deploy": "47-server-environment",
  "14-debug": "57-debugging",
  "15-secrets": "70-secret-management",
  "16-cost": "53-capacity-and-cost",
  "17-data": "42-relational-database",
  "18-versions": "58-git-version-control",
  "19-security": "64-security-boundaries",
  "20-crypto": "65-cryptographic-hash",
  "21-privacy": "71-data-privacy",
  "22-ask-for-help": "81-agent-verification",
  "23-maintenance": "86-maintaining-a-product",
  "24-50-questions": "appendix-d-review",
  "06-os": "16-operating-system",
  "07-data-shapes": "41-structured-data",
  "08-network": "29-network-communication",
  "09-cloud": "51-cloud-services",
  "10-ai-landscape": "72-models-and-data",
  "11-ai-collab": "80-agent-execution",
  "12-deploy": "47-server-environment",
  "13-debug": "57-debugging",
  "14-secrets": "70-secret-management",
  "15-cost": "53-capacity-and-cost",
  "16-data": "42-relational-database",
  "17-versions": "58-git-version-control",
  "18-security": "64-security-boundaries",
  "19-crypto": "65-cryptographic-hash",
  "20-privacy": "71-data-privacy",
  "21-ask-for-help": "81-agent-verification",
  "22-maintenance": "86-maintaining-a-product",
  "23-50-questions": "appendix-d-review"
};

const slug = (name) => name.replace(/\.md$/, '');
const titleOf = (f) => readFileSync(join('chapters', f), 'utf8').match(/^# (.+)$/m)?.[1] ?? f;

const entries = TOC.flatMap(({ part, files }) => files.map((f) => ({ file: f, slug: slug(f), title: titleOf(f), part })));
const entryOf = (f) => entries.find((e) => e.file === f);
const partShort = (part) => (part ? part.split(' · ')[0] : '开篇');

// Plain-text extraction for the client-side search index.
const stripMd = (md) =>
  md
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, ' '))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>`|#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const SEARCH_INDEX = JSON.stringify(
  entries.map((e) => ({ slug: e.slug, title: e.title, url: `ch/${e.slug}.html`, text: stripMd(readFileSync(join('chapters', e.file), 'utf8')) }))
);

// Family FeedbackBox semantics, ported from racket-programming components/PageFeedback.tsx.
const feedbackBox = (e) => {
  const pageUrl = `${SITE}/ch/${e.slug}.html`;
  const issueUrl = `https://github.com/${REPO}/issues/new?` + new URLSearchParams({
    title: `【反馈】${e.title}`,
    body: `章节链接：${pageUrl}\n\n问题描述：\n`,
  }).toString();
  const editUrl = `https://github.com/${REPO}/edit/main/chapters/${e.file}`;
  const issuesUrl = `https://github.com/${REPO}/issues?q=is%3Aissue`;
  return `<div class="feedback">
  <p class="fb-q">这一章读下来还顺利吗？</p>
  <p class="fb-sub">发现错误、没讲清楚、例子跑不起来——都欢迎告诉我们，这本书会持续修订。</p>
  <div class="fb-actions">
    <button type="button" class="fb-helpful" data-key="${e.slug}">有帮助</button>
    <a class="fb-issue" target="_blank" rel="noopener noreferrer" href="${issueUrl}">反馈问题或建议</a>
  </div>
  <div class="fb-links">
    <a target="_blank" rel="noopener noreferrer" href="${editUrl}">在 GitHub 上编辑本章</a>
    <a target="_blank" rel="noopener noreferrer" href="${issuesUrl}">查看读者的反馈</a>
  </div>
</div>`;
};

// Family ChapterNav semantics: prev / back to home / next, always at the end of the article.
// Crossing a part boundary, the target's part is stated (family invariant).
const chapterNav = (e) => {
  const i = entries.indexOf(e);
  const prev = entries[i - 1];
  const next = entries[i + 1];
  const link = (target, cls, fmt) => {
    if (!target) return `<span class="${cls} is-disabled" aria-hidden="true"></span>`;
    const cross = target.part !== e.part ? `${partShort(target.part)} · ` : '';
    return `<a href="${rel(e, pageUrlOf(target))}" class="${cls}">${fmt(cross + target.title)}</a>`;
  };
  return `<nav class="chapter-nav" aria-label="章节导航">
  ${link(prev, 'nav-prev', (t) => '← ' + t)}
  <a href="${rel(e, 'index.html')}" class="nav-toc">返回目录</a>
  ${link(next, 'nav-next', (t) => t + ' →')}
</nav>`;
};

const rel = (e, path) => (e ? `../${path}` : path);
const pageUrlOf = (target) => (target ? `ch/${target.slug}.html` : 'index.html');

const bodyFor = (e) => {
  const md = readFileSync(join('chapters', e.file), 'utf8');
  return marked.parse(md)
    .replace(/<table>[\s\S]*?<\/table>/g, (table) => '<div class="table-scroll" role="region" aria-label="技术表格" tabindex="0">' + table + '</div>')
    .replace(/^<h1>[\s\S]*?<\/h1>\n/, '') // chapter title comes from the page template, not the body
    .replace(
      /<img src="\.\.\/assets\/([\w-]+\.svg)" alt="([^"]*)"\s*\/?>/g,
      (m, file, alt) =>
        readFileSync(join('assets', file), 'utf8').replace('<svg ', `<svg role="img" aria-label="${alt}" `),
    );
};

// Shared sidebar: the full book tree, current chapter marked (family invariant).
// Part headers are collapsible (racket parity); state persisted per part.
const sidebar = (activeSlug, root) => {
  const a = (e) => `<li><a href="${root}ch/${e.slug}.html"${e.slug === activeSlug ? ' class="active"' : ''}>${e.title}</a></li>`;
  const navHtml = TOC.map(({ part, files }, gi) => {
    const key = `p${gi}`;
    const chevron = part
      ? `<button type="button" class="part-toggle" data-part="${key}" aria-expanded="true"><span class="chev">‹</span><span class="part-name">${part}</span></button>`
      : `<div class="part"><span class="part-name">开篇</span></div>`;
    return `${chevron}<ul data-part-ul="${key}">${files.map((f) => a(entryOf(f))).join('')}</ul>`;
  }).join('');
  return `<nav id="toc" aria-label="目录">
  <a class="book" href="${root}index.html">${BOOK}</a>
  <div class="book-sub">面向 AI 时代的计算机技术基础</div>
  <div class="search">
    <input id="search-input" type="search" placeholder="搜索全书　（⌘K 或 /）" aria-label="搜索全书">
    <div id="search-results" aria-live="polite"></div>
  </div>
  ${navHtml}
  <div class="toc-foot">
    <div class="fs-ctl">
      <button id="fs-dec" aria-label="缩小正文字号">A−</button>
      <button id="fs-inc" aria-label="放大正文字号">A＋</button>
    </div>
    <a href="https://github.com/${REPO}/issues/new?title=%E3%80%90%E5%8F%8D%E9%A6%88%E3%80%91AI%20%E6%97%B6%E4%BB%A3%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%8A%9F" target="_blank" rel="noopener noreferrer">问题反馈</a>
  </div>
</nav>`;
};

const css = `
:root {
  --bg: #FAF9F6; --surface: #FFFFFF; --raised: #F5F3EE;
  --line: #EBE8E0; --line-strong: #E0DCD2;
  --ink: #2A2820; --ink-2: #4A4740; --mute: #878278; --faint: #A39E93;
  --accent: #C4683F; --accent-strong: #A8532D; --accent-soft: #FFF4EE;
  --code-bg: #2A2820; --code-ink: #F5F3EE; --ok: #3E7D4E;
  --reader-fs: 16px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1C1A16; --surface: #24221D; --raised: #2C2A24;
    --line: #35322B; --line-strong: #3F3B33;
    --ink: #EDEAE3; --ink-2: #C9C3B6; --mute: #9A9485; --faint: #7C766A;
    --accent: #E08A67; --accent-strong: #FFA98C; --accent-soft: #382A20;
    --code-bg: #14120E; --code-ink: #EDEAE3; --ok: #7FB88A;
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 56px; }
body {
  margin: 0; background: var(--bg); color: var(--ink-2);
  font: 400 var(--reader-fs)/1.8 system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  text-rendering: optimizeLegibility;
}
::selection { background: var(--accent-soft); color: var(--ink); }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--mute); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
a { color: var(--accent-strong); text-decoration: none; }
a:hover { text-decoration: underline; }
button { font-family: inherit; }

#progress { position: fixed; top: 0; left: 0; height: 3px; width: 0; background: var(--accent); z-index: 60; }

.topbar { display: none; }
.toc-overlay { display: none; }

#toc {
  position: fixed; inset: 0 auto 0 0; width: 250px; overflow-y: auto;
  padding: 24px 20px 36px; background: var(--surface); border-right: 1px solid var(--line);
  font-size: 13px; line-height: 1.6; display: flex; flex-direction: column;
}
#toc .book { font-weight: 600; color: var(--ink); font-size: 15px; margin-bottom: 2px; display: block; }
#toc a.book:hover { text-decoration: none; color: var(--accent); }
#toc .book-sub { color: var(--faint); font-size: 11px; letter-spacing: 0.05em; margin-bottom: 16px; }
#toc .search { margin-bottom: 12px; }
#toc .search input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--line-strong); border-radius: 6px;
  background: var(--surface); color: var(--ink); font: inherit; font-size: 13px;
}
#toc .search input::placeholder { color: var(--faint); }
#toc .search input:focus { border-color: var(--accent); outline: none; }
#toc .search-results { margin: 8px -6px 0; }
#toc .sr-item { padding: 8px 10px; border-radius: 6px; cursor: pointer; }
#toc .sr-item:hover, #toc .sr-item.sel { background: var(--raised); }
#toc .sr-item .sr-title { color: var(--ink); font-weight: 500; }
#toc .sr-item .sr-snippet { color: var(--mute); font-size: 12px; line-height: 1.6; margin-top: 2px; overflow: hidden; }
#toc .sr-item mark { background: var(--accent-soft); color: var(--accent-strong); padding: 0 2px; border-radius: 3px; }
#toc .sr-empty { color: var(--faint); padding: 8px 10px; }
#toc .part, #toc .part-toggle {
  color: var(--faint); font-weight: 600; font-size: 12px; letter-spacing: 0.02em;
  margin: 24px 0 10px; display: flex; align-items: center; gap: 6px; width: 100%;
  background: none; border: none; padding: 0; cursor: pointer; text-align: left;
}
#toc .part-toggle:hover .part-name { color: var(--mute); }
#toc .part-toggle .chev { display: inline-block; transition: transform 0.15s ease; color: var(--line-strong); }
#toc .part-toggle[aria-expanded="false"] .chev { transform: rotate(180deg); }
#toc ul { list-style: none; margin: 0; padding: 0 0 0 14px; }
#toc ul[data-part-ul].collapsed { display: none; }
#toc li { margin: 8px 0; }
#toc li a {
  display: block; padding: 5px 10px; margin: 0 -10px; border-radius: 6px; color: var(--mute);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#toc li a:hover { color: var(--ink); background: var(--raised); }
#toc li a.active { color: var(--accent); background: var(--accent-soft); font-weight: 500; }
#toc .toc-foot {
  margin-top: auto; padding-top: 20px; border-top: 1px solid var(--line);
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
#toc .toc-foot .fs-ctl { display: flex; align-items: center; gap: 6px; }
#toc .toc-foot button {
  border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink-2);
  border-radius: 6px; padding: 3px 9px; font-size: 12px; cursor: pointer;
}
#toc .toc-foot button:hover { border-color: var(--mute); color: var(--ink); }
#toc .toc-foot a { color: var(--mute); }
#toc .toc-foot a:hover { color: var(--ink); }

/* Desktop sidebar collapse (racket parity): tab sits on the sidebar edge; content re-centers. */
.toc-toggle-btn {
  position: fixed; top: 10px; left: 252px; z-index: 55;
  width: 18px; height: 34px; border: 1px solid var(--line); border-left: none;
  border-radius: 0 8px 8px 0; background: var(--surface); color: var(--faint);
  font-size: 12px; line-height: 1; cursor: pointer; padding: 0;
  transition: left 0.15s ease;
}
.toc-toggle-btn:hover { color: var(--ink); }
body.toc-hidden .toc-toggle-btn { left: 0; border-left: 1px solid var(--line); }
@media (min-width: 961px) {
  #toc { transition: transform 0.15s ease; }
  body.toc-hidden #toc { transform: translateX(-100%); }
}

main { margin-left: 250px; padding: 0 24px; transition: margin-left 0.15s ease; }
body.toc-hidden main { margin-left: 0; }

/* Home: no sidebar at all — everything centered (racket parity). */
body.home main { margin-left: 0; }

#cover { max-width: 65ch; margin: 0 auto; padding: 96px 0 48px; text-align: center; }
#cover .eyebrow { color: var(--faint); font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 20px; }
#cover h1 { font-size: 44px; line-height: 1.2; margin: 0 0 16px; color: var(--ink); letter-spacing: 0.04em; }
#cover .lead { color: var(--ink-2); font-size: 17px; margin: 0 0 10px; }
#cover .tagline { color: var(--mute); font-size: 14px; line-height: 1.9; }
#cover .author { color: var(--faint); margin-top: 24px; font-size: 14px; }
#cover .cta { margin-top: 28px; display: flex; justify-content: center; gap: 12px; }
#cover .btn {
  display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; padding: 10px 18px;
  font-size: 14px; line-height: 1.5; transition: background-color 0.15s ease, border-color 0.15s ease;
}
#cover .btn-primary { background: var(--ink); color: var(--bg); border: 1px solid var(--ink); }
#cover .btn-primary:hover { background: var(--ink-2); text-decoration: none; }
#cover .btn-secondary { background: var(--surface); color: var(--ink-2); border: 1px solid var(--line-strong); }
#cover .btn-secondary:hover { border-color: var(--mute); color: var(--ink); text-decoration: none; }
#resume-top { display: none; max-width: 65ch; margin: 24px auto 0; text-align: center; font-size: 13px; }
#resume-top.show { display: block; }
#resume-top a { color: var(--accent-strong); }

/* Home TOC: part groups with chapter rows (racket parity). */
.home-rule { max-width: 65ch; margin: 0 auto; border-top: 1px solid var(--line); }
.home-toc { max-width: 65ch; margin: 0 auto 72px; }
.ht-part { margin: 40px 0 0; }
.ht-eyebrow { color: var(--faint); font-size: 12px; letter-spacing: 0.08em; }
.ht-title { color: var(--ink); font-size: 18px; font-weight: 600; margin: 4px 0 4px; }
.ht-desc { color: var(--mute); font-size: 13px; margin: 0 0 12px; }
.ht-part ul { list-style: none; margin: 0; padding: 0; }
.ht-part li { border-top: 1px solid var(--line); }
.ht-part li:last-child { border-bottom: 1px solid var(--line); }
.ht-part li a { display: flex; gap: 16px; padding: 12px 4px; color: var(--ink-2); align-items: baseline; }
.ht-part li a:hover { background: var(--raised); text-decoration: none; }
.ht-part li a .ht-arrow { margin-left: auto; color: var(--faint); }
.ht-part li a:hover .ht-arrow { color: var(--accent); }
.ht-num { color: var(--faint); font: 500 13px/1.8 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }

article.chapter { max-width: 65ch; margin: 0 auto; padding: 48px 0 64px; }
article.chapter .eyebrow {
  color: var(--faint); font-size: 12px; letter-spacing: 0.05em;
  padding-bottom: 16px; border-bottom: 1px solid var(--line); margin: 0 0 32px;
}
article.chapter h1 { font-size: 36px; line-height: 1.25; margin: 0 0 8px; color: var(--ink); }
article.chapter > blockquote {
  margin: 20px 0 40px; padding: 14px 20px; border-left: 3px solid var(--accent);
  background: var(--accent-soft); color: var(--ink-2); border-radius: 0 8px 8px 0; font-size: 15.5px;
}
article.chapter > blockquote p { margin: 0; }
h2 { font-size: 28px; line-height: 1.3; margin: 40px 0 16px; color: var(--ink); }
h3 { font-size: 21.6px; margin: 32px 0 12px; color: var(--ink); }
p { margin: 16px 0; }
ul, ol { margin: 16px 0; padding-left: 26px; }
li { margin: 8px 0; }
hr { border: none; border-top: 1px solid var(--line); margin: 40px 0; }
code {
  background: var(--raised); color: var(--accent); padding: 0.15em 0.375em; border-radius: 4px;
  font: 400 0.875em/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
pre { position: relative; background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 16px 20px; overflow-x: auto; }
pre code { background: none; color: var(--code-ink); padding: 0; font-size: 0.875rem; line-height: 1.7; }
.copy-btn {
  position: absolute; top: 8px; right: 8px; border: 1px solid #4A4740; background: rgba(250, 249, 246, 0.12);
  color: #F5F3EE; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer;
}
.copy-btn:hover { background: rgba(250, 249, 246, 0.22); }
.copy-btn.done { color: #7FB88A; border-color: #3E7D4E; }
strong { color: var(--ink); }
.table-scroll { max-width: 100%; overflow-x: auto; margin: 20px 0; border: 1px solid var(--line-strong); border-radius: 6px; }
article.chapter table { border-collapse: collapse; width: 100%; font-size: 0.92em; line-height: 1.65; }
article.chapter th, article.chapter td { padding: 10px 12px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--line); overflow-wrap: anywhere; }
article.chapter th { background: var(--raised); color: var(--ink); font-weight: 600; }
article.chapter tr:last-child td { border-bottom: 0; }
article.chapter p, article.chapter li { overflow-wrap: anywhere; }
article.chapter pre { padding-top: 42px; }
article.chapter svg { display: block; max-width: 100%; height: auto; margin: 24px auto; border: 1px solid var(--line); border-radius: 8px; cursor: zoom-in; }

/* Lightbox: click a diagram to enlarge it to the viewport limit. */
.lightbox {
  display: none; position: fixed; inset: 0; z-index: 80;
  background: rgba(26, 24, 20, 0.72);
  align-items: center; justify-content: center; flex-direction: column;
  padding: 24px; cursor: zoom-out;
}
.lightbox.open { display: flex; }
.lightbox svg {
  display: block; border: none; border-radius: 8px; margin: 0 auto;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35); background: var(--surface); color: var(--ink);
}
.lightbox .lb-caption { margin-top: 14px; color: #EDEAE3; font-size: 13px; text-align: center; max-width: 80vw; }

.feedback {
  margin-top: 64px; padding: 20px 24px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg);
  font-size: 14px;
}
.fb-q { margin: 0; font-weight: 500; color: var(--ink); }
.fb-sub { margin: 4px 0 0; color: var(--mute); }
.fb-actions { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 12px; }
.fb-actions button, .fb-actions .fb-issue {
  display: inline-flex; align-items: center; cursor: pointer;
  border-radius: 6px; padding: 7px 14px; font-size: 14px; line-height: 1.5; font-family: inherit;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.fb-actions button { border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink-2); }
.fb-actions button:hover { border-color: var(--mute); color: var(--ink); }
.fb-actions .fb-issue { border: 1px solid var(--ink); background: var(--ink); color: var(--bg); }
.fb-actions .fb-issue:hover { background: var(--ink-2); border-color: var(--ink-2); text-decoration: none; }
.fb-links { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--line); display: flex; flex-wrap: wrap; column-gap: 16px; row-gap: 4px; font-size: 12px; }
.fb-links a { color: var(--mute); }
.fb-links a:hover { color: var(--ink); }
.fb-sub a { color: var(--accent-strong); }

.chapter-nav {
  margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line);
  display: flex; justify-content: space-between; align-items: baseline; gap: 16px;
  font-size: 13px;
}
.chapter-nav .nav-prev, .chapter-nav .nav-next { color: var(--mute); max-width: 40%; }
.chapter-nav .nav-toc { color: var(--faint); flex-shrink: 0; }
.chapter-nav a:hover { color: var(--accent); text-decoration: none; }
.chapter-nav .is-disabled { color: var(--faint); opacity: 0.5; }

.selection-pill {
  position: fixed; z-index: 55; transform: translateX(-50%);
  border: 1px solid var(--ink); background: var(--ink); color: var(--bg);
  border-radius: 6px; padding: 5px 12px; font-size: 12px; cursor: pointer;
  font-family: inherit;
}
.selection-pill:hover { background: var(--ink-2); }

@media (max-width: 960px) {
  .topbar {
    display: flex; position: sticky; top: 0; z-index: 30; align-items: center; gap: 12px;
    padding: 10px 16px; background: var(--surface); border-bottom: 1px solid var(--line);
  }
  .topbar button {
    border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink);
    border-radius: 6px; padding: 6px 10px; font-size: 15px; cursor: pointer; line-height: 1;
  }
  .topbar .tb-title { font-weight: 600; color: var(--ink); font-size: 14px; }
  .toc-toggle-btn { display: none; }
  .toc-overlay { display: none; position: fixed; inset: 0; background: rgba(26, 24, 20, 0.4); z-index: 40; }
  body.toc-open .toc-overlay { display: block; }
  #toc {
    position: fixed; inset: 0 auto 0 0; width: 300px; z-index: 50;
    transform: translateX(-100%); transition: transform 0.15s ease;
  }
  body.toc-open #toc { transform: translateX(0); }
  main { margin-left: 0; padding-top: 0; }
  #cover { padding-top: 40px; }
  #cover h1 { font-size: 32px; }
  article.chapter h1 { font-size: 28px; }
  .chapter-nav { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  #toc, main, .toc-toggle-btn { transition: none; }
}
@media print {
  #toc, .topbar, #progress, .toc-overlay, .toc-toggle-btn { display: none; }
  main { margin: 0; }
  .feedback, .chapter-nav, .copy-btn { display: none; }
  #cover { page-break-after: always; }
}
`;

// Shared runtime: progress, drawer, sidebar collapse, search, font size, copy, helpful,
// selection pill, keyboard paging, resume memory, deep-link redirect.
const appJs = `
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REPO = '${REPO}';
  var ROOT = document.body.dataset.root || '';
  var PAGE = document.body.dataset.page || '';
  var PREV = document.body.dataset.prev || '';
  var NEXT = document.body.dataset.next || '';

  var bar = $('#progress');
  var ticking = false;
  function updateBar() {
    ticking = false;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  /* Resume memory: chapter pages remember themselves; home offers the way back. */
  if (PAGE && PAGE !== '00-prologue') {
    var t = document.querySelector('h1');
    try { localStorage.setItem('atb:last', JSON.stringify({ url: 'ch/' + PAGE + '.html', title: t ? t.textContent : PAGE })); } catch (e) {}
  }
  var last = null;
  try { last = JSON.parse(localStorage.getItem('atb:last') || 'null'); } catch (e) {}
  if (!PAGE && last && last.url) {
    var rt = $('#resume-top');
    if (rt) { var entry = (window.SEARCH_INDEX || []).find(function (it) { return last.url === it.url || last.url === '../' + it.url; }); if (entry) { var link = document.createElement('a'); link.href = ROOT + entry.url; link.textContent = entry.title + ' →'; rt.textContent = '上次读到：'; rt.appendChild(link); rt.classList.add('show'); } }
  }

  /* Sidebar collapse (desktop, chapter pages) — racket parity. */
  var collapseBtn = $('#toc-collapse');
  if (collapseBtn) {
    try { if (localStorage.getItem('atb:toc') === 'hidden') document.body.classList.add('toc-hidden'); } catch (e) {}
    collapseBtn.setAttribute('aria-expanded', document.body.classList.contains('toc-hidden') ? 'false' : 'true');
    if (document.body.classList.contains('toc-hidden')) collapseBtn.textContent = '›';
    collapseBtn.addEventListener('click', function () {
      var hidden = document.body.classList.toggle('toc-hidden');
      collapseBtn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      collapseBtn.textContent = hidden ? '›' : '‹';
      try { localStorage.setItem('atb:toc', hidden ? 'hidden' : 'open'); } catch (e) {}
    });
  }

  /* Anchor the sidebar on the active chapter: load -> scroll it into view, centered. */
  var activeLink = $('#toc a.active');
  var tocEl = $('#toc');
  if (activeLink && tocEl) {
    var target = activeLink.offsetTop - tocEl.clientHeight / 2 + activeLink.offsetHeight / 2;
    tocEl.scrollTop = Math.max(0, target);
  }

  /* Per-part collapse in the sidebar (racket parity). */
  $$('.part-toggle').forEach(function (btn) {
    var key = 'atb:v2:part:' + btn.dataset.part;
    var ul = document.querySelector('[data-part-ul="' + btn.dataset.part + '"]');
    if (!ul) return;
    try { if (localStorage.getItem(key) === 'collapsed') { ul.classList.add('collapsed'); btn.setAttribute('aria-expanded', 'false'); } } catch (e) {}
    btn.addEventListener('click', function () {
      var collapsed = ul.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      try { localStorage.setItem(key, collapsed ? 'collapsed' : 'open'); } catch (e) {}
    });
  });

  /* Search */
  var input = $('#search-input');
  if (input) {
    var results = $('#search-results');
    var items = [];
    var sel = -1;
    var closeResults = function () { results.innerHTML = ''; items = []; sel = -1; };
    var openResult = function (it) {
      closeResults(); input.blur();
      window.location.href = ROOT + it.url;
    };
    var renderResults = function (q) {
      var lq = q.toLowerCase();
      var hits = [];
      if (lq.length >= 1) {
        (window.SEARCH_INDEX || []).forEach(function (it) {
          var hay = (it.title + ' ' + it.text).toLowerCase();
          var pos = hay.indexOf(lq);
          if (pos !== -1) {
            var start = Math.max(0, pos - 34);
            var snip = (start > 0 ? '…' : '') + (it.title + ' ' + it.text).slice(start, pos + 66) + '…';
            hits.push({ slug: it.slug, title: it.title, url: it.url, snip: snip });
          }
        });
        hits = hits.slice(0, 8);
      }
      results.innerHTML = hits.length
        ? hits.map(function (h, i) {
            var esc = h.snip.replace(/&/g, '&amp;').replace(/</g, '&lt;');
            var idx = esc.toLowerCase().indexOf(lq);
            if (idx !== -1) esc = esc.slice(0, idx) + '<mark>' + esc.slice(idx, idx + lq.length) + '</mark>' + esc.slice(idx + lq.length);
            return '<div class="sr-item" data-i="' + i + '" role="button" tabindex="0"><div class="sr-title">' + h.title + '</div><div class="sr-snippet">' + esc + '</div></div>';
          }).join('')
        : (lq ? '<div class="sr-empty">没有找到「' + q.replace(/</g, '&lt;') + '」</div>' : '');
      items = hits; sel = -1;
      $$('.sr-item', results).forEach(function (el) {
        el.addEventListener('click', function () { openResult(items[+el.dataset.i]); });
      });
    };
    input.addEventListener('input', function () { renderResults(input.value.trim()); });
    input.addEventListener('keydown', function (e) {
      var els = $$('.sr-item', results);
      if (e.key === 'Escape') { closeResults(); input.blur(); return; }
      if (!els.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = e.key === 'ArrowDown' ? Math.min(sel + 1, els.length - 1) : Math.max(sel - 1, 0);
        els.forEach(function (el, i) { el.classList.toggle('sel', i === sel); });
      } else if (e.key === 'Enter' && sel >= 0) {
        openResult(items[sel]);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && input) { e.preventDefault(); input.focus(); input.select(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/' && input) { e.preventDefault(); input.focus(); return; }
    if (e.key === 'ArrowRight' && NEXT) window.location.href = ROOT + NEXT;
    if (e.key === 'ArrowLeft' && PREV) window.location.href = ROOT + PREV;
  });

  /* Mobile drawer */
  var toggle = $('#toc-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('toc-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    var ov = $('.toc-overlay');
    if (ov) ov.addEventListener('click', function () { document.body.classList.remove('toc-open'); });
    $$('#toc a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('toc-open'); });
    });
  }

  /* Reader font size */
  var SIZES = ['14px', '16px', '18px'];
  var fsIdx = 1;
  try { fsIdx = Math.min(2, Math.max(0, parseInt(localStorage.getItem('atb:fs') || '1', 10) || 1)); } catch (e) {}
  function applyFs() {
    document.documentElement.style.setProperty('--reader-fs', SIZES[fsIdx]);
    try { localStorage.setItem('atb:fs', String(fsIdx)); } catch (e) {}
  }
  applyFs();
  var dec = $('#fs-dec'); var inc = $('#fs-inc');
  if (dec) dec.addEventListener('click', function () { fsIdx = Math.max(0, fsIdx - 1); applyFs(); });
  if (inc) inc.addEventListener('click', function () { fsIdx = Math.min(2, fsIdx + 1); applyFs(); });

  /* Copy buttons on code blocks */
  $$('.chapter pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.querySelector('code').textContent.replace(/\\n$/, '')).then(function () {
        btn.textContent = '✓ 已复制';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('done'); }, 1600);
      });
    });
    pre.appendChild(btn);
  });

  /* Helpful */
  function thanks(box) {
    var q = box.querySelector('.fb-q');
    if (!q || q.dataset.done) return;
    q.dataset.done = '1';
    q.textContent = '谢谢！已记下你的反馈。';
    var s = box.querySelector('.fb-sub');
    if (s) s.innerHTML = '如果这本书对你有帮助，欢迎到 <a href="https://github.com/' + REPO + '" target="_blank" rel="noopener noreferrer">GitHub 点个 Star</a>，让更多读者看到它。';
    var act = box.querySelector('.fb-actions');
    if (act) act.remove();
  }
  $$('.fb-helpful').forEach(function (btn) {
    var key = 'atb:helpful:' + btn.dataset.key;
    try { if (localStorage.getItem(key) === '1') thanks(btn.closest('.feedback')); } catch (e) {}
    btn.addEventListener('click', function () {
      try { localStorage.setItem(key, '1'); } catch (e) {}
      thanks(btn.closest('.feedback'));
    });
  });

  /* SelectionPill: floating 反馈这段 while the reader selects text in the article */
  if (PAGE) {
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'selection-pill';
    pill.textContent = '反馈这段';
    pill.style.display = 'none';
    document.body.appendChild(pill);
    var pillQuote = '';
    var pillRaf = 0;
    var updatePill = function () {
      pillRaf = 0;
      var article = document.querySelector('article.chapter');
      var s = window.getSelection();
      var text = s && !s.isCollapsed ? s.toString().replace(/\\s+/g, ' ').trim() : '';
      var ok = text.length >= 2 && text.length <= 500 && !!s && !!article && article.contains(s.anchorNode);
      var rect = ok ? s.getRangeAt(0).getBoundingClientRect() : null;
      ok = !!(ok && rect && (rect.width || rect.height) && rect.bottom > 0 && rect.top < window.innerHeight);
      if (!ok) { pill.style.display = 'none'; pillQuote = ''; return; }
      pillQuote = text;
      pill.style.display = 'block';
      pill.style.top = Math.max(8, rect.top - 44) + 'px';
      pill.style.left = (rect.left + rect.width / 2) + 'px';
    };
    var schedulePill = function () {
      if (pillRaf) cancelAnimationFrame(pillRaf);
      pillRaf = requestAnimationFrame(updatePill);
    };
    document.addEventListener('selectionchange', schedulePill);
    window.addEventListener('scroll', function () { if (pill.style.display === 'block') schedulePill(); }, { passive: true });
    window.addEventListener('resize', schedulePill);
    pill.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pill.addEventListener('click', function () {
      if (!pillQuote) return;
      var t = (document.querySelector('h1') || {}).textContent || PAGE;
      var u = 'https://github.com/' + REPO + '/issues/new?' + new URLSearchParams({
        title: '【反馈】' + t + '——选中段落',
        body: '章节链接：' + location.href + '\\n\\n> ' + pillQuote + '\\n\\n问题描述：\\n',
      }).toString();
      window.open(u, '_blank', 'noopener,noreferrer');
      window.getSelection().removeAllRanges();
      pill.style.display = 'none';
    });
  }

  /* Lightbox: click a diagram to enlarge; Esc or click anywhere to close. */
  var box = $('#lightbox');
  if (box) {
    var holder = box.querySelector('.lb-holder');
    var caption = box.querySelector('.lb-caption');
    var source = null;
    function renderBox() {
      if (!source) return;
      var vb = (source.getAttribute('viewBox') || '').split(/\\s+/);
      var clone_ = holder.querySelector('svg');
      if (vb.length === 4) {
        var ratio = vb[2] / vb[3];
        var maxW = window.innerWidth * 0.94;
        var maxH = (window.innerHeight - 70) * 0.96;
        var w = maxH * ratio <= maxW ? maxH * ratio : maxW;
        clone_.style.width = Math.round(w) + 'px';
        clone_.style.height = Math.round(w / ratio) + 'px';
      }
    }
    function openBox(svg) {
      source = svg;
      holder.innerHTML = '';
      var clone = svg.cloneNode(true);
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.style.cursor = 'zoom-out';
      holder.appendChild(clone);
      caption.textContent = svg.getAttribute('aria-label') || '';
      renderBox();
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
    }
    function closeBox() {
      source = null;
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
    }
    $$('article.chapter svg').forEach(function (svg) {
      svg.addEventListener('click', function () { openBox(svg); });
    });
    box.addEventListener('click', closeBox);
    window.addEventListener('resize', function () { if (source) renderBox(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) closeBox();
    });
  }

  /* Home: deep links from the old single-page era -> chapter pages */
  if (!PAGE && window.SEARCH_INDEX && location.hash.length > 1) {
    var legacy = ${JSON.stringify(LEGACY)};
    var target = (window.SEARCH_INDEX.filter(function (it) { return '#' + it.slug === (legacy[location.hash.slice(1)] ? '#' + legacy[location.hash.slice(1)] : location.hash); }))[0];
    if (target) location.replace(ROOT + target.url);
  }
})();
`;

const head = (title, root) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="理解计算机技术的真实机制，准确指导 AI Agent，独立验证软件交付。">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FAF9F6">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1C1A16">
<meta property="og:title" content="${title}">
<meta property="og:description" content="理解计算机技术的真实机制，准确指导 AI Agent，独立验证软件交付。">
<meta property="og:type" content="book">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}/og.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23C4683F'/%3E%3Crect x='14' y='16' width='36' height='8' rx='2' fill='%23FAF9F6'/%3E%3Crect x='14' y='28' width='36' height='8' rx='2' fill='%23FAF9F6'/%3E%3Crect x='14' y='40' width='24' height='8' rx='2' fill='%23FAF9F6'/%3E%3C/svg%3E">
<link rel="stylesheet" href="${root}style.css">`;

const pageShell = ({ title, root, activeSlug, page, prevUrl, nextUrl, main, home }) => `<!doctype html>
<html lang="zh-CN">
<head>
${head(title, root)}
</head>
<body id="top" class="${home ? 'home' : ''}" data-root="${root}" data-page="${page}" data-prev="${prevUrl}" data-next="${nextUrl}">
<div id="progress" aria-hidden="true"></div>
<header class="topbar">
  <button id="toc-toggle" aria-label="打开目录" aria-expanded="false">☰</button>
  <span class="tb-title">${BOOK}</span>
</header>
<div class="toc-overlay" aria-hidden="true"></div>
${home ? '' : sidebar(activeSlug, root)}
${home ? '' : '<button type="button" id="toc-collapse" class="toc-toggle-btn" aria-label="收起或展开目录" aria-expanded="true">‹</button>'}
<main>
${main}
</main>
<div id="lightbox" class="lightbox" aria-hidden="true"><div class="lb-holder"></div><p class="lb-caption"></p></div>
<script src="${root}search.js"></script>
<script src="${root}app.js"></script>
</body>
</html>`;

// Home page: no sidebar — centered hero + part-grouped chapter rows (racket parity).
const homeMain = `<div id="cover">
  <div id="resume-top"></div>
  <p class="eyebrow">An online book</p>
  <h1>${BOOK}</h1>
  <p class="lead">理解技术原理，掌握工程方法，准确与 AI Agent 协作。</p>
  <p class="tagline">从零建立计算机知识网络，也为工程师提供跨领域知识入口。<br>十一部、八十六章：从信息与计算到 AI Agent 和完整软件项目。</p>
  <p class="author">吉人 著</p>
  <div class="cta">
    <a class="btn btn-primary" href="ch/00-prologue.html">开始阅读 →</a>
    <a class="btn btn-secondary" href="https://github.com/${REPO}" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>
  </div>
</div>
<div class="home-rule" aria-hidden="true"></div>
<div class="home-toc">
${TOC.map(({ part, desc, files }, gi) => {
  const seg = part ? part.split(' · ') : ['开篇', '序章'];
  return `<div class="ht-part">
  <div class="ht-eyebrow">${seg[0]}</div>
  <div class="ht-title">${seg[1]}</div>
  ${desc ? `<p class="ht-desc">${desc}</p>` : ''}
  <ul>${files.map((f) => {
    const e = entryOf(f);
    const num = (/^\d\d-/.test(f) ? f.slice(0,2) : f.match(/^appendix-([a-d])/)?.[1].toUpperCase() ?? '');
    return `<li><a href="ch/${e.slug}.html"><span class="ht-num">${num}</span><span>${e.title}</span><span class="ht-arrow">→</span></a></li>`;
  }).join('')}</ul>
</div>`;
}).join('\n')}
</div>`;

// Chapter pages
const chapterPages = entries.map((e, i) => {
  const prev = entries[i - 1];
  const next = entries[i + 1];
  const main = `<article class="chapter">
  <p class="eyebrow">${e.part ? e.part : '开篇'}</p>
  <h1>${e.title}</h1>
  ${bodyFor(e)}
  ${feedbackBox(e)}
  ${chapterNav(e)}
</article>`;
  return {
    path: join('docs', 'ch', `${e.slug}.html`),
    html: pageShell({
      title: `${e.title} · ${BOOK}`,
      root: '../',
      activeSlug: e.slug,
      page: e.slug,
      prevUrl: prev ? `ch/${prev.slug}.html` : '',
      nextUrl: next ? `ch/${next.slug}.html` : '',
      main,
      home: false,
    }),
  };
});

const homeHtml = pageShell({
  title: `${BOOK} — 面向 AI 时代的计算机技术基础`,
  root: '',
  activeSlug: '',
  page: '',
  prevUrl: '',
  nextUrl: `ch/${entries[0].slug}.html`,
  main: homeMain,
  home: true,
});

mkdirSync(join('docs', 'ch'), { recursive: true });
writeFileSync(join('docs', 'style.css'), css);
writeFileSync(join('docs', 'app.js'), appJs);
writeFileSync(join('docs', 'search.js'), `window.SEARCH_INDEX = ${SEARCH_INDEX};\n`);
writeFileSync(join('docs', 'index.html'), homeHtml);
chapterPages.forEach((p) => writeFileSync(p.path, p.html));
for (const [oldSlug, newSlug] of Object.entries(LEGACY)) {
  if (entries.some((e) => e.slug === oldSlug) || !entries.some((e) => e.slug === newSlug)) throw new Error('Invalid legacy chapter alias: ' + oldSlug);
  const target = newSlug + '.html';
  writeFileSync(join('docs', 'ch', oldSlug + '.html'), '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=' + target + '"><link rel="canonical" href="' + SITE + '/ch/' + target + '"><title>章节已迁移</title></head><body><p>章节已迁移：<a href="' + target + '">阅读新版章节</a></p></body></html>\n');
}
console.log(`site written: index.html + ${chapterPages.length} chapter pages (style.css, app.js, search.js)`);
