/**
 * @description 浏览历史 controller
 * @author milk
 */

const {
    getViewHistoryList: getViewHistoryListService,
    deleteViewHistory: deleteViewHistoryService,
    clearAllViewHistory: clearAllViewHistoryService,
    addViewHistory
} = require('../services/viewHistory')
const { SuccessModel, ErrorModel } = require('../model/ResModel')

async function getViewHistoryList(userId, pageIndex = 0, pageSize = 10) {
    const result = await getViewHistoryListService(userId, pageIndex, pageSize)
    return new SuccessModel(result)
}

async function deleteViewHistory(id, userId) {
    const result = await deleteViewHistoryService(id, userId)
    if (result.success) {
        return new SuccessModel({ message: '删除成功' })
    } else {
        return new ErrorModel({ errno: 400, message: '删除失败' })
    }
}

async function clearAllViewHistory(userId) {
    const result = await clearAllViewHistoryService(userId)
    return new SuccessModel(result)
}

async function recordViewHistory(userId, blogId) {
    const result = await addViewHistory(userId, blogId)
    return result
}

module.exports = {
    getViewHistoryList,
    deleteViewHistory,
    clearAllViewHistory,
    recordViewHistory
}
