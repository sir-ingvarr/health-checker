const Koa = require("koa");
const koaRouter = require("koa-router");
const list = require("./list");
const sitesMap = require('./sites-map');

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
})

app.use(router.routes());

module.exports = app;