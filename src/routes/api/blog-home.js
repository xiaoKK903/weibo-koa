/**
 * @description 首页 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { create, updateVisibleType, getVisibleTypeListCtrl } = require('../../controller/blog-home')
const { genValidator } = require('../../middlewares/validator')
const blogValidate = require('../../validator/blog')
const { getHomeBlogList } = require('../../controller/blog-home')
const { getBlogListStr } = require('../../utils/blog')
const { ErrorModel } = require('../../model/ResModel')
const { loginCheckFailInfo, createBlogFailInfo } = require('../../model/ErrorInfo')

router.prefix('/api/blog')

router.post('/create', loginCheck, genValidator(blogValidate), async (ctx, next) => {
  try {
    const { content, image, visibleType } = ctx.request.body
    if (!ctx.session || !ctx.session.userInfo) {
      ctx.body = new ErrorModel(loginCheckFailInfo)
      return
    }
    const { id: userId } = ctx.session.userInfo
    ctx.body = await create({ userId, content, image, visibleType })
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: create blog error')
    console.error('Error:', error)
    console.error('Error stack:', error.stack || error)
    ctx.body = new ErrorModel(createBlogFailInfo)
  }
})

router.get('/loadMore/:pageIndex', loginCheck, async (ctx, next) => {
  try {
    let { pageIndex } = ctx.params
    pageIndex = parseInt(pageIndex)
    if (!ctx.session || !ctx.session.userInfo) {
      ctx.body = new ErrorModel(loginCheckFailInfo)
      return
    }
    const { id: userId } = ctx.session.userInfo
    const result = await getHomeBlogList(userId, pageIndex)
    result.data.blogListTpl = getBlogListStr(result.data.blogList)

    ctx.body = result
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: load more blog error')
    console.error('Error:', error)
    console.error('Error stack:', error.stack || error)
    ctx.body = new ErrorModel(createBlogFailInfo)
  }
})

router.post('/update-visible-type', loginCheck, async (ctx, next) => {
  try {
    const { blogId, visibleType } = ctx.request.body
    if (!ctx.session || !ctx.session.userInfo) {
      ctx.body = new ErrorModel(loginCheckFailInfo)
      return
    }
    const { id: userId } = ctx.session.userInfo
    const blogIdNum = parseInt(blogId)
    const visibleTypeNum = parseInt(visibleType)
    
    if (isNaN(blogIdNum)) {
      ctx.body = new ErrorModel({ errno: 400, message: '无效的微博 ID' })
      return
    }
    
    ctx.body = await updateVisibleType(userId, blogIdNum, visibleTypeNum)
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: update visible type error')
    console.error('Error:', error)
    ctx.body = new ErrorModel({ errno: 500, message: '修改权限失败' })
  }
})

router.get('/visible-types', loginCheck, async (ctx, next) => {
  ctx.body = await getVisibleTypeListCtrl()
})

module.exports = router