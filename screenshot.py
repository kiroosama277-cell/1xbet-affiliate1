import asyncio
from playwright.async_api import async_playwright

async def take_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        
        # 1. Homepage
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto("http://localhost:3000", timeout=30000)
        await page.wait_for_timeout(3000)
        await page.screenshot(path="/home/z/my-project/download/homepage.png", full_page=False)
        print("✅ Homepage")
        await page.close()
        
        # 2. Admin login
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto("http://localhost:3000/admin", timeout=30000)
        await page.wait_for_timeout(2000)
        await page.screenshot(path="/home/z/my-project/download/admin-login.png", full_page=False)
        print("✅ Admin login")
        
        # 3. Fill login and submit
        username_input = page.locator('input[placeholder="مثال: superadmin"]')
        code_input = page.locator('input[placeholder="كود التحقق"]')
        await username_input.fill("superadmin")
        await code_input.fill("17F6413A")
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(4000)
        await page.screenshot(path="/home/z/my-project/download/admin-dashboard.png", full_page=False)
        print("✅ Admin dashboard")
        
        await browser.close()
        print("\n🎉 Done!")

asyncio.run(take_screenshots())
