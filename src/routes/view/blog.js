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
const { checkFollowStatus, getFollowingCount, getFollowerCount, getFollowingList, getFollowerList } = require("../../services/follow");
const { getAtListByUserId, getUnreadAtCount } = require("../../services/at");

// 首页
router.get("/", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;
  const { id: userId } = userInfo;

  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(userId);

  // 获取第一页数据
  const result = await getHomeBlogList(userId);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data;

  // 获取热门帖子（使用广场数据作为热门帖子）
  const squareResult = await getSquareBlogList(0);
  const hotPosts = squareResult.data ? squareResult.data.blogList.slice(0, 3) : [];

  // 获取关注数和粉丝数
  const followingCount = await getFollowingCount(userId);
  const followerCount = await getFollowerCount(userId);

  // 获取关注列表（用于 @ 自动补全）
  const followingList = await getFollowingList(userId);

  await ctx.render("index", {
    isLogin: true,
    canReply: true,
    unreadAtCount,
    followingList: JSON.stringify(followingList),
    userData: {
      userInfo,
      fansData: {
        count: followerCount,
        list: [],
      },
      followersData: {
        count: followingCount,
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
    hotPosts,
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

  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(myUserInfo.id);

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
  const result = await getProfileBlogList(curUserName, 0, myUserInfo.id);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data;

  // 我是否关注了此人？
  let amIFollowed = false;
  if (!isMe) {
    amIFollowed = await checkFollowStatus(myUserInfo.id, curUserInfo.id);
  }

  // 获取关注数和粉丝数
  const followingCount = await getFollowingCount(curUserInfo.id);
  const followerCount = await getFollowerCount(curUserInfo.id);

  await ctx.render("profile", {
    isLogin: true,
    canReply: true,
    unreadAtCount,
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
        count: followerCount,
        list: [],
      },
      followersData: {
        count: followingCount,
        list: [],
      },
      amIFollowed,
      atCount: 0,
    },
  });
});

// 关注列表页面
router.get("/profile/:userName/following", loginRedirect, async (ctx, next) => {
  // 已登录用户的信息
  const myUserInfo = ctx.session.userInfo;
  const myUserName = myUserInfo.userName;

  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(myUserInfo.id);

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
      ctx.redirect("/");
      return;
    }
    // 用户名存在
    curUserInfo = existResult.data;
  }

  // 获取关注列表
  const followingList = await getFollowingList(curUserInfo.id);
  const followingCount = await getFollowingCount(curUserInfo.id);
  const followerCount = await getFollowerCount(curUserInfo.id);

  await ctx.render("following", {
    isLogin: true,
    unreadAtCount,
    userData: {
      userInfo: curUserInfo,
      isMe,
      list: followingList,
      count: followingCount,
      fansData: {
        count: followerCount,
        list: [],
      },
      followersData: {
        count: followingCount,
        list: [],
      },
    },
  });
});

// 粉丝列表页面
router.get("/profile/:userName/follower", loginRedirect, async (ctx, next) => {
  // 已登录用户的信息
  const myUserInfo = ctx.session.userInfo;
  const myUserName = myUserInfo.userName;

  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(myUserInfo.id);

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
      ctx.redirect("/");
      return;
    }
    // 用户名存在
    curUserInfo = existResult.data;
  }

  // 获取粉丝列表
  const followerList = await getFollowerList(curUserInfo.id);
  const followingCount = await getFollowingCount(curUserInfo.id);
  const followerCount = await getFollowerCount(curUserInfo.id);

  await ctx.render("follower", {
    isLogin: true,
    unreadAtCount,
    userData: {
      userInfo: curUserInfo,
      isMe,
      list: followerList,
      count: followerCount,
      fansData: {
        count: followerCount,
        list: [],
      },
      followersData: {
        count: followingCount,
        list: [],
      },
    },
  });
});

// 广场
router.get("/square", loginRedirect, async (ctx, next) => {
  const { keyword } = ctx.query;
  const userId = ctx.session.userInfo?.id;
  
  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(userId);
  
  // 获取关注列表（用于 @ 自动补全）
  const followingList = await getFollowingList(userId);
  
  // 获取微博数据，第一页
  const result = await getSquareBlogList(0, keyword, userId);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data || {};

  await ctx.render("square", {
    isLogin: true,
    canReply: true,
    unreadAtCount,
    followingList: JSON.stringify(followingList),
    blogData: {
      isEmpty,
      blogList,
      pageSize,
      pageIndex,
      count,
      keyword,
    },
  });
});

// 通知页面（有人提到你）
router.get("/at", loginRedirect, async (ctx, next) => {
  const userId = ctx.session.userInfo.id;
  
  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(userId);
  
  // 获取 @提醒列表
  const result = await getAtListByUserId(userId, 0, 10);
  const { count, atList } = result;

  await ctx.render("at", {
    isLogin: true,
    unreadAtCount,
    atData: {
      isEmpty: atList.length === 0,
      atList,
      pageSize: 10,
      pageIndex: 0,
      count,
    },
  });
});

// atMe 路由（重定向到新的通知页面）
router.get("/at-me", loginRedirect, async (ctx, next) => {
  ctx.redirect("/at");
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

  // 获取未读 @提醒数量
  const unreadAtCount = await getUnreadAtCount(userInfo.id);

  // 获取关注列表（用于 @ 自动补全）
  const followingList = await getFollowingList(userInfo.id);

  // 获取微博详情
  const result = await getBlogDetail(blogIdNum, userInfo.id);
  if (result.errno !== 0) {
    // 微博不存在，跳转到首页
    ctx.redirect("/");
    return;
  }

  const blog = result.data;

  // 获取关注数和粉丝数
  const followingCount = await getFollowingCount(userInfo.id);
  const followerCount = await getFollowerCount(userInfo.id);

  await ctx.render("detail", {
    isLogin: true,
    unreadAtCount,
    followingList: JSON.stringify(followingList),
    userData: {
      userInfo,
      fansData: {
        count: followerCount,
        list: [],
      },
      followersData: {
        count: followingCount,
        list: [],
      },
    },
    blogData: {
      blog,
    },
  });
});

module.exports = router;
