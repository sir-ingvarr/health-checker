const axios = require('axios');
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { API_PORT, DELAY, ENV } = require('./config');
const app = require('./api');
const list = require('./list');
const sitesMap = require('./sites-map');
const wsHandler = require('./sockets');

let interval;

const startServer = () => {
    const cb = app.callback();
    const server = ENV === 'local'
        ? http.createServer(cb)
        : https.createServer({
            key: fs.readFileSync(path.resolve(process.cwd(), 'certs/privkey.pem'), 'utf8').toString(),
            cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/fullchain.pem'), 'utf8').toString(),
        }, cb)
    server.listen(API_PORT).on("listening", () => console.log(`listening ${API_PORT}`));
}

const healthCheck = () => {
    list.forEach(async (element) => requestWebsite(element, 'https'));
}

const requestWebsite = async (url, protocol) => {
    const startTimestamp = Date.now(); 
    try {
        const res = await axios.get(`${protocol}://${url}`);
        const timeConsumed = Date.now() - startTimestamp;
        if(res && res.status === 200 || res.status === 201) {
            updateSiteData(url, true, null, timeConsumed);
            console.log("request to", url, "succeeded in", timeConsumed, "ms");
        }
    } catch (e) {
        const timeConsumed = Date.now() - startTimestamp;
        const reason = detectFail(e);
        if(reason && reason === 'ssl') return requestWebsite(url, 'http');
        console.log("request to", url, "failed in", timeConsumed, "ms with status", reason);
        updateSiteData(url, false, reason, timeConsumed);
    }
}

const detectFail = (e) => {
    const {message, response, code} = e;
    if(/ETIMEDOUT/gi.test(message)) return "timeout";
    if(/EPROTO/gi.test(message)) return "ssl";
    if(code) {
        if(code === "ECONNRESET") return "sleeping";
        if(code === "ENOTFOUND") return "sleeping";
        if(code === "ECONNREFUSED") return "block?";
    }
    if(!response) return;
    if(response.status === 503) return "sleeping";
    if(response.status === 403) return "block";
}

const updateSiteData = (element, alive, reason, time) => {
    const siteData = sitesMap[element];
    const isUpdated = siteData && (siteData.alive !== alive || siteData.reason !== reason  || siteData.time !== time);
    if(!isUpdated) return;
    sitesMap[element] = { alive, reason, time };
    wsHandler.BroadcastData({
        type: "update",
        name: element,
        data: { alive, reason, time }
    });
}

const setIntervals = () => {
    interval = setInterval(healthCheck, DELAY)
}

const start = () => {
    list.forEach(element => {
        console.log("adding ", element, " to the map.");
        sitesMap[element] = {
            alive: false,
            reason: '',
            responseTime: 0,
        };
    });
    healthCheck();
    startServer();
    setIntervals();
}

start();
