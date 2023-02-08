const puppeteer = require('puppeteer-core');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down');

const format = require('date-fns/format');
const workTime = format(new Date(), 'yyyyMMdd_HHmmss');
const urlFormat = (url) => url.replace(/:|\/|#/g, '_');

const fs = require('fs');
const screenshotDir = './screenshot';

if (!fs.existsSync(screenshotDir)){
  fs.mkdirSync(screenshotDir);
}

const urls = [
  'https://kitahamaip.com/',
  'https://kitahamaip.com/about/'
];

(async (urls) => {
  await urls.forEach(async (url) => {
    const browser = await puppeteer.launch({
      channel: 'chrome',
      headless: true,
      args: ['--lang=ja']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1000, deviceScaleFactor: 2 });
    await page.goto(url);

    await page.evaluate(_ => {
        window.scrollTo(0, 0);
    });
    const lastPosition = await scrollPageToBottom(page, {
      size: 1000,
      delay: 500,
      // stepsLimit: 200
    })

    await page.waitForSelector('#main_header, #sub_header')
    await page.evaluate(() => {
      if (window.scrollY > 120) {
        let elementsDelete = document.querySelectorAll('#main_header, #sub_header');
        elementsDelete.forEach((elementDelete) => {
          elementDelete.parentNode.removeChild(elementDelete);
        })
      }
    });

    await page.screenshot({ path: `./${screenshotDir}/${urlFormat(url)}.png`, fullPage: true });

    await browser.close();
  })
})(urls);