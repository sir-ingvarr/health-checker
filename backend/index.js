const {startServer} = require('./api');
const { DELAY } = require('./config');
const getList = require('./list');
const {healthCheck, setSiteData} = require("./health-check");

let interval;


const setIntervals = (list) => {
    interval = setInterval(() => healthCheck(list), DELAY)
}

const start = async () => {
    const list = await getList();
    list.forEach(element => {
        setSiteData(element, false, 'loading', 0, 'https');
    });
    healthCheck(list);
    startServer();
    setIntervals(list);
}

const exit = async code => {
    console.log("exiting", code);
    clearInterval(interval);
    process.exit(0);
}

process.on('SIGINT', exit);

start();
