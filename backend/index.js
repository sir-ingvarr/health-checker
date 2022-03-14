const url = require("url");
const {startServer} = require('./api');
const { DELAY, ENV } = require('./config');
const getList = require('./list');
const {healthCheck} = require("./health-check");
const {setSiteData} = require("./sites-map");
const {addScanPortsJobToQueue} = require("./ports-worker");
const {resolveServerIp} = require("./ip-resolve");

let requestInterval, listRenewInterval;
let sitesList = [];

const setIntervals = () => {
    requestInterval = setInterval(() => healthCheck(sitesList), DELAY)
    listRenewInterval = setInterval(async () => {
        const oldList = [].concat(sitesList);
        sitesList = getList();
        if(sitesList.length === oldList.length) return;
        for(let site of oldList) {
            if(sitesList.includes(site)) continue;
            const urlData = url.parse(`https://${site}`);
            await resolveAndSetIp(urlData.host || site);
            if(ENV === 'local') continue;
            addScanPortsJobToQueue(urlData.host || site);
        }
    }, 300000)
}

const resolveAndSetIp = async host => {
    const ip = await resolveServerIp(host);
    const address = ip ? ip.address : null;
    setSiteData(host, {address});
}

const start = async () => {
    sitesList = await getList();
    for (const element of sitesList) {
        const urlData = url.parse(`https://${element}`);
        setSiteData(element, { alive: false, reason: 'loading', time: 0, protocol: 'https'});
        await resolveAndSetIp(urlData.host || element)
        if(ENV === 'local') continue;
        addScanPortsJobToQueue(urlData.host || element);
    }
    healthCheck(sitesList);
    startServer();
    setIntervals();
}

const exit = async code => {
    console.log("exiting", code);
    clearInterval(requestInterval);
    clearInterval(listRenewInterval);
    process.exit(0);
}

process.on('SIGINT', exit);

start();
