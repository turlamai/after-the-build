// Build a self-contained one-page book site from chapters/*.md into docs/index.html.
// Zero runtime JS, works offline, GitHub Pages friendly (deploy from /docs).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const TOC = [
  { part: '', files: ['00-prologue.md'] },
  { part: '第一部 · 世界观', files: ['01-platforms.md', '02-files.md', '03-cli-gui.md', '04-language.md', '05-network.md'] },
  { part: '第二部 · 造完之后', files: ['06-deploy.md', '07-debug.md', '08-secrets.md', '09-cost.md', '10-data.md', '11-versions.md'] },
  { part: '第三部 · 拿住之后', files: ['12-security.md', '13-ask-for-help.md', '14-maintenance.md'] },
  { part: '第四部 · 一页纸与工具箱', files: ['15-40-questions.md', 'appendix-a-glossary.md', 'appendix-b-ai-templates.md', 'appendix-c-concept-map.md'] },
];

const slug = (name) => name.replace(/\.md$/, '');

const navHtml = TOC.map(({ part, files }) => {
  const items = files
    .map((f) => {
      const h1 = readFileSync(join('chapters', f), 'utf8').match(/^# (.+)$/m)?.[1] ?? f;
      return `<li><a href="#${slug(f)}">${h1}</a></li>`;
    })
    .join('');
  const label = part ? `<div class="part">${part}</div>` : '<div class="part">开篇</div>';
  return `${label}<ul>${items}</ul>`;
}).join('');

const sectionsHtml = TOC.flatMap(({ files }) =>
  files.map((f) => {
    const md = readFileSync(join('chapters', f), 'utf8');
    // Inline chapter SVGs so the built site stays a single self-contained file.
    const body = marked.parse(md).replace(
      /<img src="\.\.\/assets\/([\w-]+\.svg)" alt="([^"]*)"\s*\/?>/g,
      (m, file, alt) =>
        readFileSync(join('assets', file), 'utf8').replace('<svg ', `<svg role="img" aria-label="${alt}" `),
    );
    return `<section class="chapter" id="${slug(f)}">\n${body}\n</section>`;
  })
).join('\n');

const css = `
:root {
  --paper: #f7f5f1; --ink: #2a2a28; --muted: #8a857c;
  --accent: #9a5b2d; --accent-soft: #efe4d8; --line: #e3ded6;
  --code-bg: #efece6; --quote-bg: #f2ede4;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #17181c; --ink: #d9d6cf; --muted: #8f8b83;
    --accent: #d0a06a; --accent-soft: #26242a; --line: #2c2e34;
    --code-bg: #212329; --quote-bg: #1e2025;
  }
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; background: var(--paper); color: var(--ink);
  font: 17px/1.95 -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif;
  text-rendering: optimizeLegibility;
}
#toc {
  position: fixed; inset: 0 auto 0 0; width: 264px; overflow-y: auto;
  padding: 40px 24px 60px; border-right: 1px solid var(--line);
  font-size: 13.5px; line-height: 1.6;
}
#toc .part { color: var(--accent); font-weight: 600; margin: 22px 0 8px; letter-spacing: .04em; }
#toc .part:first-child { margin-top: 0; }
#toc ul { list-style: none; margin: 0; padding: 0; }
#toc li { margin: 7px 0; }
#toc a { color: var(--muted); text-decoration: none; }
#toc a:hover { color: var(--ink); }
main { margin-left: 264px; padding: 0 24px; }
#cover { max-width: 680px; margin: 0 auto; padding: 96px 0 72px; text-align: center; }
#cover h1 { font-size: 44px; margin: 0 0 10px; letter-spacing: .06em; }
#cover .sub { color: var(--accent); font-size: 18px; margin-bottom: 26px; }
#cover .tagline { color: var(--muted); font-size: 15px; }
#cover .author { color: var(--muted); margin-top: 34px; font-size: 14px; letter-spacing: .3em; }
section.chapter {
  max-width: 680px; margin: 0 auto; padding: 72px 0;
  border-top: 1px solid var(--line);
}
section.chapter h1 {
  font-size: 27px; line-height: 1.5; margin: 0 0 6px;
  letter-spacing: .02em;
}
section.chapter > blockquote {
  margin: 18px 0 34px; padding: 14px 20px; border-left: 3px solid var(--accent);
  background: var(--quote-bg); color: var(--muted); border-radius: 0 8px 8px 0;
  font-size: 15.5px;
}
section.chapter > blockquote p { margin: 0; }
h2 { font-size: 20px; margin: 44px 0 14px; color: var(--accent); letter-spacing: .02em; }
h3 { font-size: 17px; margin: 30px 0 10px; }
p { margin: 14px 0; }
ul, ol { margin: 14px 0; padding-left: 26px; }
li { margin: 9px 0; }
hr { border: none; border-top: 1px solid var(--line); margin: 40px 0; }
code {
  background: var(--code-bg); padding: 2px 7px; border-radius: 5px;
  font: 0.85em/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
pre { background: var(--code-bg); border-radius: 10px; padding: 18px 20px; overflow-x: auto; }
pre code { background: none; padding: 0; }
section.chapter svg { display: block; max-width: 100%; height: auto; margin: 26px auto; border-radius: 10px; }
a { color: var(--accent); }
strong { color: var(--ink); }
@media (max-width: 960px) {
  #toc { position: static; width: auto; border-right: none; border-bottom: 1px solid var(--line); padding: 28px 24px; }
  main { margin-left: 0; }
  #cover { padding-top: 48px; }
  #cover h1 { font-size: 34px; }
}
@media print {
  #toc, #cover .author-note { display: none; }
  main { margin: 0; }
  section.chapter { border-top: none; page-break-before: always; padding: 24px 0; }
  #cover { page-break-after: always; }
}
`;

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>造完之后 — AI 时代普通人的技术通识课</title>
<meta name="description" content="答案免费，问题稀缺。AI 替你造出了东西，这本书教你把它真正拿在手里。">
<style>${css}</style>
</head>
<body>
<nav id="toc" aria-label="目录">${navHtml}</nav>
<main>
<div id="cover">
  <h1>造完之后</h1>
  <div class="sub">AI 时代普通人的技术通识课</div>
  <div class="tagline">答案免费，问题稀缺。<br>AI 替你造出了东西，这本书教你把它真正拿在手里。</div>
  <div class="author">吉人</div>
</div>
${sectionsHtml}
</main>
</body>
</html>
`;

mkdirSync('docs', { recursive: true });
writeFileSync(join('docs', 'index.html'), html);
console.log(`docs/index.html written (${html.length} bytes)`);
