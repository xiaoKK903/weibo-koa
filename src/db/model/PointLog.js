/**
 * @description 积分记录数据模型
 * @author milk
 */

const seq = require('../seq');
const { INTEGER, STRING, DATE } = require('../types');

const PointLog = seq.define('pointLog', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '用户 ID'
    },
    actionType: {
        type: STRING(50),
        allowNull: false,
        comment: '行为类型：login, blog, comment, like, collect, follow, at, share'
    },
    actionId: {
        type: INTEGER,
        allowNull: true,
        comment: '行为关联的 ID（如微博 ID、评论 ID 等）'
    },
    exp: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '获得的经验值'
    },
    description: {
        type: STRING(255),
        allowNull: true,
        comment: '积分描述'
    },
    actionDate: {
        type: DATE,
        allowNull: false,
        comment: '行为日期（用于统计每日积分）'
    },
    actionCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '每日同一行为的次数（用于限制每日积分上限）'
    }
});

module.exports = PointLog;