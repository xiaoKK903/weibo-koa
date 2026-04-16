/**
 * @description 微博详情 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { getBlogDetail } = require('../../controller/blog-detail')

router.get('/detail/:blogId', loginCheck, async (ctx, next) => {
    const { blogId } = ctx.params
    const result = await getBlogDetail(blogId)
    ctx.body = result
})

module.exports = router
