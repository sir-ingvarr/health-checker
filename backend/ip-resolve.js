const dns = require("dns");

const resolveServerIp = host => new Promise((resolve) => {
    dns.lookup(host, {all:true}, (err, result) => {
        if(err)  {
            console.log(err.message);
            return resolve({ 4: [], 6: []});
        }
        return resolve(result.reduce((acc, val) => {
            const { family, address } = val;
            acc[family].push(address);
            return acc;
        }, {
            4: [],
            6: []
        }));
    });
})

module.exports = {resolveServerIp};
