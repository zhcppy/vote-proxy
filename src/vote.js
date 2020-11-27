const { logger } = require('./logger');
const config = require('./config');
const { Crawler } = require('./crawler');
const fs = require('fs');
const ping = require('ping');

async function proxyConfig() {
	const proxyList = JSON.parse(fs.readFileSync(".proxy.json").toString());
	let aliveProxy = [];
	for (proxy of proxyList) {
		let res = await ping.promise.probe(proxy.split(":")[0]);
		if (!res.alive) {
			continue
		}
		aliveProxy = aliveProxy.concat(proxy)
	}
	fs.writeFileSync(".proxy.json", JSON.stringify(aliveProxy))
}

async function main() {

	const proxyList = JSON.parse(fs.readFileSync(".proxy.json").toString());
	// console.log('proxyList', proxyList);
	let optionArgs = config.browserOption.args;
	for (proxy of proxyList) {
		let vote;
		try {
			// config.browserOption.args = optionArgs.concat('--proxy-server=http://' + proxy)
			console.log(config.browserOption)
			vote = new Crawler(config.browserOption)
			await vote.init()
			const page = await vote.findPageWithGoto("http://www.baidu.com");
			page.on('dialog', async dialog => {
				console.log(dialog.message());
				await dialog.dismiss();
			});
			await page.click('a#vb_9', { delay: this.delay })
			console.log('点击投票成功');
		} catch (err) {
			console.log('failed to error: %s', err);
		} finally {
			console.log('close and exiting ...');
			await vote.browser.close();
		}
	}
}

(async () => await main())();
// (async () => await proxyConfig())();
