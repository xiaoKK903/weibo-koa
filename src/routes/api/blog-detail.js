/**
 * @description 微博详情 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { 
    getBlogDetail, 
    createComment, 
    getComments,
    deleteComment,
    likeComment,
    unlikeComment
} = require('../../controller/blog-detail')
const { ErrorModel } = require('../../model/ResModel')

router.prefix('/api/blog')

// 获取微博详情
router.get('/detail/:blogId', loginCheck, async (ctx, next) => {
    const { blogId } = ctx.params
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    const { id: userId } = ctx.session.userInfo || {}
    const result = await getBlogDetail(blogIdNum, userId)
    ctx.body = result
})

// 创建评论（支持楼中楼回复）
router.post('/comment/create', loginCheck, async (ctx, next) => {
    const { blogId, content, parentId, replyUserId } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    
    if (!content || content.trim() === '') {
        ctx.body = new ErrorModel({ errno: 400, message: '评论内容不能为空' })
        return
    }
    
    const parentIdNum = parentId ? parseInt(parentId) : null
    const replyUserIdNum = replyUserId ? parseInt(replyUserId) : null
    
    const result = await createComment({ 
        blogId: blogIdNum, 
        userId, 
        content,
        parentId: parentIdNum,
        replyUserId: replyUserIdNum
    })
    ctx.body = result
})

// 获取评论列表
router.get('/comment/list/:blogId', loginCheck, async (ctx, next) => {
    const { blogId } = ctx.params
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    const { id: userId } = ctx.session.userInfo || {}
    const result = await getComments(blogIdNum, userId)
    ctx.body = result
})

// 删除评论
router.post('/comment/delete', loginCheck, async (ctx, next) => {
    const { commentId } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    const commentIdNum = parseInt(commentId)
    if (isNaN(commentIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的评论 ID' })
        return
    }
    
    const result = await deleteComment(commentIdNum, userId)
    ctx.body = result
})

// 点赞评论
router.post('/comment/like', loginCheck, async (ctx, next) => {
    const { commentId } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    const commentIdNum = parseInt(commentId)
    if (isNaN(commentIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的评论 ID' })
        return
    }
    
    const result = await likeComment(commentIdNum, userId)
    ctx.body = result
})

// 取消点赞评论
router.post('/comment/unlike', loginCheck, async (ctx, next) => {
    const { commentId } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    const commentIdNum = parseInt(commentId)
    if (isNaN(commentIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的评论 ID' })
        return
    }
    
    const result = await unlikeComment(commentIdNum, userId)
    ctx.body = result
})

// ========== 兼容路由（用于 blog-list.ejs 中的现有调用）==========

// 创建评论（兼容旧版路由 /api/blog/comment）
router.post('/comment', loginCheck, async (ctx, next) => {
    const { blogId, content } = ctx.request.body
    const { id: userId } = ctx.session.userInfo
    
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    
    if (!content || content.trim() === '') {
        ctx.body = new ErrorModel({ errno: 400, message: '评论内容不能为空' })
        return
    }
    
    const result = await createComment({ 
        blogId: blogIdNum, 
        userId, 
        content,
        parentId: null,
        replyUserId: null
    })
    ctx.body = result
})

// 获取评论列表（兼容旧版路由 /api/blog/comment/:blogId）
router.get('/comment/:blogId', loginCheck, async (ctx, next) => {
    const { blogId } = ctx.params
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
        return
    }
    const { id: userId } = ctx.session.userInfo || {}
    const result = await getComments(blogIdNum, userId)
    ctx.body = result
})

module.exports = router
