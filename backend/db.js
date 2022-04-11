const { Low, JSONFile } = require('lowdb');

const adapter = new JSONFile('./db-data/data.json');
const db = new Low(adapter);

(() => db.read())()
    .then(() => db.data ||= { ips: {}, ports: {} })



module.exports = { db };
