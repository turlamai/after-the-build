(() => {
  "use strict";
  const entries = window.BOOK_CHAPTERS;
  if (!Array.isArray(entries)) return;
  const chapterPage = document.body.dataset.chapter === "true";
  const prefix = chapterPage ? "../" : "";
  const current = chapterPage ? decodeURIComponent(location.pathname.split("/").pop()).replace(/\.html$/, "") : "";
  const index = entries.findIndex(e => e.slug === current);
  function link(entry, label) {
    const a = document.createElement("a");
    a.href = prefix + entry.url;
    a.textContent = label || entry.title;
    if (entry.slug === current) a.setAttribute("aria-current", "page");
    return a;
  }
  const toc = document.querySelector("#book-toc");
  const search = document.querySelector("#book-search");
  const count = document.querySelector("#book-count");
  function render() {
    const q = (search?.value || "").trim().toLocaleLowerCase();
    const matches = entries.filter(e => !q || (e.title + "\n" + e.text).toLocaleLowerCase().includes(q));
    const list = document.createElement("ol");
    for (const entry of matches) {
      const item = document.createElement("li");
      item.append(link(entry));
      if (q) {
        const at = entry.text.toLocaleLowerCase().indexOf(q);
        if (at >= 0) {
          const snippet = document.createElement("small");
          snippet.textContent = entry.text.slice(Math.max(0, at - 30), at + q.length + 50);
          item.append(snippet);
        }
      }
      list.append(item);
    }
    toc?.replaceChildren(list);
    if (count) count.textContent = matches.length + " 个章节";
  }
  search?.addEventListener("input", render);
  render();
  const nav = document.querySelector("#chapter-nav");
  if (nav && index >= 0) {
    if (index > 0) nav.append(link(entries[index - 1], "← " + entries[index - 1].title));
    const home = document.createElement("a");
    home.href = "../index.html";
    home.textContent = "返回目录";
    nav.append(home);
    if (index + 1 < entries.length) nav.append(link(entries[index + 1], entries[index + 1].title + " →"));
    document.title = entries[index].title + " · AI 时代的基本功";
  }
  document.addEventListener("keydown", event => {
    if (event.isComposing || event.altKey || event.target?.closest?.("input,textarea,select,button,[contenteditable]")) return;
    if (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault(); if (search) { const panel = search.closest("details"); if (panel) panel.open = true; search.focus(); }
    }
  });
  const get = key => { try { return localStorage.getItem("fundamentals:" + key); } catch { return null; } };
  const save = (key, value) => { try { localStorage.setItem("fundamentals:" + key, value); } catch {} };
  const settings = document.createElement("section");
  settings.className = "reader-settings";
  settings.setAttribute("aria-label", "阅读设置");
  function setting(label, key, options, fallback) {
    const wrapper = document.createElement("label");
    wrapper.textContent = label + " ";
    const select = document.createElement("select");
    for (const [value, title] of options) {
      const option = document.createElement("option");
      option.value = value; option.textContent = title; select.append(option);
    }
    const stored = get(key);
    select.value = options.some(([value]) => value === stored) ? stored : fallback;
    function apply() { document.documentElement.dataset[key] = select.value; save(key, select.value); }
    select.addEventListener("change", apply); apply();
    wrapper.append(select); settings.append(wrapper);
  }
  setting("主题", "theme", [["auto","跟随系统"],["light","浅色"],["dark","深色"]], "auto");
  setting("字号", "size", [["normal","标准"],["large","大"],["xlarge","特大"]], "normal");
  document.body.prepend(settings);
  if (index >= 0) {
    const progress = document.createElement("progress");
    progress.className = "reading-progress";
    progress.max = 100;
    progress.setAttribute("aria-label", "阅读进度");
    document.body.prepend(progress);
    save("last", current);
    const positionKey = "position:" + current;
    const old = Number(get(positionKey));
    if (!location.hash && old > 0) requestAnimationFrame(() => window.scrollTo(0, old));
    function updateProgress() {
      const range = document.documentElement.scrollHeight - innerHeight;
      progress.value = range > 0 ? Math.min(100, Math.max(0, scrollY / range * 100)) : 100;
      save(positionKey, String(scrollY));
    }
    window.addEventListener("scroll", updateProgress, {passive:true});
    window.addEventListener("resize", updateProgress);
    requestAnimationFrame(updateProgress);
  } else {
    const last = entries.find(e => e.slug === get("last"));
    if (last) settings.append(link(last, "继续阅读：" + last.title));
  }
  for (const code of document.querySelectorAll("pre > code")) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "复制代码";
    button.className = "copy-code";
    button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(code.textContent); button.textContent = "已复制"; }
      catch { button.textContent = "复制失败，请手动选择"; }
    });
    code.parentElement.before(button);
  }

})();
