const { envList } = require('../../envList.js');
var app = getApp()

Page({
    mixins: [require('../../mixin/common')],
    data: {
        today: (new Date()).toLocaleDateString(),
        year: (new Date().getFullYear()),
        spend: "",
        purpose: "",
        envList,
        selectedEnv: envList[0],
        haveCreateCollection: false,
        haveInitCollection: false,
    },

    // 初次加载
    onLoad: function() {
        this.InitPageData()
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
        title: '正在初始化...',
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
          wx.showToast({
            title:"'提交成功",
            icon:'success',
            duration:1500
          })
          this.setData({
            spend: "",
            purpose: ""
          });
        }).catch((e) => {
          console.log(e);
          this.setData({
            showUploadTip: true
          });
          wx.hideLoading();
          wx.showToast({
            title:"'系统异常",
            icon:'error',
            duration:2000
          })
        });
        console.log("insert done")
    },

    // 加载数据
    async LoadQuotaFromDataBase(year) {
        var result = [ false, null];
        console.log("load db data");
        var resp = await wx.cloud.callFunction({
            name: 'quickstartFunctions',
            config: {
                env: this.data.selectedEnv.envId
            },
            data: {
                type: 'selectRecord',
                year: year,
            }
        });
        if (resp.result.data.length == 0) {
            result[0] = false;
        } else {
            result[0] = true;
            result[1] = resp.result.data[0].quota;
        }
        return result
    },

    InitDataToDataBase(d) {
        console.log("init data:", d)
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
            if (resp.result.success) {
                this.setData({
                  haveInitCollection: true
                });
              }
        }).catch((e) => {
          console.log(e);
        });
    },

    OnSubmit(e) {
        if (!this.data.haveInitCollection) {
            wx.showToast({
                title:"'系统繁忙",
                icon:'error',
                duration:1000
              })
              return;
        }
      // 校验输入spend
      console.log("input", this.data.spend)
      if (isNaN(Number(this.data.spend)) || Number(this.data.spend) <=0 || Number(this.data.spend) >= 100000) {
        wx.showToast({
          title:"'金额'输入不合法",
          icon:'error',
          duration:1000
        })
        return;
      }
      this.data.spend = Number(this.data.spend)

      // 校验输入purpose
      if (this.data.purpose.length <= 0 || this.data.purpose.length >= 64) {
        wx.showToast({
          title:"'用途'输入不合法",
          icon:'error',
          duration:1000
        })
        return;
      }

      if (!this.data.haveCreateCollection) {
        this.CreateDataBase();
      }
      this.InsertToDataBase(this.data)
    },

    // 初始化
    async InitPageData() {
        if (!this.data.haveCreateCollection) {
            await this.CreateDataBase();
        }

        var result = await this.LoadQuotaFromDataBase(app.globalData.year);
        console.log("load quota res: ", result)

        if (result[0] == false) {
            if (app.globalData.init_year == app.globalData.year) {
                // 创建初始额度
                var init_data = { 
                    'cur_quota':app.globalData.base_quota, 
                    'expect_next_quota':app.globalData.base_quota + app.globalData.quota_increment
                }
                this.InitDataToDataBase(init_data)
            } else if (app.globalData.init_year < app.globalData.year) {
                // 拉取上一年
                var last_result = this.LoadQuotaFromDataBase(app.globalData.year - 1);
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
        } else {
            this.setData({
                haveInitCollection: true
            });
        }
    }
  });
  