import { createServer } from 'http';
import next from 'next';
import { chromium } from 'playwright';

const app = next({ dev: false, dir: '/home/z/my-project' });
const handle = app.getRequestHandler();

async function main() {
  await app.prepare();
  console.log('✅ Next.js prepared');
  
  const server = createServer(handle);
  await new Promise(resolve => server.listen(3002, resolve));
  console.log('✅ Server listening on port 3002');
  
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  console.log('✅ Browser launched');
  
  // Homepage
  const page1 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page1.goto('http://127.0.0.1:3002', { timeout: 30000 });
  await page1.waitForTimeout(3000);
  await page1.screenshot({ path: '/home/z/my-project/download/homepage.png' });
  console.log('✅ Homepage screenshot');
  await page1.close();
  
  // Admin login
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page2.goto('http://127.0.0.1:3002/admin', { timeout: 30000 });
  await page2.waitForTimeout(4000);
  await page2.screenshot({ path: '/home/z/my-project/download/admin-login.png' });
  console.log('✅ Admin login screenshot');
  
  // Fill login
  const inputs = await page2.$$('input');
  console.log(`Found ${inputs.length} inputs`);
  if (inputs.length >= 2) {
    await inputs[0].fill('superadmin');
    await inputs[1].fill('17F6413A');
    await page2.click('button[type="submit"]');
    await page2.waitForTimeout(5000);
    await page2.screenshot({ path: '/home/z/my-project/download/admin-dashboard.png' });
    console.log('✅ Dashboard screenshot');
    
    // Navigate tabs
    for (const [tab, file] of [['التسجيلات','admin-registrations'], ['فريق السيلز','admin-sales'], ['المستخدمين','admin-users'], ['الإعدادات','admin-settings']]) {
      try {
        const loc = page2.locator(`button:has-text("${tab}")`);
        if (await loc.count() > 0) {
          await loc.first().click();
          await page2.waitForTimeout(1500);
          await page2.screenshot({ path: `/home/z/my-project/download/${file}.png` });
          console.log(`✅ ${tab}`);
        }
      } catch(e) {
        console.log(`❌ ${tab}: ${e.message}`);
      }
    }
  }
  
  await browser.close();
  server.close();
  console.log('🎉 All screenshots done!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
