/**
 * @description 草稿箱 controller
 * @author milk
 */

const {
    saveDraft,
    getDraftByUserId,
    deleteDraft,
    clearAllDrafts,
    getDraftList
} = require('../services/draft')
const { SuccessModel, ErrorModel } = require('../model/ResModel')

async function saveDraftCtrl(userId, content, image) {
    const result = await saveDraft(userId, content, image)
    return new SuccessModel(result)
}

async function getDraftCtrl(userId) {
    const draft = await getDraftByUserId(userId)
    return new SuccessModel(draft || {})
}

async function deleteDraftCtrl(userId, draftId) {
    const draftIdNum = parseInt(draftId)
    if (isNaN(draftIdNum)) {
        return new ErrorModel({ errno: 400, message: '无效的草稿 ID' })
    }
    
    const result = await deleteDraft(userId, draftIdNum)
    if (result.success) {
        return new SuccessModel({ message: '草稿已删除' })
    } else {
        return new ErrorModel({ errno: 400, message: result.message || '删除失败' })
    }
}

async function clearAllDraftsCtrl(userId) {
    const result = await clearAllDrafts(userId)
    return new SuccessModel(result)
}

async function getDraftListCtrl(userId, pageIndex = 0, pageSize = 10) {
    const pageIndexNum = parseInt(pageIndex)
    const pageSizeNum = parseInt(pageSize)
    
    const result = await getDraftList(
        userId,
        isNaN(pageIndexNum) ? 0 : pageIndexNum,
        isNaN(pageSizeNum) ? 10 : pageSizeNum
    )
    
    return new SuccessModel(result)
}

module.exports = {
    saveDraft: saveDraftCtrl,
    getDraft: getDraftCtrl,
    deleteDraft: deleteDraftCtrl,
    clearAllDrafts: clearAllDraftsCtrl,
    getDraftList: getDraftListCtrl
}
