/**
 * @description 举报模型
 * @author milk
 */

const { DataTypes } = require('sequelize')
const seq = require('../seq')

// 举报模型
const Report = seq.define('Report', {
    reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '举报人ID'
    },
    reportedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '被举报人ID'
    },
    targetType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '举报目标类型：1-微博，2-评论'
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '举报目标ID'
    },
    reportType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '举报类型：1-色情，2-暴力，3-违法，4-广告，5-其他'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '举报内容'
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '举报状态：0-待处理，1-已处理，2-无效'
    }
}, {
    tableName: 'report',
    timestamps: true
})

module.exports = Report