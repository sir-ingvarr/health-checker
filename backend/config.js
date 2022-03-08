require('dotenv').config();

module.exports = {
    API_PORT: process.env.API_PORT || 24499,
    WS_PORT: process.env.WS_PORT || 25945,
    DELAY: process.env.DELAY || 60000,
    ENV: process.env.ENV || 'local',
}