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
// force: true 重新创建所有表（会清空数据），确保字段和索引正确创建
seq.sync({ force: true }).then(() => {
  console.log("sync ok");
  process.exit();
});
