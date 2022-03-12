const axios = require("axios");
const sitesMap = require("./sites-map");
const wsHandler = require("./sockets");
const util = require("util");
const dns = require("dns");

const lookup = util.promisify(dns.lookup);

const resolveServerIp = async host => {
    try {
        const result = await lookup(host);
        return result;
    } catch (e) {
        console.log(e.message);
    }
}

const healthCheck = list => {
    list.forEach(element => requestWebsite(element, 'https'));
}

const requestWebsite = async (url, protocol) => {
    const startTimestamp = Date.now();
    try {
        const res = await axios.get(`${protocol}://${url}`);
        const timeConsumed = Date.now() - startTimestamp;
        if(res && res.status === 200 || res.status === 201) {
            setSiteData(url, { alive: true, reason: null, time: timeConsumed, protocol});
            console.log("request to", url, "succeeded in", timeConsumed, "ms");
        }
    } catch (e) {
        const timeConsumed = Date.now() - startTimestamp;
        const reason = detectFail(e);
        if(reason && reason === 'ssl') return requestWebsite(url, 'http');
        console.log("request to", url, "failed in", timeConsumed, "ms with status", reason);
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

const setSiteData = (element, data) => {
    const siteData = sitesMap[element];
    const passedKeys = Object.keys(data);
    let needSet = false;
    for(let key of passedKeys) {
        if(!siteData || !siteData[key] || siteData[key] !== data[key]) {
            needSet = true;
            break;
        }
    }
    if(!needSet) return;
    sitesMap[element] = { ...(siteData || {}), ...data };
    wsHandler.BroadcastData({
        type: "update",
        name: element,
        data: sitesMap[element]
    });
}

const getSiteData = element => sitesMap[element];

module.exports = { healthCheck, setSiteData, resolveServerIp, getSiteData };