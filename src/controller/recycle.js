/**
 * @description 回收站 controller
 * @author milk
 */

const {
    softDeleteBlog,
    restoreBlog,
    permanentDeleteBlog,
    getRecycleList,
    clearAllRecycle
} = require('../services/recycle')
const { SuccessModel, ErrorModel } = require('../model/ResModel')
const {
    deleteBlogFailInfo,
    blogNotExistInfo
} = require('../model/ErrorInfo')

async function deleteBlog(blogId, userId) {
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        return new ErrorModel({ errno: 400, message: '无效的微博 ID' })
    }
    
    const result = await softDeleteBlog(blogIdNum, userId)
    if (result.success) {
        return new SuccessModel({ message: '微博已移入回收站' })
    } else {
        return new ErrorModel({ errno: 400, message: result.message || '删除失败' })
    }
}

async function restoreBlogCtrl(blogId, userId) {
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        return new ErrorModel({ errno: 400, message: '无效的微博 ID' })
    }
    
    const result = await restoreBlog(blogIdNum, userId)
    if (result.success) {
        return new SuccessModel({ message: '微博已恢复' })
    } else {
        return new ErrorModel({ errno: 400, message: result.message || '恢复失败' })
    }
}

async function permanentDeleteBlogCtrl(blogId, userId) {
    const blogIdNum = parseInt(blogId)
    if (isNaN(blogIdNum)) {
        return new ErrorModel({ errno: 400, message: '无效的微博 ID' })
    }
    
    const result = await permanentDeleteBlog(blogIdNum, userId)
    if (result.success) {
        return new SuccessModel({ message: '微博已彻底删除' })
    } else {
        return new ErrorModel({ errno: 400, message: result.message || '删除失败' })
    }
}

async function getRecycleListCtrl(userId, pageIndex = 0, pageSize = 10) {
    const pageIndexNum = parseInt(pageIndex)
    const pageSizeNum = parseInt(pageSize)
    
    const result = await getRecycleList(
        userId,
        isNaN(pageIndexNum) ? 0 : pageIndexNum,
        isNaN(pageSizeNum) ? 10 : pageSizeNum
    )
    
    return new SuccessModel(result)
}

async function clearAllRecycleCtrl(userId) {
    const result = await clearAllRecycle(userId)
    return new SuccessModel(result)
}

module.exports = {
    deleteBlog,
    restoreBlog: restoreBlogCtrl,
    permanentDeleteBlog: permanentDeleteBlogCtrl,
    getRecycleList: getRecycleListCtrl,
    clearAllRecycle: clearAllRecycleCtrl
}
