const net = require('net');
const { parentPort, workerData } = require('worker_threads');
const { Socket } = net;
const MAX_PORT = 65535;

const checkPort = (port, host) => new Promise(resolve => {
    const socket = new Socket();
    const resolveResult = (result = false) => () => {
        socket.destroy();
        resolve(result);
    }
    socket.on('connect', resolveResult(true));
    socket.on('timeout', resolveResult());
    socket.on('error', resolveResult());
    socket.on('close', resolveResult());

    socket.setTimeout(5000);
    socket.connect(port, host);
}).catch(console.error);

const timeout = time => new Promise(resolve => setTimeout(resolve, time));

const scanAvailablePorts = async (host, maxConcurrent) => {
    if(!host) return;
    const portsMap = [];
    let promises = [];

    for(let i = 0; i <= MAX_PORT; i++) {
        promises.push(checkPort(i, host).then(result => portsMap[i] = result));
        if(promises.length === maxConcurrent) {
            await Promise.all(promises);
            promises = [];
            await timeout(100)
        }
    }

    const openedPorts = portsMap.reduce((acc, val, index) => {
            if(!val) return acc;
            acc.push(index);
            return acc;
        },
        []);
    console.log(openedPorts)
    if(parentPort) {
        parentPort.postMessage(openedPorts);
        return;
    }
    return openedPorts;
}

if(parentPort) {
    scanAvailablePorts(workerData.address, workerData.maxConcurrent);
}

module.exports = { scanAvailablePorts };
