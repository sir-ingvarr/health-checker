const {startServer} = require('./api');
const { DELAY } = require('./config');
const getList = require('./list');
const {healthCheck, setSiteData, resolveServerIp} = require("./health-check");
const url = require("url");

let interval;

const setIntervals = (list) => {
    interval = setInterval(() => healthCheck(list), DELAY)
}

const start = async () => {
    const list = await getList();
    for (const element of list) {
        const urlData = url.parse(`https://${element}`);
        const ip = await resolveServerIp(urlData.host || element);
        const address = ip ? ip.address : 'unresolved';
        setSiteData(element, false, 'loading', 0, 'https', address);
    }
    healthCheck(list);
    startServer();
    setIntervals(list);
}

const exit = async code => {
    console.log("exiting", code);
    clearInterval(interval);
    process.exit(0);
}

process.on('SIGINT', exit);

start();
