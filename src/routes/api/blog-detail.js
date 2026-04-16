/**
 * @description 微博详情 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { getBlogDetail } = require('../../controller/blog-detail')
const { ErrorModel } = require('../../model/ResModel')

router.prefix('/api/blog')

// 获取微博详情
router.get('/detail/:blogId', loginCheck, async (ctx, next) => {
    const { blogId } = ctx.params
    // 转换 blogId 为数字类型
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    const result = await getBlogDetail(blogIdNum)
    ctx.body = result
})

module.exports = router
