const url = require("url");
const { Worker, MessageChannel } = require('worker_threads');
const {startServer} = require('./api');
const { DELAY } = require('./config');
const getList = require('./list');
const {healthCheck, setSiteData, resolveServerIp, getSiteData} = require("./health-check");

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
    }
    healthCheck(list);
    startServer();
    setIntervals(list);
    const messageChannel = new MessageChannel();
    spawnPortScanner(list, 0, messageChannel);
}

const spawnPortScanner = (list, id) => {
    const data = getSiteData(list[id]);
    const {address} = data;
    if(!address) spawnPortScanner(list, ++id);
    const worker = new Worker('./portScanner.js', { workerData: { address: address || list[id] } });
    worker.once('message', portsMap => {
        setSiteData(list[id], {portsMap});
        spawnPortScanner(list, ++id);
    })
}

const exit = async code => {
    console.log("exiting", code);
    clearInterval(interval);
    process.exit(0);
}

process.on('SIGINT', exit);

start();
