const axios = require("axios");
const sitesMap = require("./sites-map");
const wsHandler = require("./sockets");

const healthCheck = list => {
    list.forEach(element => requestWebsite(element, 'https'));
}

const requestWebsite = async (url, protocol) => {
    const startTimestamp = Date.now();
    try {
        const res = await axios.get(`${protocol}://${url}`);
        const timeConsumed = Date.now() - startTimestamp;
        if(res && res.status === 200 || res.status === 201) {
            setSiteData(url, true, null, timeConsumed);
            console.log("request to", url, "succeeded in", timeConsumed, "ms");
        }
    } catch (e) {
        const timeConsumed = Date.now() - startTimestamp;
        const reason = detectFail(e);
        if(reason && reason === 'ssl') return requestWebsite(url, 'http');
        console.log("request to", url, "failed in", timeConsumed, "ms with status", reason);
        setSiteData(url, false, reason, timeConsumed);
    }
}

const detectFail = (e) => {
    const {message, response, code} = e;
    if(/ETIMEDOUT/gi.test(message)) return "timeout";
    if(/EPROTO/gi.test(message)) return "ssl";
    if(code) {
        if(code === "ECONNRESET") return "sleeping";
        if(code === "ENOTFOUND") return "sleeping";
        if(code === "ECONNREFUSED") return "protected?";
    }
    if(!response) return;
    if(response.status === 503) return "sleeping";
    if(response.status === 403) return "protected";
}

const setSiteData = (element, alive, reason, time) => {
    const siteData = sitesMap[element];
    const needSet = !siteData || (siteData.alive !== alive || siteData.reason !== reason  || siteData.time !== time);
    if(!needSet) return;
    sitesMap[element] = { alive, reason, time };
    wsHandler.BroadcastData({
        type: "update",
        name: element,
        data: { alive, reason, time }
    });
}

module.exports = { healthCheck, setSiteData };