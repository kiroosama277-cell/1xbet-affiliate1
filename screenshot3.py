import asyncio
from playwright.async_api import async_playwright

async def take_screenshots():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        
        # Admin page
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto("http://localhost:3000/admin", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Debug: get page content to find the right selectors
        html = await page.content()
        # Find all inputs
        input_elements = await page.query_selector_all('input')
        print(f"Found {len(input_elements)} inputs total")
        for i, inp in enumerate(input_elements):
            placeholder = await inp.get_attribute('placeholder')
            input_type = await inp.get_attribute('type')
            print(f"  Input {i}: type={input_type}, placeholder={placeholder}")
        
        await browser.close()

asyncio.run(take_screenshots())
