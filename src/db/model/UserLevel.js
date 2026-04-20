/**
 * @description 用户等级数据模型
 * @author milk
 */

const seq = require('../seq');
const { INTEGER, STRING, DATE } = require('../types');

const UserLevel = seq.define('userLevel', {
    userId: {
        type: INTEGER,
        allowNull: false,
        unique: true,
        comment: '用户 ID，唯一'
    },
    level: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '用户等级'
    },
    totalExp: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总经验值'
    },
    dailyLoginCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '每日登录次数（用于限制每日登录积分上限）'
    },
    lastLoginDate: {
        type: DATE,
        allowNull: true,
        comment: '最后登录日期'
    }
});

module.exports = UserLevel;