const { WebSocketServer } = require('ws');
const { WS_PORT } = require("./config");

class WebsocketHandler {
    constructor() {
        this.ws = new WebSocketServer({ port: WS_PORT });
    }

    BroadcastData(data) {
        this.ws.clients.forEach(client => client.send(JSON.stringify(data)));
    }

}

const websocketHandler = new WebsocketHandler();

module.exports = websocketHandler;