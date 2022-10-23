const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = cloud.database().command;

// 创建集合云函数入口函数
exports.main = async (event, context) => {
  console.log("to insert bills", event.year)

  db.collection('diary').where({
      year: event.year.toString()
    })
    .update({
        data: {
            bills: _.push({'date':event.date, 'spend':event.spend, 'purpose':event.purpose})
        }
    })
    .then((res) => {
      console.log("insert bill: ", res)
    })
    .catch(err => {
      console.log(err)
    })

};
