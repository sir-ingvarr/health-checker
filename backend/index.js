const url = require("url");
const  fs = require("fs");
const {startServer} = require('./api');
const { DELAY, ENV } = require('./config');
const getList = require('./list');
const {healthCheck} = require("./health-check");
const {setSiteData, removeSiteData, sitesMap} = require("./sites-map");
const {addScanPortsJobToQueue, removeScanPortsJobFromQueue} = require("./ports-worker");
const {resolveServerIp} = require("./ip-resolve");
// const {db} = require('./db');

let requestInterval, listRenewInterval;
let sitesList = [];

const setIntervals = () => {
    requestInterval = setInterval(() => healthCheck(sitesList), DELAY)
    listRenewInterval = setInterval(async () => {
        const oldList = [].concat(sitesList);
        sitesList = await getList();
        if(sitesList.length === oldList.length) return;
        for(let site of sitesList) {
            if(oldList.includes(site)) continue;
            const urlData = url.parse(`https://${site}`);
            setSiteData(site, { alive: false, reason: 'loading', time: 0, protocol: 'https'});
            await resolveAndSetIp(urlData.host || site);
            if(ENV === 'local') continue;
            addScanPortsJobToQueue(urlData.host || site);
        }
        for(let site of oldList) {
            if(sitesList.includes(site)) continue;
            removeSiteData(site);
            const urlData = url.parse(`https://${site}`);
            if(ENV === 'local') continue;
            removeScanPortsJobFromQueue(urlData.host || site);
        }
    }, 10000)
}

const resolveAndSetIp = async (host, list) => {
    let addressList = list[host] && list[host].addressList;
    if(!addressList || (!addressList[4].length && !addressList[6].length)) {
        addressList = await resolveServerIp(host);
    }
    setSiteData(host, {addressList});
}

const start = async () => {
    sitesList = await getList();
    let fileData = {};
    if(fs.existsSync('./db-data/cache.json')) {
        const file = fs.readFileSync('./db-data/cache.json', { encoding: 'utf-8' });
        fileData = JSON.parse(file);
    }
    for (const element of sitesList) {
        const urlData = url.parse(`https://${element}`);
        setSiteData(element, fileData[element] || { alive: false, reason: 'loading', time: 0, protocol: 'https'});
        const host = urlData.host || element;
        await resolveAndSetIp(host, fileData)
        if(ENV === 'local') continue;
        if(fileData[host] && fileData[host].portsMap && fileData[host].portsMap.length) continue;
        addScanPortsJobToQueue(host);
    }
    healthCheck(sitesList);
    startServer();
    setIntervals();
}

const exit = async code => {
    console.log("exiting", code);
    clearInterval(requestInterval);
    clearInterval(listRenewInterval);
    fs.writeFileSync('./db-data/cache.json', JSON.stringify(sitesMap), {flag: 'w', encoding: 'utf-8'});
    process.exit(0);
}

process.on('SIGINT', exit);

start();
