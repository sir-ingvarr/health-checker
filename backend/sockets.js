const { WebSocketServer } = require('ws');
const https = require("https");
const fs = require("fs");
const path = require("path");
const { WS_PORT, ENV} = require("./config");

class WebsocketHandler {
    constructor() {
        this.opts = {
            port: WS_PORT,
        }
        if(ENV !== 'local') this.opts =  {
            server: https.createServer({
                key: fs.readFileSync(path.resolve(process.cwd(), 'certs/privkey.pem'), 'utf8').toString(),
                cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/fullchain.pem'), 'utf8').toString(),
            })
        }
        this.ws = new WebSocketServer(this.opts);

        if(ENV !== 'local') this.opts.server.listen(WS_PORT);
    }

    BroadcastData(data) {
        this.ws.clients.forEach(client => client.send(JSON.stringify(data)));
    }
}

const websocketHandler = new WebsocketHandler();

module.exports = websocketHandler;