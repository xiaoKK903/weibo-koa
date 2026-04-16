/**
 * @description 微博详情 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { getBlogDetail, createComment, getComments } = require('../../controller/blog-detail')
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

// 创建评论
router.post('/comment/create', loginCheck, async (ctx, next) => {
    const { blogId, content } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    // 转换 blogId 为数字类型
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    
    if (!content || content.trim() === '') {
        ctx.body = new ErrorModel({ errno: 400, message: '评论内容不能为空' })
        return
    }
    
    const result = await createComment({ blogId: blogIdNum, userId, content })
    ctx.body = result
})

// 获取评论列表
router.get('/comment/list/:blogId', loginCheck, async (ctx, next) => {
    const { blogId } = ctx.params
    // 转换 blogId 为数字类型
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    const result = await getComments(blogIdNum)
    ctx.body = result
})

module.exports = router
