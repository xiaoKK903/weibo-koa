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
const { getTotalUnreadCount } = require("../../services/message");
const { checkBlockStatus } = require("../../services/block");
const { recordViewHistory, getViewHistoryList } = require("../../controller/viewHistory");
const { getRecycleList } = require("../../controller/recycle");
const { getTopicList, getTopicDetail, getTopicBlogs, getHotTopics } = require("../../services/topic");

// 首页
router.get("/", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;
  const { id: userId } = userInfo;

  const unreadAtCount = await getUnreadAtCount(userId);
  const unreadMessageCount = await getTotalUnreadCount(userId);

  const result = await getHomeBlogList(userId);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data;

  const squareResult = await getSquareBlogList(0);
  const hotPosts = squareResult.data ? squareResult.data.blogList.slice(0, 3) : [];

  const hotTopics = await getHotTopics(10);

  const followingCount = await getFollowingCount(userId);
  const followerCount = await getFollowerCount(userId);

  const followingList = await getFollowingList(userId);

  await ctx.render("index", {
    isLogin: true,
    canReply: true,
    unreadAtCount,
    unreadMessageCount,
    followingList: JSON.stringify(followingList),
    currentUserId: userInfo.id,
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
    hotTopics,
  });
});

// 个人主页
router.get("/profile", loginRedirect, async (ctx, next) => {
  const { userName } = ctx.session.userInfo;
  ctx.redirect(`/profile/${userName}`);
});
router.get("/profile/:userName", loginRedirect, async (ctx, next) => {
  const myUserInfo = ctx.session.userInfo;
  const myUserName = myUserInfo.userName;

  const unreadAtCount = await getUnreadAtCount(myUserInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(myUserInfo.id);

  let curUserInfo;
  const { userName: curUserName } = ctx.params;
  const isMe = myUserName === curUserName;
  
  if (isMe) {
    curUserInfo = myUserInfo;
  } else {
    const existResult = await isExist(curUserName);
    if (existResult.errno !== 0) {
      ctx.redirect("/");
      return;
    }
    curUserInfo = existResult.data;
  }

  const result = await getProfileBlogList(curUserName, 0, myUserInfo.id);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data;

  let amIFollowed = false;
  let amIBlocked = false;
  if (!isMe) {
    amIFollowed = await checkFollowStatus(myUserInfo.id, curUserInfo.id);
    amIBlocked = await checkBlockStatus(myUserInfo.id, curUserInfo.id);
  }

  const followingCount = await getFollowingCount(curUserInfo.id);
  const followerCount = await getFollowerCount(curUserInfo.id);

  const followingList = await getFollowingList(myUserInfo.id);

  await ctx.render("profile", {
    isLogin: true,
    canReply: true,
    unreadAtCount,
    unreadMessageCount,
    followingList: JSON.stringify(followingList),
    currentUserId: myUserInfo.id,
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
      amIBlocked,
      atCount: 0,
    },
  });
});

// 关注列表页面
router.get("/profile/:userName/following", loginRedirect, async (ctx, next) => {
  const myUserInfo = ctx.session.userInfo;
  const myUserName = myUserInfo.userName;

  const unreadAtCount = await getUnreadAtCount(myUserInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(myUserInfo.id);

  let curUserInfo;
  const { userName: curUserName } = ctx.params;
  const isMe = myUserName === curUserName;
  if (isMe) {
    curUserInfo = myUserInfo;
  } else {
    const existResult = await isExist(curUserName);
    if (existResult.errno !== 0) {
      ctx.redirect("/");
      return;
    }
    curUserInfo = existResult.data;
  }

  const followingList = await getFollowingList(curUserInfo.id);
  const followingCount = await getFollowingCount(curUserInfo.id);
  const followerCount = await getFollowerCount(curUserInfo.id);

  let amIFollowed = false;
  let amIBlocked = false;
  if (!isMe) {
    amIFollowed = await checkFollowStatus(myUserInfo.id, curUserInfo.id);
    amIBlocked = await checkBlockStatus(myUserInfo.id, curUserInfo.id);
  }

  await ctx.render("following", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
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
      amIFollowed,
      amIBlocked,
    },
  });
});

// 粉丝列表页面
router.get("/profile/:userName/follower", loginRedirect, async (ctx, next) => {
  const myUserInfo = ctx.session.userInfo;
  const myUserName = myUserInfo.userName;

  const unreadAtCount = await getUnreadAtCount(myUserInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(myUserInfo.id);

  let curUserInfo;
  const { userName: curUserName } = ctx.params;
  const isMe = myUserName === curUserName;
  if (isMe) {
    curUserInfo = myUserInfo;
  } else {
    const existResult = await isExist(curUserName);
    if (existResult.errno !== 0) {
      ctx.redirect("/");
      return;
    }
    curUserInfo = existResult.data;
  }

  const followerList = await getFollowerList(curUserInfo.id);
  const followingCount = await getFollowingCount(curUserInfo.id);
  const followerCount = await getFollowerCount(curUserInfo.id);

  let amIFollowed = false;
  let amIBlocked = false;
  if (!isMe) {
    amIFollowed = await checkFollowStatus(myUserInfo.id, curUserInfo.id);
    amIBlocked = await checkBlockStatus(myUserInfo.id, curUserInfo.id);
  }

  await ctx.render("follower", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
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
      amIFollowed,
      amIBlocked,
    },
  });
});

// 广场
router.get("/square", loginRedirect, async (ctx, next) => {
  const { keyword } = ctx.query;
  const userId = ctx.session.userInfo?.id;
  
  const unreadAtCount = await getUnreadAtCount(userId);
  const unreadMessageCount = await getTotalUnreadCount(userId);
  
  const followingList = await getFollowingList(userId);
  
  const result = await getSquareBlogList(0, keyword, userId);
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data || {};

  await ctx.render("square", {
    isLogin: true,
    canReply: true,
    unreadAtCount,
    unreadMessageCount,
    followingList: JSON.stringify(followingList),
    currentUserId: userId,
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
  
  const unreadAtCount = await getUnreadAtCount(userId);
  const unreadMessageCount = await getTotalUnreadCount(userId);
  
  const result = await getAtListByUserId(userId, 0, 10);
  const { count, atList } = result;

  await ctx.render("at", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
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

  const blogIdNum = parseInt(blogId);
  if (isNaN(blogIdNum)) {
    ctx.redirect("/");
    return;
  }

  const unreadAtCount = await getUnreadAtCount(userInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(userInfo.id);

  const followingList = await getFollowingList(userInfo.id);

  const result = await getBlogDetail(blogIdNum, userInfo.id);
  if (result.errno !== 0) {
    ctx.redirect("/");
    return;
  }

  await recordViewHistory(userInfo.id, blogIdNum);

  const blog = result.data;

  const followingCount = await getFollowingCount(userInfo.id);
  const followerCount = await getFollowerCount(userInfo.id);

  await ctx.render("detail", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
    followingList: JSON.stringify(followingList),
    currentUserId: userInfo.id,
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

// 浏览历史页面
router.get("/view-history", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;

  const unreadAtCount = await getUnreadAtCount(userInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(userInfo.id);

  const result = await getViewHistoryList(userInfo.id, 0, 10);
  const { count, validCount, historyList } = result.data;

  await ctx.render("view-history", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
    currentUserId: userInfo.id,
    historyData: {
      isEmpty: historyList.length === 0,
      count,
      validCount,
      historyList,
    },
  });
});

// 回收站页面
router.get("/recycle", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;

  const unreadAtCount = await getUnreadAtCount(userInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(userInfo.id);

  const result = await getRecycleList(userInfo.id, 0, 10);
  const { count, blogList } = result.data;

  await ctx.render("recycle", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
    currentUserId: userInfo.id,
    recycleData: {
      isEmpty: blogList.length === 0,
      count,
      blogList,
    },
  });
});

// 草稿箱页面
router.get("/drafts", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;

  const unreadAtCount = await getUnreadAtCount(userInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(userInfo.id);

  await ctx.render("drafts", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
    currentUserId: userInfo.id,
  });
});

// 话题广场页面
router.get("/topics", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;
  const { keyword, pageIndex, sortBy } = ctx.query;

  const unreadAtCount = await getUnreadAtCount(userInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(userInfo.id);
  
  const followingList = await getFollowingList(userInfo.id);
  
  let topicResult;
  if (keyword && keyword.trim()) {
    topicResult = await getTopicList(parseInt(pageIndex) || 0, 20, 'hot');
  } else {
    topicResult = await getTopicList(parseInt(pageIndex) || 0, 20, sortBy || 'hot');
  }
  
  const hotTopics = await getHotTopics(10);

  await ctx.render("topics", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
    followingList: JSON.stringify(followingList),
    currentUserId: userInfo.id,
    topicData: {
      topics: topicResult.topics,
      count: topicResult.count,
      pageIndex: parseInt(pageIndex) || 0,
      pageSize: 20,
      sortBy: sortBy || 'hot',
      keyword
    },
    hotTopics
  });
});

// 话题详情页
router.get("/topic/:topicName", loginRedirect, async (ctx, next) => {
  const userInfo = ctx.session.userInfo;
  const { topicName } = ctx.params;
  const { pageIndex } = ctx.query;

  const decodedTopicName = decodeURIComponent(topicName);
  
  const unreadAtCount = await getUnreadAtCount(userInfo.id);
  const unreadMessageCount = await getTotalUnreadCount(userInfo.id);
  
  const followingList = await getFollowingList(userInfo.id);
  
  const topic = await getTopicDetail(decodedTopicName);
  
  if (!topic) {
    ctx.redirect("/topics");
    return;
  }
  
  const blogResult = await getTopicBlogs(topic.id, parseInt(pageIndex) || 0, 10, userInfo.id);
  
  const hotTopics = await getHotTopics(10);

  await ctx.render("topic-detail", {
    isLogin: true,
    unreadAtCount,
    unreadMessageCount,
    followingList: JSON.stringify(followingList),
    currentUserId: userInfo.id,
    currentTopicName: decodedTopicName,
    topicData: {
      topic,
      blogs: blogResult.blogs,
      count: blogResult.count,
      pageIndex: parseInt(pageIndex) || 0,
      pageSize: 10
    },
    hotTopics
  });
});

module.exports = router;
