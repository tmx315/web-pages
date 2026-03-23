import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../src/config/friendsConfig.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/gallery/friends');

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

async function takeScreenshot(url, outputPath) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`Visited: ${url}`);
    await checkCloudflare(page);

    // Take a normal screenshot (1080p, not full page)
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Screenshot saved: ${outputPath}`);

    // Try to find "孟轩" text on the page
    let mengxuanFound = await checkMengxuan(page);

    if (!mengxuanFound) {
      console.log(`"孟轩" not found on ${url}, trying to find friend link...`);

      const clickedHref = await findAndClickFriendLink(page);

      if (clickedHref) {
        const currentUrl = page.url();
        console.log(`Navigated to: ${currentUrl}`);

        // Wait for page to fully load
        await page.waitForTimeout(2000);
        await checkCloudflare(page);

        // Reload page to ensure fresh content (some sites use SPA without reload)
        await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
        await checkCloudflare(page);

        // Take another screenshot
        await page.screenshot({ path: outputPath, fullPage: false });
        console.log(`Screenshot saved after navigation: ${outputPath}`);

        // Check for "孟轩" on the new page
        await checkMengxuan(page);
      }
    }
  } catch (error) {
    console.error(`Failed to screenshot ${url}: ${error.message}`);
    try {
      await page.screenshot({ path: outputPath, fullPage: false });
    } catch (e) {
      console.error(`Failed to save error screenshot: ${e.message}`);
    }
  } finally {
    await browser.close();
  }
}

async function checkMengxuan(page) {
  try {
    await page.waitForLoadState('domcontentloaded');

    // Check various forms of "孟轩"
    const keywords = ['孟轩', 'MengXuan', 'mengxuan', 'MX', 'mx'];

    for (const keyword of keywords) {
      const count = await page.locator(`text=${keyword}`).count();
      if (count > 0) {
        console.log(`Found "${keyword}" on the page (${count} occurrences)`);
        return true;
      }
    }
  } catch (e) {
    console.log(`Error checking for "孟轩": ${e.message}`);
  }
  return false;
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const urls = await extractSiteUrls();
  console.log(`Found ${urls.length} friend links to screenshot`);

  let index = 1;
  for (const url of urls) {
    const sanitizedTitle = url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const outputPath = path.join(OUTPUT_DIR, `${String(index).padStart(3, '0')}_${sanitizedTitle}.png`);
    await takeScreenshot(url, outputPath);
    index++;
  }

  console.log('Screenshots completed!');
}

main().catch(console.error);
