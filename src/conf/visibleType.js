/**
 * @description 微博可见权限配置
 * @author milk
 */

const VISIBLE_TYPE = {
    PUBLIC: 0,
    PRIVATE: 1,
    FANS_ONLY: 2
};

const VISIBLE_TYPE_MAP = {
    [VISIBLE_TYPE.PUBLIC]: {
        code: VISIBLE_TYPE.PUBLIC,
        name: '公开',
        description: '所有人可见'
    },
    [VISIBLE_TYPE.PRIVATE]: {
        code: VISIBLE_TYPE.PRIVATE,
        name: '仅自己可见',
        description: '仅发布者可见'
    },
    [VISIBLE_TYPE.FANS_ONLY]: {
        code: VISIBLE_TYPE.FANS_ONLY,
        name: '仅粉丝可见',
        description: '仅粉丝可见'
    }
};

function getVisibleTypeInfo(type) {
    return VISIBLE_TYPE_MAP[type] || VISIBLE_TYPE_MAP[VISIBLE_TYPE.PUBLIC];
}

function getVisibleTypeList() {
    return Object.values(VISIBLE_TYPE_MAP);
}

module.exports = {
    VISIBLE_TYPE,
    VISIBLE_TYPE_MAP,
    getVisibleTypeInfo,
    getVisibleTypeList
};