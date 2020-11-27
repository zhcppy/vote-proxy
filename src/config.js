const os = require('os');
const utils = require('./utils');

const env = process.env.NODE_ENV
	? process.env.NODE_ENV : process.env.npm_package_config_env;

let logLevel = process.env.npm_package_config_logLevel;

let browserOption = {
	// dumpio: true, // 将浏览器进程标准输出和标准错误输入到 process.stdout 和 process.stderr 中
	// slowMo: 250,// 放慢 Puppeteer 的运行速度
	// executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
	devtools: true, // 自动打开 DevTools 面板
	// pipe: true, // 通过管道而不是WebSocket连接到浏览器
	timeout: 60000, // 60s
	headless: false, // 关闭 Headless Chrome
	ignoreHTTPSErrors: true, // 忽略 HTTPS 错误
	userDataDir: './data', // 用户数据目录
	defaultViewport: null, //{width: 1920, height: 1080}
	args: [
		// '--window-size=1920,1080',
		// '--proxy-server=socks5://127.0.0.1:1086', //设置代理服务
		'--disable-notifications',
		// '--remote-debugging-port=9222',
	],
};

if (env === 'production' || os.platform() === 'linux') {
	browserOption = {
		headless: true,
		ignoreHTTPSErrors: true, // 忽略 HTTPS 错误
		args: [
			// '--no-sandbox',
			// '--disable-setuid-sandbox',
			'--disable-notifications',
		]
	};
	// if (env === 'production') {
	// 	logLevel = logLevel ? logLevel : 'info';
	// }
	(async () => {
		await utils.rmdir("./data")
	})()
}

if (env === 'test') {
	browserOption = {
		headless: false,
		userDataDir: './test/data',
		args: [
			'--disable-notifications',
		]
	};
	logLevel = logLevel ? logLevel : 'debug';
}

module.exports = {
	env,
	logLevel,
	browserOption,
};
