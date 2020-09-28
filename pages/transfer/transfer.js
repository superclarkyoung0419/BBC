const api = require('../../utils/fetch');
const app = getApp();
Page({
  data: {
    toUserName: '',
    toUserAvatar: '',
    toUuid: '',
    mUuid: '',
    bonus: '',
    description: '',
    disabled: false
  },
  onLoad(option) {
    this.setData({
      toUserName: option.name,
      toUserAvatar: option.avatar,
      toUuid: option.uuid,
      meUuid: app.globalData.openid
    })
  },
  setBonus(e) {
    if (e.detail.value) {
      this.setData({
        bonus: parseInt(e.detail.value)
      })
    }
  },
  setDesc(e) {
    if (e.detail.value) {
      this.setData({
        description: e.detail.value
      })
    }
  },

  submitForm() {

    this.setData({
      disabled: true
    })
    api.request({
      url: "transaction",
      data: {
        from: this.data.meUuid,
        to: this.data.toUuid,
        bonus: this.data.bonus,
        description: this.data.description
      },
      success: (res) => {
        if (res.result_code === 0) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }, 2000)
        }
      },
      fail: (err) => {
        this.setData({
          disabled: false
        })
      }
    })
  },


  // ---------------request


})