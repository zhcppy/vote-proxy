const config = require('./config');
const winston = require('winston');
const {createLogger, transports, format} = winston;

//'usable log level' --> [ 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly' ]

const formats = format.combine(
    format.label({label: config.projectName}),
    format.ms(),
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.splat(),
    format.errors(),
    format.json()); // json logstash printf prettyPrint simple

const logger = createLogger({
    // defaultMeta: {service: config.projectName},
    silent: config.logLevel === false,
    level: config.logLevel,
    levels: winston.config.npm.levels,
    format: formats,
    transports: [
        new transports.File({colorize: false, json: true, filename: './logs/app.log', maxsize: 5242880, maxFiles: 5}),
        new transports.File({colorize: false, json: true, filename: './logs/error.log', level: 'error'}),
        // new transports.MongoDB({ db: 'db', level: 'info'})
    ],
    exceptionHandlers: [
        new transports.File({colorize: false, json: true, filename: './logs/exceptions.log'})
    ]
});

if (config.env !== 'production') {
    const myFormat = format.printf(({level, message, label, timestamp}) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });
    const formats = format.combine(
        format.colorize({all: true}), format.align(), myFormat);
    logger.add(new transports.Console({format: formats}));
}

logger.on('finish', function (info) {
    console.log('===>', 'logger on finish', info)
});

logger.on('error', function (err) {
    console.log('===>', 'logger on error', err);
});

logger.info('================================================================================');

module.exports = {
    logger
};
