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

module.exports = {resolveServerIp};
