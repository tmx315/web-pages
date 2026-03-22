const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const FRIENDS_CONFIG_PATH = path.join(__dirname, '../src/config/friendsConfig.ts');
const OUTPUT_DIR = path.join(__dirname, '../public/gallery/friends');

async function extractSiteUrls() {
  const content = fs.readFileSync(FRIENDS_CONFIG_PATH, 'utf-8');

  const urlRegex = /siteurl:\s*["']([^"']+)["']/g;
  const enabledRegex = /enabled:\s*(true|false)/g;

  const urls = [];
  let match;
  let lastIndex = 0;
  const matches = [];

  while ((match = urlRegex.exec(content)) !== null) {
    matches.push({ url: match[1], index: match.index });
  }

  const enabledMatches = [];
  while ((match = enabledRegex.exec(content)) !== null) {
    enabledMatches.push({ enabled: match[1] === 'true', index: match.index });
  }

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

async function takeScreenshot(url, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Screenshot saved: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to screenshot ${url}: ${error.message}`);
  } finally {
    await browser.close();
  }
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
