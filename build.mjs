// Build a self-contained one-page book site from chapters/*.md into docs/index.html.
// Family design tokens follow turlamai/racket-programming design/DESIGN.md (2026-11-11 contract)
// and tlai-product design-standard.md (2026-11-20-minimal-family) — do not fork values here.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const REPO = 'turlamai/after-the-build';
const SITE = 'https://afterthebuild.jrtx.site';

const TOC = [
  { part: '', files: ['00-prologue.md'] },
  { part: '第一部 · 世界观', files: ['01-platforms.md', '02-files.md', '03-cli-gui.md', '04-language.md', '05-network.md'] },
  { part: '第二部 · 造完之后', files: ['06-deploy.md', '07-debug.md', '08-secrets.md', '09-cost.md', '10-data.md', '11-versions.md'] },
  { part: '第三部 · 拿住之后', files: ['12-security.md', '13-ask-for-help.md', '14-maintenance.md'] },
  { part: '第四部 · 一页纸与工具箱', files: ['15-40-questions.md', 'appendix-a-glossary.md', 'appendix-b-ai-templates.md', 'appendix-c-concept-map.md'] },
];

const slug = (name) => name.replace(/\.md$/, '');
const titleOf = (f) => readFileSync(join('chapters', f), 'utf8').match(/^# (.+)$/m)?.[1] ?? f;

// Family FeedbackBox semantics, ported from racket-programming components/PageFeedback.tsx.
const feedbackBox = (f) => {
  const t = titleOf(f);
  const issueUrl = `https://github.com/${REPO}/issues/new?` + new URLSearchParams({
    title: `【反馈】${t}`,
    body: `章节链接：${SITE}#${slug(f)}\n\n问题描述：\n`,
  }).toString();
  const editUrl = `https://github.com/${REPO}/edit/main/chapters/${f}`;
  const issuesUrl = `https://github.com/${REPO}/issues?q=is%3Aissue`;
  return `<div class="feedback">
  <p class="fb-q">这一章读下来还顺利吗？</p>
  <p class="fb-sub">发现错误、没讲清楚、例子跑不起来——都欢迎告诉我们，这本书会持续修订。</p>
  <div class="fb-actions">
    <button type="button" class="fb-helpful" data-key="${slug(f)}">有帮助</button>
    <a class="fb-issue" target="_blank" rel="noopener noreferrer" href="${issueUrl}">反馈问题或建议</a>
  </div>
  <div class="fb-links">
    <a target="_blank" rel="noopener noreferrer" href="${editUrl}">在 GitHub 上编辑本章</a>
    <a target="_blank" rel="noopener noreferrer" href="${issuesUrl}">查看读者的反馈</a>
  </div>
</div>`;
};

// Family ChapterNav semantics: prev / back to TOC / next, always at the end of the article.
const chapterNav = (f) => {
  const all = TOC.flatMap((p) => p.files);
  const i = all.indexOf(f);
  const prev = all[i - 1];
  const next = all[i + 1];
  const link = (target, cls, fmt) =>
    target
      ? `<a href="#${slug(target)}" class="${cls}">${fmt(titleOf(target))}</a>`
      : `<span class="${cls} is-disabled" aria-hidden="true"></span>`;
  return `<nav class="chapter-nav" aria-label="章节导航">
  ${link(prev, 'nav-prev', (t) => '← ' + t)}
  <a href="#top" class="nav-toc">返回目录</a>
  ${link(next, 'nav-next', (t) => t + ' →')}
</nav>`;
};

const navHtml = TOC.map(({ part, files }) => {
  const items = files
    .map((f) => `<li><a href="#${slug(f)}">${titleOf(f)}</a></li>`)
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
    return `<section class="chapter" id="${slug(f)}" data-file="${f}">\n${body}\n${feedbackBox(f)}\n${chapterNav(f)}\n</section>`;
  })
).join('\n');

const css = `
:root {
  --bg: #FAF9F6; --surface: #FFFFFF; --raised: #F5F3EE;
  --line: #EBE8E0; --line-strong: #E0DCD2;
  --ink: #2A2820; --ink-2: #4A4740; --mute: #878278; --faint: #A39E93;
  --accent: #C4683F; --accent-strong: #A8532D; --accent-soft: #FFF4EE;
  --code-bg: #2A2820; --code-ink: #F5F3EE; --ok: #3E7D4E;
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
html { scroll-behavior: smooth; }
body {
  margin: 0; background: var(--bg); color: var(--ink-2);
  font: 400 16px/1.8 system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
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

#toc {
  position: fixed; inset: 0 auto 0 0; width: 264px; overflow-y: auto;
  padding: 32px 24px 40px; background: var(--surface); border-right: 1px solid var(--line);
  font-size: 13px; line-height: 1.6; display: flex; flex-direction: column;
}
#toc .book { font-weight: 600; color: var(--ink); font-size: 15px; margin-bottom: 4px; }
#toc .book-sub { color: var(--faint); font-size: 11px; letter-spacing: 0.05em; margin-bottom: 20px; }
#toc .part { color: var(--faint); font-weight: 600; font-size: 12px; letter-spacing: 0.05em; margin: 20px 0 8px; }
#toc ul { list-style: none; margin: 0; padding: 0; }
#toc li { margin: 6px 0; }
#toc a { display: block; padding: 4px 10px; margin: -4px -10px; border-radius: 6px; color: var(--mute); }
#toc a:hover { color: var(--ink); background: var(--raised); }
#toc a.active { color: var(--accent); background: var(--accent-soft); font-weight: 500; }
#toc .toc-feedback { margin-top: auto; padding-top: 24px; border-top: 1px solid var(--line); }
#toc .toc-feedback a { color: var(--mute); }

main { margin-left: 264px; padding: 0 24px; }
#cover { max-width: 72ch; margin: 0 auto; padding: 88px 0 64px; text-align: center; }
#cover h1 { font-size: 40px; line-height: 1.25; margin: 0 0 12px; color: var(--ink); letter-spacing: 0.06em; }
#cover .sub { color: var(--ink-2); font-size: 18px; margin-bottom: 28px; }
#cover .tagline { color: var(--mute); font-size: 15px; line-height: 1.9; }
#cover .author { color: var(--faint); margin-top: 32px; font-size: 14px; letter-spacing: 0.3em; }
#cover .cover-links { margin-top: 20px; font-size: 12px; }
#cover .cover-links a { color: var(--mute); margin: 0 8px; }
#cover .cover-links a:hover { color: var(--ink); }

section.chapter { max-width: 72ch; margin: 0 auto; padding: 64px 0; border-top: 1px solid var(--line); }
section.chapter h1 { font-size: 36px; line-height: 1.25; margin: 0 0 8px; color: var(--ink); }
section.chapter > blockquote {
  margin: 20px 0 40px; padding: 14px 20px; border-left: 3px solid var(--accent);
  background: var(--accent-soft); color: var(--ink-2); border-radius: 0 8px 8px 0; font-size: 15.5px;
}
section.chapter > blockquote p { margin: 0; }
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
pre { background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 16px 20px; overflow-x: auto; }
pre code { background: none; color: var(--code-ink); padding: 0; font-size: 0.875rem; line-height: 1.7; }
strong { color: var(--ink); }
section.chapter svg { display: block; max-width: 100%; height: auto; margin: 24px auto; border: 1px solid var(--line); border-radius: 8px; }

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

@media (max-width: 960px) {
  #toc { position: static; width: auto; border-right: none; border-bottom: 1px solid var(--line); padding: 24px; }
  main { margin-left: 0; }
  #cover { padding-top: 48px; }
  #cover h1 { font-size: 32px; }
  section.chapter h1 { font-size: 28px; }
  .chapter-nav { flex-wrap: wrap; }
}
@media print {
  #toc { display: none; }
  main { margin: 0; }
  .feedback, .chapter-nav { display: none; }
  section.chapter { border-top: none; page-break-before: always; padding: 24px 0; }
  #cover { page-break-after: always; }
}
`;

const script = `
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('#toc a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var current = null;
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (current) current.classList.remove('active');
      current = byId[entry.target.id] || null;
      if (current) {
        current.classList.add('active');
        history.replaceState(null, '', '#' + entry.target.id);
      }
    });
  }, { rootMargin: '-15% 0px -75% 0px' });
  document.querySelectorAll('section.chapter').forEach(function (s) { obs.observe(s); });

  function thanks(box) {
    var q = box.querySelector('.fb-q');
    if (!q || q.dataset.done) return;
    q.dataset.done = '1';
    q.textContent = '谢谢！已记下你的反馈。';
    var s = box.querySelector('.fb-sub');
    if (s) {
      s.innerHTML = '如果这本书对你有帮助，欢迎到 <a href="https://github.com/${REPO}" target="_blank" rel="noopener noreferrer">GitHub 点个 Star</a>，让更多读者看到它。';
    }
    var act = box.querySelector('.fb-actions');
    if (act) act.remove();
  }
  document.querySelectorAll('.fb-helpful').forEach(function (btn) {
    var key = 'atb:helpful:' + btn.dataset.key;
    try { if (localStorage.getItem(key) === '1') thanks(btn.closest('.feedback')); } catch (e) {}
    btn.addEventListener('click', function () {
      try { localStorage.setItem(key, '1'); } catch (e) {}
      thanks(btn.closest('.feedback'));
    });
  });
})();
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
<body id="top">
<nav id="toc" aria-label="目录">
  <div class="book">造完之后</div>
  <div class="book-sub">AI 时代普通人的技术通识课</div>
  ${navHtml}
  <div class="toc-feedback"><a href="https://github.com/${REPO}/issues/new?title=%E3%80%90%E5%8F%8D%E9%A6%88%E3%80%91%E9%80%A0%E5%AE%8C%E4%B9%8B%E5%90%8E" target="_blank" rel="noopener noreferrer">问题反馈</a></div>
</nav>
<main>
<div id="cover">
  <h1>造完之后</h1>
  <div class="sub">AI 时代普通人的技术通识课</div>
  <div class="tagline">答案免费，问题稀缺。<br>AI 替你造出了东西，这本书教你把它真正拿在手里。</div>
  <div class="author">吉人</div>
  <div class="cover-links">
    <a href="https://github.com/${REPO}" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>
    <a href="https://github.com/${REPO}/issues" target="_blank" rel="noopener noreferrer">读者反馈</a>
  </div>
</div>
${sectionsHtml}
</main>
<script>${script}</script>
</body>
</html>
`;

mkdirSync('docs', { recursive: true });
writeFileSync(join('docs', 'index.html'), html);
console.log(`docs/index.html written (${html.length} chars)`);
