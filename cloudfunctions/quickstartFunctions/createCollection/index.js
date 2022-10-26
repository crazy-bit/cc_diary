const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 创建集合云函数入口函数
exports.main = async (event, context) => {
    console.log("create database")
  try {
    // 创建集合
    await db.createCollection('diary');
    /*await db.collection('diary').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        year: "2022",
        bills: [{'date':'2022-10-16', 'spend':1000, 'purpose':'衣服'}],
        quota: { 'cur_year':100000, 'last_year':0, 'expect_next_year':11000 }
      }
    });*/
    return {
      success: true
    };
  } catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端，避免工具在前端抛出异常
    return {
      success: true,
      data: 'create collection success'
    };
  }
};
