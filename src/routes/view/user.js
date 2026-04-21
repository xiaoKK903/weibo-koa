/**
 * @description user view 路由
 * @author milk
 */

const router = require("koa-router")();
const { loginRedirect } = require("../../middlewares/loginChecks");

/**
 * 获取登录信息
 * @param {Object} ctx ctx
 */
function getLoginInfo(ctx) {
  let data = {
    isLogin: false, // 默认未登录
    userName: '',
    nickName: '',
    picture: '',
    city: '',
    signature: '',
    bio: '',
    coverImage: ''
  };

  try {
    console.log('=== getLoginInfo ===');
    console.log('ctx.session:', ctx.session);
    console.log('ctx.session.userInfo:', ctx.session ? ctx.session.userInfo : 'session not exist');
    
    if (ctx.session && ctx.session.userInfo) {
      data = {
        isLogin: true,
        userName: ctx.session.userInfo.userName || '',
        nickName: ctx.session.userInfo.nickName || '',
        picture: ctx.session.userInfo.picture || '',
        city: ctx.session.userInfo.city || '',
        signature: ctx.session.userInfo.signature || '',
        bio: ctx.session.userInfo.bio || '',
        coverImage: ctx.session.userInfo.coverImage || ''
      };
    }
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: getLoginInfo error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
  }

  return data;
}

router.get("/login", async (ctx, next) => {
  await ctx.render("login", getLoginInfo(ctx));
});

router.get("/register", async (ctx, next) => {
  await ctx.render("register", getLoginInfo(ctx));
});

router.get("/setting", loginRedirect, async (ctx, next) => {
  try {
    console.log('=== setting page ===');
    console.log('ctx.session.userInfo:', ctx.session ? ctx.session.userInfo : 'session not exist');
    
    // 创建一个新对象，避免EJS修改session中的userInfo，并确保所有属性都有默认值
    const userInfo = ctx.session && ctx.session.userInfo ? {
      id: ctx.session.userInfo.id || '',
      userName: ctx.session.userInfo.userName || '',
      nickName: ctx.session.userInfo.nickName || '',
      picture: ctx.session.userInfo.picture || '',
      city: ctx.session.userInfo.city || '',
      signature: ctx.session.userInfo.signature || '',
      bio: ctx.session.userInfo.bio || '',
      coverImage: ctx.session.userInfo.coverImage || ''
    } : {
      id: '',
      userName: '',
      nickName: '',
      picture: '',
      city: '',
      signature: '',
      bio: '',
      coverImage: ''
    };
    await ctx.render("setting", userInfo);
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: setting page error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    
    // 渲染错误页面或返回错误信息
    ctx.status = 500;
    ctx.body = {
      code: -1,
      msg: "服务器内部错误",
      error: process.env.NODE_ENV === "development" ? error.message : ""
    };
  }
});

// 举报记录页面
router.get("/report-records", loginRedirect, async (ctx, next) => {
  try {
    console.log('=== report-records page ===');
    
    const { pageIndex = 0, pageSize = 10 } = ctx.query;
    const userId = ctx.session.userInfo.id;
    
    // 获取举报记录
    const { getReportRecords } = require('../../services/report');
    const reportData = await getReportRecords(userId, {
      pageIndex: parseInt(pageIndex),
      pageSize: parseInt(pageSize)
    });
    
    await ctx.render("report-records", {
      isLogin: true,
      reportData: reportData
    });
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: report-records page error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    
    // 渲染错误页面或返回错误信息
    ctx.status = 500;
    ctx.body = {
      code: -1,
      msg: "服务器内部错误",
      error: process.env.NODE_ENV === "development" ? error.message : ""
    };
  }
});

// 黑名单管理页面
router.get("/block-list", loginRedirect, async (ctx, next) => {
  try {
    console.log('=== block-list page ===');
    
    const userId = ctx.session.userInfo.id;
    const userInfo = ctx.session.userInfo;
    
    // 获取已屏蔽用户列表
    const { getBlockedUsers, getBlockedCount } = require('../../services/block');
    const blockedList = await getBlockedUsers(userId);
    const blockedCount = await getBlockedCount(userId);
    
    await ctx.render("block-list", {
      isLogin: true,
      userInfo: userInfo,
      blockedList: blockedList,
      blockedCount: blockedCount
    });
  } catch (error) {
    console.error('CRITICAL_ERROR_TRACE: block-list page error');
    console.error('Error:', error);
    console.error('Error stack:', error.stack || error);
    
    // 渲染错误页面或返回错误信息
    ctx.status = 500;
    ctx.body = {
      code: -1,
      msg: "服务器内部错误",
      error: process.env.NODE_ENV === "development" ? error.message : ""
    };
  }
});

module.exports = router;
