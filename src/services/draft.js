/**
 * @description 草稿箱 service
 * @author milk
 */

const { Draft } = require('../db/model/index')
const { Op } = require('sequelize')

async function saveDraft(userId, content, image) {
    const draft = await Draft.findOne({
        where: { userId }
    })
    
    const now = new Date()
    
    if (draft) {
        const hasContent = content && content !== '<p><br></p>' && content !== '<p></p>' && content !== ''
        const hasImage = image && image !== ''
        
        if (!hasContent && !hasImage) {
            await draft.destroy()
            return { success: true, deleted: true }
        }
        
        await draft.update({
            content,
            image,
            lastSaveAt: now
        })
        
        return { success: true, draft: draft.dataValues }
    } else {
        const hasContent = content && content !== '<p><br></p>' && content !== '<p></p>' && content !== ''
        const hasImage = image && image !== ''
        
        if (!hasContent && !hasImage) {
            return { success: true, saved: false }
        }
        
        const newDraft = await Draft.create({
            userId,
            content,
            image,
            lastSaveAt: now
        })
        
        return { success: true, draft: newDraft.dataValues }
    }
}

async function getDraftByUserId(userId) {
    const draft = await Draft.findOne({
        where: { userId },
        order: [['lastSaveAt', 'desc']]
    })
    
    if (!draft) {
        return null
    }
    
    return draft.dataValues
}

async function deleteDraft(userId, draftId) {
    const draft = await Draft.findOne({
        where: {
            id: draftId,
            userId
        }
    })
    
    if (!draft) {
        return { success: false, message: '草稿不存在' }
    }
    
    await draft.destroy()
    
    return { success: true }
}

async function clearAllDrafts(userId) {
    const result = await Draft.destroy({
        where: { userId }
    })
    
    return { success: true, deletedCount: result }
}

async function getDraftList(userId, pageIndex = 0, pageSize = 10) {
    const result = await Draft.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [['lastSaveAt', 'desc']],
        where: { userId }
    })
    
    const draftList = result.rows.map(row => row.dataValues)
    
    return {
        count: result.count,
        draftList
    }
}

module.exports = {
    saveDraft,
    getDraftByUserId,
    deleteDraft,
    clearAllDrafts,
    getDraftList
}
