const { logger } = require('./logger');
const config = require('./config');
const { Crawler } = require('./crawler');

async function main() {

	const browser = new Crawler(config.browserOption)
	await browser.init()
	const feeProxyPage = await browser.findPageWithGoto("https://www.kuaidaili.com/free/");
	const trList = await feeProxyPage.$('tbody tr')
	console.log(await trList.getProperty('textContent'));
	// for (let i = 0; i < length(trList.length); i++) {
	// 	trList[0].$('td')[0].getProperty('textContent')
	// }
	let trs = $('tbody tr')
	let data;
	for (let i = 0; i < 15; i++) {
		// data = data +
		// 	'\n"' + trs[i].getElementsByTagName('td')[0].textContent + ":" + trs[i].getElementsByTagName('td')[1].textContent+'",'

		// data = data +
		// 	'\n"' + trs[i].getElementsByTagName('td')[0].textContent +'",'

		data = data +
			'\n"' + trs[i].getElementsByTagName('td')[0].innerText + ":" + trs[i].getElementsByTagName('td')[1].innerText+'",'
	}
	console.log(data)
}

(async () => await main())();

