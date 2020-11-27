const puppeteer = require('puppeteer');
const { logger } = require('./logger');

logger.debug('The current running browser address: %s', puppeteer.executablePath());

class Crawler {

	// delay: 停留100毫秒,模拟用户输入
	constructor(option, delay = 100) {
		this.delay = delay;
		this.launchOpts = option;
		const port = option.args.find(a => a.includes('remote-debugging-port'));
		this.browserURL = port ? 'http://127.0.0.1:' + port.split('=')[1] : '';
	}

	async init() {
		if (this.browserURL !== '') {
			try {
				this.browser = await puppeteer.connect({
					browserURL: this.browserURL, defaultViewport: this.launchOpts.defaultViewport
				});
				logger.info('browser connect success, version: %s', await this.browser.version());
			} catch (err) {
				logger.error('browser connect failed, error: %s', err);
				this.browserURL = ''
			}
		}
		if (this.browserURL === '') {
			this.browser = await puppeteer.launch(this.launchOpts);
			logger.info("browser launch success, version: %s, pid: %d", await this.browser.version(), this.browser.process().pid);
		}

		const wsEndpoint = this.browser.wsEndpoint();
		if (wsEndpoint !== '') {
			logger.info("devtool websocket endpoint: %s", wsEndpoint);
		}
		return wsEndpoint
	}

	async closeBlankPage() {
		const pages = await this.browser.pages();
		for (const page of pages) {
			if (page.url() === 'about:blank') {
				await page.close()
			}
		}
	}

	async closePageBy(title) {
		const pages = await this.browser.pages();
		for (const page of pages) {
			if ((await page.title()).includes(title)) {
				await page.close()
			}
		}
	}

	async findPage(url) {
		const url1 = Crawler.parseUrl(url);
		const id = url1.searchParams.get('id');
		const sk = url1.searchParams.get('sk');
		if (id && sk) {
			return (await this.browser.pages()).find(page => {
				const url2 = Crawler.parseUrl(page.url());
				return url2.searchParams.get('id') === id && url2.searchParams.get('sk') === sk
			});
		}
		return (await this.browser.pages()).find(page => {
			const url2 = Crawler.parseUrl(page.url());
			return (url1.host === url2.host && url1.pathname === url2.pathname);
		});
	}

	async findPageWithGoto(url) {
		logger.debug(`findPageWithGoto url:${url}`);
		const page = await this.findPage(url);
		if (page) {
			logger.debug(`find page url: ${page.url()}`);
			await page.bringToFront();
			return page
		}
		const newPage = await this.browser.newPage();
		await newPage.goto(url);
		logger.info('new page title: %s, url: %s', await newPage.title(), newPage.url());
		return newPage
	}

	static parseUrl(url) {
		return new (require('url')).URL(url)
	}

	async getPropertyContent(element, ...names) {
		if (names.length === 0) {
			return await (await element.getProperty('textContent')).jsonValue()
		}
		if (names.length >= 1) {
			return await this.getPropertyContent(await element.$(names[0]), ...names.slice(1))
		}
	}

	async getPropertyValue(element, name, selector) {
		if (selector) {
			return await (await (await element.$(selector)).getProperty(name)).jsonValue()
		}
		return await (await element.getProperty(name)).jsonValue()
	}
}

module.exports = {
	Crawler
};
