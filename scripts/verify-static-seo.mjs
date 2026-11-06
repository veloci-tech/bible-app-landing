import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const base = 'https://landing.aibiblebuddy.com';
const origin = `${base}/`;
const pages = new Map([
  ['index.html', origin],
  ['support.html', `${base}/support.html`],
  ['privacy-policy.html', `${base}/privacy-policy.html`],
]);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const contents = new Map([...pages.keys()].map((file) => [file, readFileSync(file, 'utf8')]));
const tags = (html, expression) => [...html.matchAll(expression)].map((match) => match[1]);

for (const [file, canonical] of pages) {
  const html = contents.get(file);
  const title = tags(html, /<title>([^<]+)<\/title>/gi);
  const description = tags(html, /<meta\s+name="description"\s+content="([^"]+)"\s*>/gi);
  const canonicals = tags(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*>/gi);
  const ogUrls = tags(html, /<meta\s+property="og:url"\s+content="([^"]+)"\s*>/gi);
  const socialImages = [
    ...tags(html, /<meta\s+property="og:image"\s+content="([^"]+)"\s*>/gi),
    ...tags(html, /<meta\s+name="twitter:image"\s+content="([^"]+)"\s*>/gi),
  ];
  check(title.length === 1 && title[0].trim(), `${file}: expected one nonempty title`);
  check(description.length === 1 && description[0].trim(), `${file}: expected one nonempty description`);
  check(canonicals.length === 1 && canonicals[0] === canonical, `${file}: canonical must be ${canonical}`);
  check(ogUrls.length === 1 && ogUrls[0] === canonical, `${file}: og:url must match canonical`);
  check((html.match(/<h1\b/gi) ?? []).length === 1, `${file}: expected exactly one H1`);
  check(socialImages.length === 2 && socialImages.every((url) => url === `${base}/img/app-logo.png`), `${file}: expected absolute social image metadata`);

  for (const url of socialImages) {
    const path = new URL(url).pathname.replace(/^\//, '');
    check(existsSync(path), `${file}: social image asset is missing: ${path}`);
  }
  for (const [, rawHref] of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    if (!rawHref || rawHref.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(rawHref)) continue;
    const local = rawHref.split(/[?#]/, 1)[0];
    const path = local.startsWith('/') ? local.slice(1) : resolve(file, '..', local);
    const normalized = resolve(path);
    const root = resolve('.');
    check((normalized === root || normalized.startsWith(root + sep)) && existsSync(normalized || root), `${file}: local link or asset is missing: ${rawHref}`);
  }
}

const allTitles = [...pages.keys()].map((file) => tags(contents.get(file), /<title>([^<]+)<\/title>/gi)[0]);
check(new Set(allTitles).size === allTitles.length, 'HTML titles must be unique');

const sitemap = readFileSync('sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedSitemap = [...pages.values()];
check(JSON.stringify(sitemapUrls) === JSON.stringify(expectedSitemap), 'sitemap.xml must contain only the three canonical public HTML URLs in order');
check((sitemap.match(/<url>/g) ?? []).length === sitemapUrls.length, 'sitemap.xml has malformed URL entries');
check(readFileSync('robots.txt', 'utf8').includes(`Sitemap: ${base}/sitemap.xml`), 'robots.txt must advertise the sitemap');
check(!/Disallow:\s*\//i.test(readFileSync('robots.txt', 'utf8')), 'robots.txt must not block the site');

for (const file of ['CNAME', 'TOS.pdf', 'privacypolicy.pdf']) {
  const baseline = execFileSync('git', ['show', `origin/main:${file}`]);
  const current = readFileSync(file);
  const identical = file === 'CNAME'
    ? current.toString('utf8').replace(/\r\n/g, '\n') === baseline.toString('utf8').replace(/\r\n/g, '\n')
    : current.equals(baseline);
  check(identical, `${file}: existing domain or legal PDF asset changed`);
}
const baselinePolicy = execFileSync('git', ['show', 'origin/main:privacy-policy.html'], { encoding: 'utf8' }).replace(/\r\n/g, '\n');
const currentPolicy = contents.get('privacy-policy.html').replace(/\r\n/g, '\n');
const legalBlock = (html) => html.slice(html.indexOf('<h1>PRIVACY POLICY</h1>'), html.indexOf('</body>'));
check(legalBlock(currentPolicy) === legalBlock(baselinePolicy), 'privacy policy body text/date changed from origin/main');

for (const file of ['index.html', 'support.html']) {
  const baseline = execFileSync('git', ['show', `origin/main:${file}`], { encoding: 'utf8' });
  const current = contents.get(file);
  const scriptTags = (html) => [...html.matchAll(/<script\b[^>]*>.*?<\/script>|<script\b[^>]*\/?\s*>/gis)].map((match) => match[0]);
  check(JSON.stringify(scriptTags(current)) === JSON.stringify(scriptTags(baseline)), `${file}: existing script/API behavior tags changed`);
  const storeLinks = (html) => [...html.matchAll(/href="(https:\/\/(?:apps\.apple\.com|play\.google\.com)[^"]+)"/gi)].map((match) => match[1]);
  check(JSON.stringify(storeLinks(current)) === JSON.stringify(storeLinks(baseline)), `${file}: app store destinations changed`);
}
check(contents.get('index.html').includes('<meta name="google-site-verification" content="lTiOZnr9VzDQvtXcsVsKRM7JYVELYh67g7YBmI22yag" />'), 'Google Search Console verification tag missing');
check(contents.get('index.html').includes('<meta name="msvalidate.01" content="EEF1FDF4D6D6A931ABE97714B5595A6A" />'), 'Bing Webmaster verification tag missing');
const indexNowFiles = readdirSync('.').filter((file) => /^[a-f0-9]{32}\.txt$/.test(file));
check(indexNowFiles.length === 1, 'expected one root-level 32-character IndexNow key file');
if (indexNowFiles.length === 1) {
  check(readFileSync(indexNowFiles[0], 'utf8').trim() === indexNowFiles[0].slice(0, -4), 'IndexNow key file content must match its filename');
}
check(contents.get('support.html').includes('mailto:support@velocitech.app?subject=Reaching%20out%20for%20AIBibleBuddy'), 'support email link changed');
check(contents.get('index.html').includes('AI-generated study material'), 'homepage must accurately describe AI-generated study material');
check(!existsSync('index.html') || !/name="robots"\s+content="noindex/i.test(contents.get('index.html')), 'homepage must remain indexable');

if (errors.length) {
  console.error(errors.map((error) => `FAIL: ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: metadata, H1s, links/assets, sitemap/robots, legal text, scripts/API tags, and store destinations (${pages.size} public pages)`);
}
