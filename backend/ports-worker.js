const {getSiteData, setSiteData} = require("./sites-map");
const {Worker} = require("worker_threads");

const jobQueue = [];
let jobRunning = false;

let worker;

const spawnPortScanner = host => {
    if(jobRunning) return;
    const data = getSiteData(host);
    const {address} = data;
    if(!address) {
        getNextElement();
        return;
    }
    jobRunning = true;
    if(!worker) {
        worker = new Worker('./port-scanner.js', {workerData: {host, address: address || host, maxConcurrent: 1000}});
        worker.on('message', ({scannedHost, portsMap}) => {
            setSiteData(scannedHost, {portsMap});
            jobRunning = false;
            getNextElement();
        })
    }
    else {
        worker.postMessage({host, address: address || host, maxConcurrent: 1000})
    }
}

const addJobToQueue = host => {
    if(!jobQueue.length && !jobRunning) {
        spawnPortScanner(host);
        return;
    }
    if(!jobQueue.includes(host)) jobQueue.push(host);
}

const getNextElement = () => {
    const nextElement = jobQueue.length ? jobQueue.shift() : null;
    if(!nextElement) return;
    spawnPortScanner(nextElement)
}

module.exports = { addJobToQueue };