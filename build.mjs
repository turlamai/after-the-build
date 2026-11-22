// Build a self-contained one-page book site from chapters/*.md into docs/index.html.
// Family design tokens follow turlamai/racket-programming design/DESIGN.md (2026-11-11 contract)
// and tlai-product design-standard.md (2026-11-20-minimal-family) — do not fork values here.
// Reader features (search / progress / resume / copy / drawer / font size / keyboard nav)
// each map to a real reader task; all vanilla JS, no external dependencies.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

const REPO = 'turlamai/after-the-build';
const SITE = 'https://afterthebuild.jrtx.site';

const TOC = [
  { part: '', files: ['00-prologue.md'] },
  { part: '第一部 · 世界观', files: ['01-platforms.md', '02-machine.md', '03-files.md', '04-cli-gui.md', '05-language.md', '06-os.md', '07-data-shapes.md', '08-network.md', '09-cloud.md', '10-ai-landscape.md', '11-ai-collab.md'] },
  { part: '第二部 · 造完之后', files: ['12-deploy.md', '13-debug.md', '14-secrets.md', '15-cost.md', '16-data.md', '17-versions.md'] },
  { part: '第三部 · 拿住之后', files: ['18-security.md', '19-crypto.md', '20-privacy.md', '21-ask-for-help.md', '22-maintenance.md'] },
  { part: '第四部 · 一页纸与工具箱', files: ['23-50-questions.md', 'appendix-a-glossary.md', 'appendix-b-ai-templates.md', 'appendix-c-concept-map.md'] },
];

const slug = (name) => name.replace(/\.md$/, '');
const titleOf = (f) => readFileSync(join('chapters', f), 'utf8').match(/^# (.+)$/m)?.[1] ?? f;

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
  TOC.flatMap(({ files }) =>
    files.map((f) => ({ slug: slug(f), title: titleOf(f), text: stripMd(readFileSync(join('chapters', f), 'utf8')) }))
  )
);

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
  position: fixed; inset: 0 auto 0 0; width: 280px; overflow-y: auto;
  padding: 32px 24px 40px; background: var(--surface); border-right: 1px solid var(--line);
  font-size: 13px; line-height: 1.6; display: flex; flex-direction: column;
}
#toc .book { font-weight: 600; color: var(--ink); font-size: 15px; margin-bottom: 4px; }
#toc .book-sub { color: var(--faint); font-size: 11px; letter-spacing: 0.05em; margin-bottom: 20px; }
#toc .search { margin-bottom: 8px; }
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
#toc .part { color: var(--faint); font-weight: 600; font-size: 12px; letter-spacing: 0.05em; margin: 20px 0 8px; }
#toc ul { list-style: none; margin: 0; padding: 0; }
#toc li { margin: 6px 0; }
#toc a { display: block; padding: 4px 10px; margin: -4px -10px; border-radius: 6px; color: var(--mute); }
#toc a:hover { color: var(--ink); background: var(--raised); }
#toc a.active { color: var(--accent); background: var(--accent-soft); font-weight: 500; }
#toc .toc-foot {
  margin-top: auto; padding-top: 24px; border-top: 1px solid var(--line);
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
#toc .resume { display: none; margin: 16px -6px 0; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--accent-soft); }
#toc .resume.show { display: block; }
#toc .resume .r-label { color: var(--faint); font-size: 11px; letter-spacing: 0.05em; }
#toc .resume a { display: block; color: var(--accent-strong); font-weight: 500; margin-top: 2px; padding: 0; margin: 2px 0 0; }

main { margin-left: 280px; padding: 0 24px; }
#cover { max-width: 72ch; margin: 0 auto; padding: 88px 0 64px; text-align: center; }
#cover h1 { font-size: 40px; line-height: 1.25; margin: 0 0 12px; color: var(--ink); letter-spacing: 0.06em; }
#cover .sub { color: var(--ink-2); font-size: 18px; margin-bottom: 28px; }
#cover .tagline { color: var(--mute); font-size: 15px; line-height: 1.9; }
#cover .author { color: var(--faint); margin-top: 32px; font-size: 14px; letter-spacing: 0.3em; }
#cover .cover-links { margin-top: 20px; font-size: 12px; }
#cover .cover-links a { color: var(--mute); margin: 0 8px; }
#cover .cover-links a:hover { color: var(--ink); }
#resume-top { display: none; max-width: 72ch; margin: 24px auto 0; text-align: center; font-size: 13px; }
#resume-top.show { display: block; }
#resume-top a { color: var(--accent-strong); }

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
pre { position: relative; background: var(--code-bg); color: var(--code-ink); border-radius: 8px; padding: 16px 20px; overflow-x: auto; }
pre code { background: none; color: var(--code-ink); padding: 0; font-size: 0.875rem; line-height: 1.7; }
.copy-btn {
  position: absolute; top: 8px; right: 8px; border: 1px solid #4A4740; background: rgba(250, 249, 246, 0.12);
  color: #F5F3EE; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer;
}
.copy-btn:hover { background: rgba(250, 249, 246, 0.22); }
.copy-btn.done { color: #7FB88A; border-color: #3E7D4E; }
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
  .topbar {
    display: flex; position: sticky; top: 0; z-index: 30; align-items: center; gap: 12px;
    padding: 10px 16px; background: var(--surface); border-bottom: 1px solid var(--line);
  }
  .topbar button {
    border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink);
    border-radius: 6px; padding: 6px 10px; font-size: 15px; cursor: pointer; line-height: 1;
  }
  .topbar .tb-title { font-weight: 600; color: var(--ink); font-size: 14px; }
  .toc-overlay { display: none; position: fixed; inset: 0; background: rgba(26, 24, 20, 0.4); z-index: 40; }
  body.toc-open .toc-overlay { display: block; }
  #toc {
    position: fixed; inset: 0 auto 0 0; width: 300px; z-index: 50;
    transform: translateX(-100%); transition: transform 0.15s ease;
  }
  body.toc-open #toc { transform: translateX(0); }
  main { margin-left: 0; padding-top: 0; }
  #cover { padding-top: 48px; }
  #cover h1 { font-size: 32px; }
  section.chapter h1 { font-size: 28px; }
  .chapter-nav { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  #toc { transition: none; }
}
@media print {
  #toc, .topbar, #progress, .toc-overlay { display: none; }
  main { margin: 0; }
  .feedback, .chapter-nav, .copy-btn { display: none; }
  section.chapter { border-top: none; page-break-before: always; padding: 24px 0; }
  #cover { page-break-after: always; }
}
`;

const script = `
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Reading progress bar */
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

  /* TOC current-chapter highlight + resume-reading memory */
  var links = $$('#toc a[href^="#"]');
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var current = null;
  var currentId = null;
  function setCurrent(id) {
    if (current) current.classList.remove('active');
    current = byId[id] || null;
    currentId = current ? id : null;
    if (current) {
      current.classList.add('active');
      history.replaceState(null, '', '#' + id);
      try { localStorage.setItem('atb:last', JSON.stringify({ id: id, title: current.textContent })); } catch (e) {}
    }
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting) setCurrent(entry.target.id); });
  }, { rootMargin: '-15% 0px -75% 0px' });
  $$('.chapter').forEach(function (s) { obs.observe(s); });

  /* Resume reading */
  var last = null;
  try { last = JSON.parse(localStorage.getItem('atb:last') || 'null'); } catch (e) {}
  if (last && last.id && document.getElementById(last.id) && last.id !== '00-prologue') {
    var rt = $('#resume-top');
    rt.innerHTML = '上次读到：<a href="#' + last.id + '">' + last.title + ' →</a>';
    rt.classList.add('show');
    var rs = $('#resume');
    rs.querySelector('a').setAttribute('href', '#' + last.id);
    rs.querySelector('a').textContent = last.title + ' →';
    rs.classList.add('show');
  }

  /* Search */
  var INDEX = ${SEARCH_INDEX};
  var input = $('#search-input');
  var results = $('#search-results');
  var items = [];
  var sel = -1;
  function closeResults() { results.innerHTML = ''; items = []; sel = -1; }
  function openResult(it) {
    closeResults(); input.blur();
    var el = document.getElementById(it.slug);
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  function renderResults(q) {
    var lq = q.toLowerCase();
    var hits = [];
    if (lq.length >= 1) {
      INDEX.forEach(function (it) {
        var hay = (it.title + ' ' + it.text).toLowerCase();
        var pos = hay.indexOf(lq);
        if (pos !== -1) {
          var start = Math.max(0, pos - 34);
          var snip = (start > 0 ? '…' : '') + (it.title + ' ' + it.text).slice(start, pos + 66) + '…';
          hits.push({ slug: it.slug, title: it.title, snip: snip });
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
    items = hits;
    sel = -1;
    $$('.sr-item', results).forEach(function (el) {
      el.addEventListener('click', function () { openResult(items[+el.dataset.i]); });
    });
  }
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
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); input.focus(); input.select(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); input.focus(); return; }
    var all = ${JSON.stringify(TOC.flatMap((p) => p.files.map(slug)))};
    if (e.key === 'ArrowRight' && currentId) {
      var i = all.indexOf(currentId);
      if (i >= 0 && i + 1 < all.length) location.hash = '#' + all[i + 1];
    } else if (e.key === 'ArrowLeft' && currentId) {
      var j = all.indexOf(currentId);
      if (j > 0) location.hash = '#' + all[j - 1];
    }
  });

  /* Mobile drawer */
  var toggle = $('#toc-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('toc-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $('.toc-overlay').addEventListener('click', function () { document.body.classList.remove('toc-open'); });
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
  $('#fs-dec').addEventListener('click', function () { fsIdx = Math.max(0, fsIdx - 1); applyFs(); });
  $('#fs-inc').addEventListener('click', function () { fsIdx = Math.min(2, fsIdx + 1); applyFs(); });

  /* Copy buttons on code blocks */
  $$('.chapter pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.innerText.replace(/\\n$/, '')).then(function () {
        btn.textContent = '✓ 已复制';
        btn.classList.add('done');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('done'); }, 1600);
      });
    });
    pre.appendChild(btn);
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
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FAF9F6">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1C1A16">
<meta property="og:title" content="造完之后 — AI 时代普通人的技术通识课">
<meta property="og:description" content="答案免费，问题稀缺。AI 替你造出了东西，这本书教你把它真正拿在手里。">
<meta property="og:type" content="book">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23C4683F'/%3E%3Ctext x='32' y='44' font-size='34' text-anchor='middle' fill='%23FAF9F6' font-family='PingFang SC, sans-serif' font-weight='600'%3E造%3C/text%3E%3C/svg%3E">
<style>${css}</style>
</head>
<body id="top">
<div id="progress" aria-hidden="true"></div>
<header class="topbar">
  <button id="toc-toggle" aria-label="打开目录" aria-expanded="false">☰</button>
  <span class="tb-title">造完之后</span>
</header>
<div class="toc-overlay" aria-hidden="true"></div>
<nav id="toc" aria-label="目录">
  <div class="book">造完之后</div>
  <div class="book-sub">AI 时代普通人的技术通识课</div>
  <div class="search">
    <input id="search-input" type="search" placeholder="搜索全书　（⌘K 或 /）" aria-label="搜索全书">
    <div id="search-results" aria-live="polite"></div>
  </div>
  ${navHtml}
  <div id="resume" class="resume"><div class="r-label">继续上次阅读</div><a href="#top">上次读到：…</a></div>
  <div class="toc-foot">
    <div class="fs-ctl">
      <button id="fs-dec" aria-label="缩小正文字号">A−</button>
      <button id="fs-inc" aria-label="放大正文字号">A＋</button>
    </div>
    <a href="https://github.com/${REPO}/issues/new?title=%E3%80%90%E5%8F%8D%E9%A6%88%E3%80%91%E9%80%A0%E5%AE%8C%E4%B9%8B%E5%90%8E" target="_blank" rel="noopener noreferrer">问题反馈</a>
  </div>
</nav>
<main>
<div id="cover">
  <div id="resume-top"></div>
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
