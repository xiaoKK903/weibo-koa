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
// force: false 只会创建不存在的表，不会删除现有数据
// 如果你想重新创建所有表（会清空数据），可以改成 force: true
seq.sync({ force: false }).then(() => {
  console.log("sync ok");
  process.exit();
});
