const net = require('net');
const { parentPort, workerData } = require('worker_threads');
const { Socket } = net;
const MAX_PORT = 65535;
const HALF_PORTS = 32250;


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

const scanAvailablePorts = async (host = workerData.address) => {
    const portsMap = [];
    let promises = [];
    // 1 half at a time to leave free ports
    for(let i = 0; i <= HALF_PORTS; i++) {
        promises.push(checkPort(i, host).then(result => portsMap[i] = result));
    }
    const resultsHalf1 = await Promise.all(promises);
    promises = [];
    for(let i = HALF_PORTS; i <= MAX_PORT; i++) {
        promises.push(checkPort(i, host).then(result => portsMap[i] = result));
    }
    const resultsHalf2 = await Promise.all(promises);
    const fullResult = [].concat(resultsHalf1, resultsHalf2);
    const openedPorts = fullResult.reduce((acc, val, index) => {
            if(!val) return acc;
            acc.push(index);
            return acc;
        },
        []);
    if(parentPort) {
        parentPort.postMessage(openedPorts);
        return;
    }
    return openedPorts;
}
if(parentPort) {
    scanAvailablePorts();
}

module.exports = { scanAvailablePorts };
