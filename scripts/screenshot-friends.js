import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../src/config/friendsConfig.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/gallery/friends');
const REPORT_TEMPLATE_PATH = path.join(__dirname, '../src/content/posts/Friend-Link-Monitor.md');

const MAX_RUNS_PER_DAY = 5;
const TODAY = new Date().toISOString().split('T')[0];

function getRunCounter() {
  const counterFile = path.join(OUTPUT_DIR, `.run_counter_${TODAY}`);
  if (!fs.existsSync(counterFile)) {
    return 0;
  }
  const count = parseInt(fs.readFileSync(counterFile, 'utf-8'), 10);
  return isNaN(count) ? 0 : count;
}

function incrementRunCounter() {
  const counterFile = path.join(OUTPUT_DIR, `.run_counter_${TODAY}`);
  const current = getRunCounter();
  fs.writeFileSync(counterFile, String(current + 1), 'utf-8');
  return current + 1;
}

function generateUniqueFilename(baseName, ext = '.png') {
  let filename = `${TODAY}_${baseName}`;
  let filepath = path.join(OUTPUT_DIR, filename + ext);
  let counter = 1;

  while (fs.existsSync(filepath)) {
    filename = `${TODAY}_${baseName}_${counter}`;
    filepath = path.join(OUTPUT_DIR, filename + ext);
    counter++;
  }

  return filepath;
}

async function extractSiteUrls() {
  const content = fs.readFileSync(FRIENDS_CONFIG_PATH, 'utf-8');

  const urlRegex = /siteurl:\s*["']([^"']+)["']/g;
  const enabledRegex = /enabled:\s*(true|false)/g;

  const matches = [];
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    matches.push({ url: match[1], index: match.index });
  }

  const enabledMatches = [];
  while ((match = enabledRegex.exec(content)) !== null) {
    enabledMatches.push({ enabled: match[1] === 'true', index: match.index });
  }

  const urls = [];
  for (const m of matches) {
    let isEnabled = true;
    for (const em of enabledMatches) {
      if (em.index > m.index) break;
      isEnabled = em.enabled;
    }
    if (isEnabled) {
      urls.push(m.url);
    }
  }

  return [...new Set(urls)];
}

async function checkCloudflare(page) {
  try {
    const title = await page.title();
    if (title.includes('Cloudflare') || title.includes('Checking your browser')) {
      console.log('Detected Cloudflare challenge, waiting...');
      await page.waitForTimeout(5000);
      return true;
    }
    const content = await page.content();
    if (content.includes('Cloudflare') && content.includes('Checking your browser')) {
      console.log('Detected Cloudflare challenge in content, waiting...');
      await page.waitForTimeout(5000);
      return true;
    }
  } catch (e) {
    // Continue
  }
  return false;
}

async function findAndClickFriendLink(page) {
  const friendLinkSelectors = [
    'a[href*="friend"]',
    'a[href*="links"]',
    'a:has-text("友链")',
    'a:has-text("友链")',
    'a:has-text("友情链接")',
    'a:has-text("朋友")',
    'nav a',
    '.nav a',
    'header a',
    'menu a',
    '[class*="link"] a',
  ];

  for (const selector of friendLinkSelectors) {
    try {
      const links = await page.locator(selector).all();
      for (const link of links) {
        const text = await link.textContent();
        if (text && (text.includes('友链') || text.includes('链接') || text.includes('朋友') || text.includes('link'))) {
          const href = await link.getAttribute('href');
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            console.log(`Found friend link: ${text.trim()} -> ${href}`);
            await link.click();
            await page.waitForTimeout(2000);
            await checkCloudflare(page);
            return href;
          }
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  return null;
}

async function findAndScrollToMengxuan(page) {
  const keywords = ['孟轩', 'MengXuan', 'mengxuan'];

  for (const keyword of keywords) {
    try {
      const element = page.locator(`text=${keyword}`).first();
      const count = await element.count();

      if (count > 0) {
        console.log(`Found "${keyword}" on the page (${count} occurrences), scrolling to it...`);
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        return true;
      }
    } catch (e) {
      // Continue to next keyword
    }
  }
  return false;
}

async function takeScreenshot(url, index, total) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const sanitizedTitle = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const baseFilename = `${String(index).padStart(3, '0')}_${sanitizedTitle}`;
  const homepagePath = generateUniqueFilename(`${baseFilename}_homepage`);
  const mengxuanPath = generateUniqueFilename(`${baseFilename}_mengxuan`);

  const result = {
    url,
    status: 'unknown',
    error: null,
    homepageScreenshot: null,
    mengxuanScreenshot: null,
    mengxuanFound: false,
  };

  try {
    console.log(`[${index}/${total}] Visiting: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await checkCloudflare(page);

    result.homepageScreenshot = path.basename(homepagePath);
    await page.screenshot({ path: homepagePath, fullPage: false });
    console.log(`Homepage screenshot saved: ${result.homepageScreenshot}`);

    result.mengxuanFound = await findAndScrollToMengxuan(page);

    if (result.mengxuanFound) {
      result.mengxuanScreenshot = path.basename(mengxuanPath);
      await page.screenshot({ path: mengxuanPath, fullPage: false });
      console.log(`Mengxuan screenshot saved: ${result.mengxuanScreenshot}`);
      result.status = 'normal';
    } else {
      console.log(`"孟轩" not found on ${url}, trying to find friend link...`);

      const clickedHref = await findAndClickFriendLink(page);

      if (clickedHref) {
        const currentUrl = page.url();
        console.log(`Navigated to: ${currentUrl}`);

        await page.waitForTimeout(2000);
        await checkCloudflare(page);

        await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
        await checkCloudflare(page);

        result.homepageScreenshot = path.basename(homepagePath);
        await page.screenshot({ path: homepagePath, fullPage: false });
        console.log(`Homepage screenshot saved: ${result.homepageScreenshot}`);

        result.mengxuanFound = await findAndScrollToMengxuan(page);

        if (result.mengxuanFound) {
          result.mengxuanScreenshot = path.basename(mengxuanPath);
          await page.screenshot({ path: mengxuanPath, fullPage: false });
          console.log(`Mengxuan screenshot saved: ${result.mengxuanScreenshot}`);
          result.status = 'normal';
        } else {
          result.status = 'not_found';
        }
      } else {
        result.status = 'not_found';
      }
    }
  } catch (error) {
    console.error(`Failed to screenshot ${url}: ${error.message}`);
    result.status = 'error';
    result.error = error.message;

    try {
      result.homepageScreenshot = path.basename(homepagePath);
      await page.screenshot({ path: homepagePath, fullPage: false });
    } catch (e) {
      console.error(`Failed to save error screenshot: ${e.message}`);
    }
  } finally {
    await browser.close();
  }

  return result;
}

function getStatusLabel(status) {
  switch (status) {
    case 'normal': return '<span class="site-status status-ok">✅ 正常</span>';
    case 'not_found': return '<span class="site-status status-warn">⚠️ 未找到</span>';
    case 'error': return '<span class="site-status status-error">❌ 无法访问</span>';
    default: return '<span class="site-status">未知</span>';
  }
}

function generateReport(results) {
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const total = results.length;
  const normalCount = results.filter(r => r.status === 'normal').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const notFoundCount = results.filter(r => r.status === 'not_found').length;
  const inaccessibleCount = errorCount;

  let friendLinksTable = `<table>
<tr><th>序号</th><th>网站</th><th>状态</th><th>主页</th><th>友链</th></tr>\n`;

  results.forEach((r, i) => {
    const statusBadge = getStatusLabel(r.status);
    const homepageLink = r.homepageScreenshot
      ? `<a href="/gallery/friends/${r.homepageScreenshot}" target="_blank"><img src="/gallery/friends/${r.homepageScreenshot}" alt="主页" style="width:120px;"></a>`
      : '-';
    const mengxuanLink = r.mengxuanScreenshot
      ? `<a href="/gallery/friends/${r.mengxuanScreenshot}" target="_blank"><img src="/gallery/friends/${r.mengxuanScreenshot}" alt="友链" style="width:120px;"></a>`
      : '-';
    friendLinksTable += `<tr><td>${i + 1}</td><td><a href="${r.url}" target="_blank">${r.url}</a></td><td>${statusBadge}</td><td>${homepageLink}</td><td>${mengxuanLink}</td></tr>\n`;
  });
  friendLinksTable += '</table>';

  let inaccessibleList = '';
  const inaccessibleSites = results.filter(r => r.status === 'error');
  if (inaccessibleSites.length === 0) {
    inaccessibleList = '<p>所有友链网站均可正常访问！🎉</p>\n';
  } else {
    inaccessibleList += '<ul>\n';
    inaccessibleSites.forEach((r, i) => {
      const errorType = r.error.includes('CERT') ? '证书错误' :
        r.error.includes('timeout') ? '连接超时' :
        r.error.includes('DNS') ? 'DNS解析失败' : '其他错误';
      inaccessibleList += `<li><strong>${r.url}</strong> - ${errorType}<br><small>${r.error}</small></li>\n`;
    });
    inaccessibleList += '</ul>\n';
  }

  let screenshotsNormal = '<div class="screenshot-grid">\n';
  const normalSites = results.filter(r => r.status === 'normal');
  normalSites.forEach(r => {
    screenshotsNormal += `<div class="screenshot-item">\n`;
    screenshotsNormal += `<p><strong><a href="${r.url}" target="_blank">${r.url}</a></strong></p>\n`;
    if (r.homepageScreenshot) {
      screenshotsNormal += `<p><small>主页</small></p><img src="/gallery/friends/${r.homepageScreenshot}" alt="主页截图">\n`;
    }
    if (r.mengxuanScreenshot) {
      screenshotsNormal += `<p><small>友链</small></p><img src="/gallery/friends/${r.mengxuanScreenshot}" alt="友链截图">\n`;
    }
    screenshotsNormal += `</div>\n`;
  });
  screenshotsNormal += '</div>\n';

  let screenshotsError = '<div class="screenshot-grid">\n';
  const errorSites = results.filter(r => r.status === 'error' || r.status === 'not_found');
  errorSites.forEach(r => {
    screenshotsError += `<div class="screenshot-item">\n`;
    screenshotsError += `<p><strong><a href="${r.url}" target="_blank">${r.url}</a></strong></p>\n`;
    if (r.homepageScreenshot) {
      screenshotsError += `<img src="/gallery/friends/${r.homepageScreenshot}" alt="截图">\n`;
    } else {
      screenshotsError += `<p>无法获取截图 - ${r.error || '未找到友链'}</p>\n`;
    }
    screenshotsError += `</div>\n`;
  });
  screenshotsError += '</div>\n';

  return {
    now,
    total,
    normalCount,
    errorCount,
    notFoundCount,
    inaccessibleCount,
    friendLinksTable,
    inaccessibleList,
    screenshotsNormal,
    screenshotsError,
  };
}

function updateReportTemplate(reportData) {
  let content = fs.readFileSync(REPORT_TEMPLATE_PATH, 'utf-8');

  content = content.replace(/<!-- REPORT_TIME -->/g, reportData.now);
  content = content.replace(/<!-- TOTAL_SITES -->/g, reportData.total);
  content = content.replace(/<!-- ACCESSIBLE_SITES -->/g, reportData.normalCount);
  content = content.replace(/<!-- INACCESSIBLE_SITES -->/g, reportData.inaccessibleCount);
  content = content.replace(/<!-- NORMAL_COUNT -->/g, reportData.normalCount);
  content = content.replace(/<!-- INACCESSIBLE_COUNT -->/g, reportData.inaccessibleCount);
  content = content.replace(/<!-- CERT_ERROR_COUNT -->/g, reportData.errorCount);
  content = content.replace(/<!-- TIMEOUT_COUNT -->/g, 0);
  content = content.replace(/<!-- FRIEND_LINKS_TABLE -->/g, reportData.friendLinksTable);
  content = content.replace(/<!-- INACCESSIBLE_LIST -->/g, reportData.inaccessibleList);
  content = content.replace(/<!-- SCREENSHOTS_NORMAL -->/g, reportData.screenshotsNormal);
  content = content.replace(/<!-- SCREENSHOTS_ERROR -->/g, reportData.screenshotsError);

  return content;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const runCount = getRunCounter();

  if (runCount >= MAX_RUNS_PER_DAY) {
    console.log(`Already ran ${runCount} times today. Maximum is ${MAX_RUNS_PER_DAY}. Skipping.`);
    console.log(`Next run will be available tomorrow.`);
    return;
  }

  const runNumber = incrementRunCounter();
  console.log(`Today's run: ${runNumber}/${MAX_RUNS_PER_DAY}`);

  const urls = await extractSiteUrls();
  console.log(`Found ${urls.length} friend links to screenshot`);

  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const result = await takeScreenshot(urls[i], i + 1, urls.length);
    results.push(result);
  }

  console.log('Generating report...');
  const reportData = generateReport(results);
  const updatedContent = updateReportTemplate(reportData);

  fs.writeFileSync(REPORT_TEMPLATE_PATH, updatedContent, 'utf-8');
  console.log(`Report updated: ${REPORT_TEMPLATE_PATH}`);

  console.log(`Screenshots completed! (${runNumber}/${MAX_RUNS_PER_DAY} today)`);
  console.log(`Summary: ${reportData.normalCount}/${reportData.total} sites accessible`);
}

main().catch(console.error);
