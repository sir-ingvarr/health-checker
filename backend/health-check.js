const axios = require("axios");

const {setSiteData, getSiteData} = require("./sites-map");
const {addScanPortsJobToQueue} = require("./ports-worker");
const {ENV} = require("./config");

const requestsMap = {};

const healthCheck = list => {
    list.forEach(element => {
        if(requestsMap[element]) return;
        requestsMap[element] = true;
        requestWebsite(element, 'https').then(() => requestsMap[element] = false);
    });
}

const requestWebsite = async (url, protocol) => {
    const startTimestamp = Date.now();
    try {
        const res = await axios.get(`${protocol}://${url}`, {
            timeout: 60000
        });
        const timeConsumed = Date.now() - startTimestamp;
        if(res && res.status < 400 && res.status > 199) {
            const currentData = getSiteData(url);
            if(ENV !== 'local' && currentData && (!currentData.alive || !currentData.portsMap || !currentData.portsMap.length))
                addScanPortsJobToQueue(url);
            setSiteData(url, { alive: true, reason: null, time: timeConsumed, protocol});
        } else {
            setSiteData(url, { alive: false, reason: res.status, time: timeConsumed, protocol});
        }
    } catch (e) {
        const timeConsumed = Date.now() - startTimestamp;
        const reason = detectFail(e);
        if(reason && reason === 'ssl') return requestWebsite(url, 'http');
        setSiteData(url, { alive: false, reason: reason, time: timeConsumed, protocol});
    }
}

const detectFail = (e) => {
    const {message, response, code} = e;
    if(/ETIMEDOUT/gi.test(message)) return "timeout";
    if(/EPROTO/gi.test(message) || /certificate/gi.test(message) || code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') return "ssl";
    if(code) {
        if(["EHOSTUNREACH", "ECONNRESET", "ENOTFOUND"].includes(code)) return "sleeping";
        if(code === "ECONNREFUSED") return "protected?";
    }
    if(!response) return;
    if([503, 502, 453].includes(response.status)) return "sleeping";
    if(response.status === 403) return "protected";
}

module.exports = { healthCheck };