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

async function findAndClickFriendLink(page) {
  const friendLinkSelectors = [
    'a[href*="friend"]',
    'a[href*="links"]',
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
            console.log(`Found friend link: ${text} -> ${href}`);
            await link.click();
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            return true;
          }
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  return false;
}

async function takeScreenshot(url, outputPath) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`Visited: ${url}`);

    // Try to find "孟轩" text on the page
    const mengxuanFound = await findAndScreenshotMengxuan(page, outputPath);

    if (!mengxuanFound) {
      console.log(`"孟轩" not found on ${url}, trying to find friend link...`);

      // Try to click on friend link and look again
      const clicked = await findAndClickFriendLink(page);

      if (clicked) {
        const currentUrl = page.url();
        console.log(`Navigated to: ${currentUrl}`);

        // Wait for page to fully load
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

        // Try again on the new page
        await findAndScreenshotMengxuan(page, outputPath);
      } else {
        // Take a full page screenshot of the current page
        await page.screenshot({ path: outputPath, fullPage: true });
        console.log(`Full page screenshot saved (no "孟轩" found): ${outputPath}`);
      }
    }
  } catch (error) {
    console.error(`Failed to screenshot ${url}: ${error.message}`);
    try {
      await page.screenshot({ path: outputPath, fullPage: true });
    } catch (e) {
      console.error(`Failed to save error screenshot: ${e.message}`);
    }
  } finally {
    await browser.close();
  }
}

async function findAndScreenshotMengxuan(page, outputPath) {
  try {
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Try different methods to find "孟轩"
    const methods = [
      async () => {
        const element = page.locator('text=MengXuan').first();
        if (await element.count() > 0) {
          await element.scrollIntoViewIfNeeded();
          const box = await element.boundingBox();
          if (box) {
            // Take full page screenshot
            await page.screenshot({ path: outputPath, fullPage: true });
            return true;
          }
        }
        return false;
      },
      async () => {
        const element = page.locator('text=孟轩').first();
        if (await element.count() > 0) {
          await element.scrollIntoViewIfNeeded();
          const box = await element.boundingBox();
          if (box) {
            // Take full page screenshot
            await page.screenshot({ path: outputPath, fullPage: true });
            return true;
          }
        }
        return false;
      },
      async () => {
        // Check page content for "孟轩"
        const content = await page.content();
        if (content.includes('孟轩')) {
          // Take full page screenshot
          await page.screenshot({ path: outputPath, fullPage: true });
          return true;
        }
        return false;
      }
    ];

    for (const method of methods) {
      if (await method()) {
        console.log(`Found "孟轩" and full page screenshot saved: ${outputPath}`);
        return true;
      }
    }
  } catch (e) {
    console.log(`Error finding "孟轩": ${e.message}`);
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
    const sanitizedTitle = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const outputPath = path.join(OUTPUT_DIR, `${String(index).padStart(3, '0')}_${sanitizedTitle}.png`);
    await takeScreenshot(url, outputPath);
    index++;
  }

  console.log('Screenshots completed!');
}

main().catch(console.error);
