import asyncio
from playwright.async_api import async_playwright

async def take_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        
        # 1. Homepage
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto("http://localhost:3000", timeout=30000)
        await page.wait_for_timeout(4000)
        await page.screenshot(path="/home/z/my-project/download/homepage.png", full_page=False)
        print("✅ Homepage")
        await page.close()
        
        # 2. Admin login - wait for JS to hydrate
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto("http://localhost:3000/admin", timeout=30000)
        # Wait for the login form to appear (JS hydration)
        await page.wait_for_selector('input', timeout=15000)
        await page.wait_for_timeout(1000)
        await page.screenshot(path="/home/z/my-project/download/admin-login.png", full_page=False)
        print("✅ Admin login")
        
        # 3. Fill and login
        inputs = await page.query_selector_all('input')
        print(f"Found {len(inputs)} inputs")
        for i, inp in enumerate(inputs):
            placeholder = await inp.get_attribute('placeholder')
            visible = await inp.is_visible()
            print(f"  Input {i}: placeholder={placeholder}, visible={visible}")
        
        # Fill username (first input) and code (second input)
        if len(inputs) >= 2:
            await inputs[0].fill("superadmin")
            await inputs[1].fill("17F6413A")
            await page.wait_for_timeout(500)
            await page.screenshot(path="/home/z/my-project/download/admin-login-filled.png", full_page=False)
            print("✅ Login filled")
            
            # Submit
            submit_btn = await page.query_selector('button[type="submit"]')
            await submit_btn.click()
            await page.wait_for_timeout(5000)
            await page.screenshot(path="/home/z/my-project/download/admin-dashboard.png", full_page=False)
            print("✅ Dashboard")
            
            # Navigate tabs
            for tab_name, filename in [
                ('التسجيلات', 'admin-registrations'),
                ('فريق السيلز', 'admin-sales'),
                ('المستخدمين', 'admin-users'),
                ('الإعدادات', 'admin-settings'),
            ]:
                try:
                    await page.click(f'text={tab_name}')
                    await page.wait_for_timeout(1500)
                    await page.screenshot(path=f"/home/z/my-project/download/{filename}.png", full_page=False)
                    print(f"✅ {tab_name}")
                except Exception as e:
                    print(f"❌ {tab_name}: {e}")
        
        await browser.close()
        print("\n🎉 All screenshots done!")

asyncio.run(take_screenshots())
