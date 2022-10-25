const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = cloud.database().command;

// 创建集合云函数入口函数
exports.main = async (event, context) => {
  console.log("init data", event)
  try {
    await db.collection('diary').add({
        // data 字段表示需新增的 JSON 数据
        data: {
            year: event.year.toString(),
            bills: [],
            quota: { 'cur_year':event.quota, 'last_year':0, 'expect_next_year':event.next_quota }
        }
    });
    return {
        success: true
    };
} catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端，避免工具在前端抛出异常
    return {
        success: true,
        data: 'init data success'
    };
}

};
