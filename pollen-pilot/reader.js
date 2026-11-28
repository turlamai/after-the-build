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
      event.preventDefault(); search?.focus();
    }
  });
})();
