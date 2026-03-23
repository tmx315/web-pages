import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../src/config/friendsConfig.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/gallery/friends');

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

async function takeScreenshot(url) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const sanitizedTitle = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const baseFilename = `${String(getRunCounter() + 1).padStart(3, '0')}_${sanitizedTitle}`;
  const homepagePath = generateUniqueFilename(`${baseFilename}_homepage`);
  const mengxuanPath = generateUniqueFilename(`${baseFilename}_mengxuan`);

  let mengxuanFound = false;

  try {
    console.log(`Visited: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await checkCloudflare(page);

    // Take homepage screenshot
    await page.screenshot({ path: homepagePath, fullPage: false });
    console.log(`Homepage screenshot saved: ${homepagePath}`);

    // Try to find "孟轩" and scroll to it
    mengxuanFound = await findAndScrollToMengxuan(page);

    if (mengxuanFound) {
      // Take screenshot with "孟轩" in view
      await page.screenshot({ path: mengxuanPath, fullPage: false });
      console.log(`Mengxuan screenshot saved: ${mengxuanPath}`);
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

        // Take homepage screenshot of the friend page
        await page.screenshot({ path: homepagePath, fullPage: false });
        console.log(`Homepage screenshot saved: ${homepagePath}`);

        // Try to find "孟轩" and scroll to it
        mengxuanFound = await findAndScrollToMengxuan(page);

        if (mengxuanFound) {
          await page.screenshot({ path: mengxuanPath, fullPage: false });
          console.log(`Mengxuan screenshot saved: ${mengxuanPath}`);
        }
      }
    }
  } catch (error) {
    console.error(`Failed to screenshot ${url}: ${error.message}`);

    try {
      await page.screenshot({ path: homepagePath, fullPage: false });
      console.log(`Error homepage screenshot saved: ${homepagePath}`);
    } catch (e) {
      console.error(`Failed to save error screenshot: ${e.message}`);
    }
  } finally {
    await browser.close();
  }
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

  for (const url of urls) {
    await takeScreenshot(url);
  }

  console.log(`Screenshots completed! (${runNumber}/${MAX_RUNS_PER_DAY} today)`);
}

main().catch(console.error);
