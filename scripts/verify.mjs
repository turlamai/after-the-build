import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { Script } from 'node:vm';
const read = p => readFileSync(p, 'utf8');
const chapters = readdirSync('chapters').filter(p => p.endsWith('.md')).sort();
assert.equal(chapters.length, 28);
const search = JSON.parse(read('docs/search.js').replace(/^window\.SEARCH_INDEX = /, '').replace(/;\s*$/, ''));
assert.equal(search.length, chapters.length);
assert.equal(new Set(search.map(e => e.slug)).size, chapters.length);
const home = read('docs/index.html');
for (const file of chapters) {
  const slug = file.slice(0,-3);
  const md = read(join('chapters',file));
  const title = md.match(/^# (.+)$/m)?.[1];
  assert.ok(title, file + ': title missing');
  const entry = search.find(e => e.slug === slug);
  assert.equal(entry?.title,title);
  assert.ok(entry.text.length > 100, file + ': empty index');
  const path = join('docs','ch',slug+'.html');
  const html = read(path);
  assert.ok(html.includes('<h1>'+title+'</h1>'), path);
  assert.ok(home.includes('ch/'+slug+'.html'), slug + ': missing from TOC');
  assert.ok(html.includes('class="chapter-nav"'), slug + ': missing navigation');
}
for (const file of readdirSync('docs/ch').filter(p => p.endsWith('.html'))) {
  const path = join('docs/ch',file);
  const html = read(path);
  const redirect = html.match(/http-equiv="refresh" content="0;url=([^"]+)"/);
  if (!chapters.includes(file.replace(/\.html$/,'.md'))) {
    assert.ok(redirect, file + ': stale chapter without redirect');
    assert.ok(chapters.includes(redirect[1].replace(/\.html$/,'.md')), file + ': invalid redirect');
  }
  for (const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(target)) continue;
    const rel = target.split(/[?#]/)[0];
    if (rel) assert.ok(existsSync(resolve(dirname(path),rel)), path + ': missing ' + target);
  }
}
new Script(read('docs/app.js'));
new Script(read('docs/search.js'));
assert.equal((read('chapters/24-50-questions.md').match(/^\d+\. /gm)||[]).length,50);
console.log('Verified 28 chapters, search, navigation, local links, legacy redirects, JavaScript syntax and 50 questions.');
