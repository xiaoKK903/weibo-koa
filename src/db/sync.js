/**
 * @description sequelize 同步数据库
 * @author milk
 */

const seq = require("./seq");

require("./model/index");

// 测试连接
seq
  .authenticate()
  .then(() => {
    console.log("auth ok");
  })
  .catch(() => {
    console.log("auth err");
  });

// 执行同步
// alter: true 安全同步表结构（不会删除数据）
seq.sync({ alter: true }).then(() => {
  console.log("sync ok");
  process.exit();
});
