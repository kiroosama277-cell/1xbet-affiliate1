import asyncio
from playwright.async_api import async_playwright

async def take_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        
        # Admin login - fill and submit
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto("http://localhost:3000/admin", timeout=30000)
        await page.wait_for_timeout(2000)
        
        # Use more generic selectors
        inputs = await page.locator('input[type="text"]').all()
        print(f"Found {len(inputs)} text inputs")
        
        if len(inputs) >= 2:
            await inputs[0].fill("superadmin")
            await inputs[1].fill("17F6413A")
            await page.wait_for_timeout(500)
            await page.screenshot(path="/home/z/my-project/download/admin-login-filled.png", full_page=False)
            print("✅ Login filled")
            
            # Submit
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(4000)
            await page.screenshot(path="/home/z/my-project/download/admin-dashboard.png", full_page=False)
            print("✅ Dashboard")
            
            # Click registrations tab
            await page.click('text=التسجيلات')
            await page.wait_for_timeout(2000)
            await page.screenshot(path="/home/z/my-project/download/admin-registrations.png", full_page=False)
            print("✅ Registrations")
            
            # Click sales tab
            await page.click('text=فريق السيلز')
            await page.wait_for_timeout(2000)
            await page.screenshot(path="/home/z/my-project/download/admin-sales.png", full_page=False)
            print("✅ Sales")
            
            # Click admin users tab
            await page.click('text=المستخدمين')
            await page.wait_for_timeout(2000)
            await page.screenshot(path="/home/z/my-project/download/admin-users.png", full_page=False)
            print("✅ Admin users")
        
        await browser.close()
        print("\n🎉 Done!")

asyncio.run(take_screenshots())
