/**
 * @description 首页 API 路由
 * @author milk
 */

const router = require('koa-router')()
const { loginCheck } = require('../../middlewares/loginChecks')
const { create } = require('../../controller/blog-home')
const { genValidator } = require('../../middlewares/validator')
const blogValidate = require('../../validator/blog')
const { getHomeBlogList } = require('../../controller/blog-home')
const { getBlogListStr } = require('../../utils/blog')
const { ErrorModel } = require('../../model/ResModel')
const { loginCheckFailInfo, createBlogFailInfo } = require('../../model/ErrorInfo')

router.prefix('/api/blog')

// 创建微博
router.post('/create', loginCheck, genValidator(blogValidate), async (ctx, next) => {
  try {
    const { content, image } = ctx.request.body
    if (!ctx.session || !ctx.session.userInfo) {
      ctx.body = new ErrorModel(loginCheckFailInfo)
      return
    }
    const { id: userId } = ctx.session.userInfo
    ctx.body = await create({ userId, content, image })
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: create blog error')
    console.error('Error:', error)
    console.error('Error stack:', error.stack || error)
    ctx.body = new ErrorModel(createBlogFailInfo)
  }
})

// 加载更多
router.get('/loadMore/:pageIndex', loginCheck, async (ctx, next) => {
  try {
    let { pageIndex } = ctx.params
    pageIndex = parseInt(pageIndex)  // 转换 number 类型
    if (!ctx.session || !ctx.session.userInfo) {
      ctx.body = new ErrorModel(loginCheckFailInfo)
      return
    }
    const { id: userId } = ctx.session.userInfo
    const result = await getHomeBlogList(userId, pageIndex)
    // 渲染模板
    result.data.blogListTpl = getBlogListStr(result.data.blogList)

    ctx.body = result
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: load more blog error')
    console.error('Error:', error)
    console.error('Error stack:', error.stack || error)
    ctx.body = new ErrorModel(createBlogFailInfo)
  }
})

module.exports = router
