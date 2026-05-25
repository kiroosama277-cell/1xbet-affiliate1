import { createServer } from 'http';
import pkg from './.next/standalone/server.js';
const handler = pkg.default || pkg;
import { chromium } from 'playwright';

async function main() {
  // Start the standalone server
  const server = createServer(handler);
  await new Promise(resolve => server.listen(3001, resolve));
  console.log('✅ Server started on port 3001');
  
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  // Homepage
  const page1 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page1.goto('http://127.0.0.1:3001', { timeout: 30000 });
  await page1.waitForTimeout(3000);
  await page1.screenshot({ path: '/home/z/my-project/download/homepage.png' });
  console.log('✅ Homepage');
  await page1.close();
  
  // Admin login
  const page2 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page2.goto('http://127.0.0.1:3001/admin', { timeout: 30000 });
  await page2.waitForTimeout(4000);
  await page2.screenshot({ path: '/home/z/my-project/download/admin-login.png' });
  console.log('✅ Admin login');
  
  // Fill and submit login
  const inputs = await page2.$$('input');
  console.log(`Found ${inputs.length} inputs`);
  if (inputs.length >= 2) {
    await inputs[0].fill('superadmin');
    await inputs[1].fill('17F6413A');
    await page2.click('button[type="submit"]');
    await page2.waitForTimeout(5000);
    await page2.screenshot({ path: '/home/z/my-project/download/admin-dashboard.png' });
    console.log('✅ Dashboard');
    
    // Navigate tabs
    for (const [text, file] of [['التسجيلات','admin-registrations'],['فريق السيلز','admin-sales'],['المستخدمين','admin-users'],['الإعدادات','admin-settings']]) {
      try {
        await page2.click(`text=${text}`);
        await page2.waitForTimeout(1500);
        await page2.screenshot({ path: `/home/z/my-project/download/${file}.png` });
        console.log(`✅ ${text}`);
      } catch(e) {
        console.log(`❌ ${text}: ${e.message}`);
      }
    }
  }
  
  await browser.close();
  server.close();
  console.log('🎉 Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
