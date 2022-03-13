const url = require("url");
const {startServer} = require('./api');
const { DELAY, ENV } = require('./config');
const getList = require('./list');
const {healthCheck, resolveServerIp} = require("./health-check");
const {setSiteData} = require("./sites-map");
const {addJobToQueue} = require("./ports-worker");

let interval;

const setIntervals = (list) => {
    interval = setInterval(() => healthCheck(list), DELAY)
}

const start = async () => {
    const list = await getList();
    for (const element of list) {
        const urlData = url.parse(`https://${element}`);
        setSiteData(element, { alive: false, reason: 'loading', time: 0, protocol: 'https'});
        const ip = await resolveServerIp(urlData.host || element);
        const address = ip ? ip.address : null;
        setSiteData(element, {address});
        if(ENV === 'local') continue;
        addJobToQueue(element);
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
