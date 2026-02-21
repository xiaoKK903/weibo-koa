const path = require("path");
const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const session = require("koa-generic-session");
const redisStore = require("koa-redis");
const koaStatic = require("koa-static");

const { REDIS_CONF } = require("./conf/db");
const { isProd } = require("./utils/env");
const { SESSION_SECRET_KEY } = require("./conf/secretKeys");

// 路由
const squareAPIRouter = require("./routes/api/blog-square");
const profileAPIRouter = require("./routes/api/blog-profile");
const homeAPIRouter = require("./routes/api/blog-home");
const blogViewRouter = require("./routes/view/blog");
const utilsAPIRouter = require("./routes/api/utils");
const userViewRouter = require("./routes/view/user");
const userAPIRouter = require("./routes/api/user");
const errorViewRouter = require("./routes/view/error");

// error handler
let onerrorConf = {};
if (isProd) {
  onerrorConf = {
    redirect: "/error",
  };
}
onerror(app, onerrorConf);

// ########## 核心：全局错误捕获中间件（放在最前面） ##########
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 打印完整错误栈到控制台（关键！）
    console.error("===== 接口执行错误 =====");
    console.error("错误类型：", err.name);
    console.error("错误信息：", err.message);
    console.error("错误栈：", err.stack);
    console.error("======================");

    // 自定义 500 响应（避免返回默认的 HTML 错误页）
    ctx.status = err.status || 500;
    ctx.body = {
      code: -1,
      msg: "服务器内部错误",
      error: process.env.NODE_ENV === "development" ? err.message : "", // 开发环境返回错误信息
    };
  }
});

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  }),
);
app.use(json());
app.use(logger());
app.use(koaStatic(__dirname + "/public"));
app.use(koaStatic(path.join(__dirname, "..", "uploadFiles")));

app.use(
  views(__dirname + "/views", {
    extension: "ejs",
  }),
);

// session 配置
app.keys = [SESSION_SECRET_KEY];
app.use(
  session({
    key: "weibo.sid", // cookie name 默认是 `koa.sid`
    prefix: "weibo:sess:", // redis key 的前缀，默认是 `koa:sess:`
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 单位 ms
    },
    store: redisStore({
      all: `${REDIS_CONF.host}:${REDIS_CONF.port}`,
    }),
  }),
);

// routes
app.use(squareAPIRouter.routes(), squareAPIRouter.allowedMethods());
app.use(profileAPIRouter.routes(), profileAPIRouter.allowedMethods());
app.use(homeAPIRouter.routes(), homeAPIRouter.allowedMethods());
app.use(blogViewRouter.routes(), blogViewRouter.allowedMethods());
app.use(utilsAPIRouter.routes(), utilsAPIRouter.allowedMethods());
app.use(userAPIRouter.routes(), userAPIRouter.allowedMethods());
app.use(userViewRouter.routes(), userViewRouter.allowedMethods());
app.use(errorViewRouter.routes(), errorViewRouter.allowedMethods()); // 404 路由注册到最后面

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
