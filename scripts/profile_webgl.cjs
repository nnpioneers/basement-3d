const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    console.log(msg.text());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 60000 });
  
  // Wait a few seconds for the scene to fully render
  await new Promise(r => setTimeout(r, 15000));
  
  await browser.close();
  process.exit(0);
})();
