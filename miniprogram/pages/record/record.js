const { envList } = require('../../envList.js');
var app = getApp()

Page({
    mixins: [require('../../mixin/common')],
    data: {
        today: (new Date()).toLocaleDateString(),
        year: (new Date().getFullYear()),
        init_year: 2022,
        spend: "",
        purpose: "",
        envList,
        selectedEnv: envList[0],
        haveCreateCollection: false,
        popErrorMsg:""
    },

    // 初次加载
    onLoad: function() {
        if (!this.data.haveCreateCollection) {
            this.CreateDataBase();
        }
        var result = this.LoadQuotaFromDataBase(this.data.year);
        if (result[0] == false) {
            if (this.data.init_year == this.data.year) {
                // 创建初始额度
                var init_data = { 
                    'cur_quota':app.globalData.base_quota, 
                    'expect_next_quota':app.globalData.base_quota + app.globalData.quota_increment
                }
                this.InitDataToDataBase(init_data)
            } else if (this.data.init_year < this.data.year) {
                // 拉取上一年
                var last_result = this.LoadQuotaFromDataBase(this.data.year - 1);
                if (last_result[0] == false) {
                    // 创建初始额度
                    var init_data = { 
                        'cur_quota':app.globalData.base_quota, 
                        'expect_next_quota':app.globalData.base_quota + app.globalData.quota_increment
                    }
                    this.InitDataToDataBase(init_data)
                } else {
                    // 创建额度
                    var quota = last_result[1].data.quota;
                    var init_data = { 
                        'cur_quota': quota.cur_quota + app.globalData.quota_increment, 
                        'expect_next_quota': quota.cur_quota +  2 * app.globalData.quota_increment
                    }
                    this.InitDataToDataBase(init_data)
                }
            } else {
                // 创建空额度
                var init_data = { 
                    'cur_quota': 0, 
                    'expect_next_quota': 0
                }
                this.InitDataToDataBase(init_data)
            }
        }
    },

    // 获取input的值
    getSpendValue(e) {
      this.setData({
        spend: e.detail.value
      })
    },
    getPurposeValue(e) {
      this.setData({
        purpose: e.detail.value
      })
    },
    
    CreateDataBase() {
      console.log("create")
      wx.showLoading({
        title: '正在提交...',
      });
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        config: {
          env: this.data.selectedEnv.envId
        },
        data: {
          type: 'createCollection'
        }
      }).then((resp) => {
        if (resp.result.success) {
          this.setData({
            haveCreateCollection: true
          });
        }
        wx.hideLoading();
      }).catch((e) => {
        console.log(e);
        this.setData({
          showUploadTip: true
        });
        wx.hideLoading();
      });
      console.log("create done")
    },

    InsertToDataBase(d) {
        console.log("insert")
        wx.showLoading({
          title: '正在提交...',
        });
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          config: {
            env: this.data.selectedEnv.envId
          },
          data: {
            type: 'insertRecord',
            date: d.today,
            year: d.year,
            spend: d.spend,
            purpose: d.purpose,
            claimed: false,
          }
        }).then((resp) => {
          wx.hideLoading();
        }).catch((e) => {
          console.log(e);
          this.setData({
            showUploadTip: true
          });
          wx.hideLoading();
        });
        console.log("insert done")
    },

    // 加载数据
    LoadQuotaFromDataBase(year) {
        var result = [ false, null];
        console.log("load db data");
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          config: {
            env: this.data.selectedEnv.envId
          },
          data: {
            type: 'selectRecord',
            year: year,
          }
        }).then((resp) => {
            console.log("resp: ", resp);
            if (resp.result.data.length == 0) {
                result[0] = false;
            } else {
                result[0] = true;
                result[1] = resp.result.data[0].quota;
            }
            console.log("get result: ", result)
            return result
        }).catch((e) => {
          console.log(e);
          console.log("get result except: ", result)
          return result
        });
    },

    InitDataToDataBase(d) {
        console.log("init data")
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          config: {
            env: this.data.selectedEnv.envId
          },
          data: {
            type: 'initRecord',
            date: app.globalData.today,
            year: app.globalData.year,
            quota: d.cur_quota,
            next_quota: d.expect_next_quota
          }
        }).then((resp) => {

        }).catch((e) => {
          console.log(e);
        });
        console.log("init data done")
    },

    OnSubmit(e) {
      // 校验输入spend
      console.log("input", this.data.spend)
      if (isNaN(Number(this.data.spend)) || Number(this.data.spend) <=0 || Number(this.data.spend) >= 100000) {
        wx.showToast({
          title:"'金额'输入不合法",
          icon:'error',
          duration:1500
        })
        return;
      }
      this.data.spend = Number(this.data.spend)

      // 校验输入purpose
      if (this.data.purpose.length <= 0 || this.data.purpose.length >= 64) {
        wx.showToast({
          title:"'用途'输入不合法",
          icon:'error',
          duration:1500
        })
        return;
      }

      if (!this.data.haveCreateCollection) {
        this.CreateDataBase();
      }
      this.InsertToDataBase(this.data)
    }
  });
  