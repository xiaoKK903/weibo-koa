/**
 * @description 微博 view 路由
 * @author milk
 */

const router = require("koa-router")();
const { loginRedirect } = require("../../middlewares/loginChecks");
const { getProfileBlogList } = require("../../controller/blog-profile");
const { getSquareBlogList } = require("../../controller/blog-square");
const { isExist } = require("../../controller/user");
const { getHomeBlogList } = require("../../controller/blog-home");
const { getBlogDetail } = require("../../controller/blog-detail");

// 首页
router.get("/", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;
  const { id: userId } = userInfo;

  // 获取第一页数据
  const result = await getHomeBlogList(userId);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data;

  await ctx.render("index", {
    isLogin: true,
    canReply: true,
    userData: {
      userInfo,
      fansData: {
        count: 0,
        list: [],
      },
    },
    blogData: {
      isEmpty,
      blogList,
      pageSize,
      pageIndex,
      count,
    },
  });
});

// 个人主页
router.get("/profile", loginRedirect, async (ctx, next) => {
  const { userName } = ctx.session.userInfo;
  ctx.redirect(`/profile/${userName}`);
});
router.get("/profile/:userName", loginRedirect, async (ctx, next) => {
  // 已登录用户的信息
  const myUserInfo = ctx.session.userInfo;
  const myUserName = myUserInfo.userName;

  let curUserInfo;
  const { userName: curUserName } = ctx.params;
  const isMe = myUserName === curUserName;
  if (isMe) {
    // 是当前登录用户
    curUserInfo = myUserInfo;
  } else {
    // 不是当前登录用户
    const existResult = await isExist(curUserName);
    if (existResult.errno !== 0) {
      // 用户名不存在
      return;
    }
    // 用户名存在
    curUserInfo = existResult.data;
  }

  // 获取微博第一页数据
  const result = await getProfileBlogList(curUserName, 0);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data;

  // 我是否关注了此人？
  const amIFollowed = false; // 暂时设为false，因为已移除关注功能

  await ctx.render("profile", {
    isLogin: true,
    canReply: true,
    blogData: {
      isEmpty,
      blogList,
      pageSize,
      pageIndex,
      count,
    },
    userData: {
      userInfo: curUserInfo,
      isMe,
      fansData: {
        count: 0,
        list: [],
      },
      followersData: {
        count: 0,
        list: [],
      },
      amIFollowed,
      atCount: 0,
    },
  });
});

// 广场
router.get("/square", loginRedirect, async (ctx, next) => {
  // 获取微博数据，第一页
  const result = await getSquareBlogList(0);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data || {};

  await ctx.render("square", {
    isLogin: true,
    canReply: true,
    blogData: {
      isEmpty,
      blogList,
      pageSize,
      pageIndex,
      count,
    },
  });
});

// atMe 路由
router.get("/at-me", loginRedirect, async (ctx, next) => {
  // 渲染页面
  await ctx.render("atMe", {
    blogData: {
      isEmpty: true,
      blogList: [],
      pageSize: 0,
      pageIndex: 0,
      count: 0,
    },
  });


});

// 微博详情页
router.get("/detail/:blogId", loginRedirect, async (ctx, next) => {
  const { blogId } = ctx.params;
  const userInfo = ctx.session.userInfo;

  // 转换 blogId 为数字类型
  const blogIdNum = parseInt(blogId);
  if (isNaN(blogIdNum)) {
    // 无效的微博 ID，跳转到首页
    ctx.redirect("/");
    return;
  }

  // 获取微博详情
  const result = await getBlogDetail(blogIdNum);
  if (result.errno !== 0) {
    // 微博不存在，跳转到首页
    ctx.redirect("/");
    return;
  }

  const blog = result.data;

  await ctx.render("detail", {
    isLogin: true,
    userData: {
      userInfo,
    },
    blogData: {
      blog,
    },
  });
});

module.exports = router;
