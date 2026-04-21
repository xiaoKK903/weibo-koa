/**
 * @description 话题 API 路由
 * @author milk
 */

const router = require("koa-router")({ prefix: "/api/topic" })
const { loginCheck } = require("../../middlewares/loginChecks")
const { getList, search, getDetail, getBlogs, getHot } = require("../../controller/topic")

router.get("/list", async (ctx, next) => {
    const { pageIndex, sortBy } = ctx.query
    ctx.body = await getList(ctx, {
        pageIndex: pageIndex ? parseInt(pageIndex) : 0,
        sortBy: sortBy || 'hot'
    })
})

router.get("/search", async (ctx, next) => {
    const { keyword, pageIndex } = ctx.query
    ctx.body = await search(ctx, {
        keyword: keyword || '',
        pageIndex: pageIndex ? parseInt(pageIndex) : 0
    })
})

router.get("/detail", async (ctx, next) => {
    const { topicIdOrName } = ctx.query
    ctx.body = await getDetail(ctx, {
        topicIdOrName
    })
})

router.get("/blogs", async (ctx, next) => {
    const { topicId, pageIndex } = ctx.query
    ctx.body = await getBlogs(ctx, {
        topicId: parseInt(topicId),
        pageIndex: pageIndex ? parseInt(pageIndex) : 0
    })
})

router.get("/hot", async (ctx, next) => {
    const { limit } = ctx.query
    ctx.body = await getHot(ctx, {
        limit: limit ? parseInt(limit) : 10
    })
})

module.exports = router
