const { envList } = require('../../envList.js');

Page({
    mixins: [require('../../mixin/common')],
    data: {
        today: (new Date()).toLocaleDateString(),
        spend: "",
        purpose: "",
        envList,
        selectedEnv: envList[0],
        haveCreateCollection: false
    },
    // 获取input的值
    getSpendValue(e) {
      console.log("getSpendValue")
      this.setData({
        spend: e.detail.value
      })
    },
    getPurposeValue(e) {
      console.log("getPurposeValue")
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
    InsertRecord(one_bill) {

    },

    OnSubmit(e) {
      if (!this.data.haveCreateCollection) {
        this.CreateDataBase();
      } else {
        console.log("add record ")
        console.log(this.data.spend)
        console.log(this.data.purpose)
        console.log(this.data.today)
        console.log("add record done")
      }
    }
  });
  