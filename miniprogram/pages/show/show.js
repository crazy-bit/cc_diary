const { envList } = require('../../envList.js');
var app = getApp()

Page({
    mixins: [require('../../mixin/common')],
    data: {
        bill_list: [
        ],
        year: app.globalData.year,
        cur_quota: 0,
        left_quota: 0,
        next_year_quota: 0,
        envList,
        selectedEnv: envList[0]
    },

    LoadFromDataBase() {
        console.log("load db data")
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          config: {
            env: this.data.selectedEnv.envId
          },
          data: {
            type: 'selectRecord',
            year: app.globalData.year,
          }
        }).then((resp) => {
            // 解析bills
            var total_spend = 0;
            var new_bills = [];
            var bills = resp.result.data[0].bills;
            for (var i = 0; i < bills.length; i++) {
                var d = new Date(bills[i].date);
                var name = d.getMonth()+1 + "-" + d.getDate() + "消费" + bills[i].spend + "，用于" + bills[i].purpose;
                new_bills.push({'name':name, 'claimed':bills[i].claimed, 'value':i});
                total_spend += bills[i].spend;
            }
            this.setData({bill_list:new_bills});

            // 解析额度
            var quota = resp.result.data[0].quota;
            this.setData({cur_quota:quota.cur_year * 10000});
            this.setData({next_year_quota:quota.expect_next_year * 10000});
            var left = quota.cur_year * 10000 - total_spend
            if (left < 0) {
                left = 0
            }
            this.setData({left_quota:left});
        }).catch((e) => {
          console.log(e);
        });
    },

    // 初次加载
    onLoad: function() {
        this.LoadFromDataBase()
      },

    onPullDownRefresh: function() {
        console.log("on reload page")
        this.LoadFromDataBase()
    }
  });
  