const { envList } = require('../../envList.js');

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
        popErrorMsg:""
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
  