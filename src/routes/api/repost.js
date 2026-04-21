/**
 * @description 转发 API 路由
 * @author milk
 */

const router = require("koa-router")({ prefix: "/api/repost" })
const { loginCheck } = require("../../middlewares/loginChecks")
const { create, cancel, check, getList, getRepostInfo } = require("../../controller/repost")

router.post("/create", loginCheck, async (ctx, next) => {
    const { sourceBlogId, content } = ctx.request.body
    ctx.body = await create(ctx, { sourceBlogId, content })
})

router.post("/cancel", loginCheck, async (ctx, next) => {
    const { blogId } = ctx.request.body
    ctx.body = await cancel(ctx, { blogId })
})

router.get("/check", loginCheck, async (ctx, next) => {
    const { blogId } = ctx.query
    ctx.body = await check(ctx, { blogId: parseInt(blogId) })
})

router.get("/list", loginCheck, async (ctx, next) => {
    const { blogId, pageIndex, includeAll } = ctx.query
    ctx.body = await getList(ctx, {
        blogId: parseInt(blogId),
        pageIndex: pageIndex ? parseInt(pageIndex) : 0,
        includeAll: includeAll !== 'false'
    })
})

router.get("/info", loginCheck, async (ctx, next) => {
    const { blogId } = ctx.query
    ctx.body = await getRepostInfo(ctx, { blogId: parseInt(blogId) })
})

module.exports = router
