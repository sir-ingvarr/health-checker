const wsHandler = require("./sockets");

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

const sitesMap = {};

module.exports = {
    getSiteData,
    setSiteData,
    sitesMap
};