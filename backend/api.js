const Koa = require("koa");
const koaRouter = require("koa-router");
const {ENV, API_PORT} = require("./config");
const list = require("./list");
const sitesMap = require('./sites-map');
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = new Koa();
const router = koaRouter();

router.get('/list', (ctx, next) => {
    ctx.body = JSON.stringify(list);
});

router.get('/get-statuses', (ctx, next) => {
    ctx.body = JSON.stringify(sitesMap);
});

router.get('/', (ctx, next) => {
    ctx.body = "ok";
});

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'GET');
    await next();
});

app.use(router.routes());

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

module.exports = {
    app, startServer
};