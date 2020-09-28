const app = getApp();
const api = require('../../utils/fetch');
Page({
  data: {
    form: {
      title: '',
      bonus: '',
      description: '',
      uuid: null
    }
  },
  onLoad: () => {

  },
  onShow() {
    this.setData({
      form: {}
    })
  },
  // 获取标题
  getTitle(e) {
    if (e.detail.value) {
      this.setData({
        [`form.title`]: e.detail.value
      })
    }
  },
  // 获取积分
  getBonus(e) {
    if (e.detail.value) {
      this.setData({
        [`form.bonus`]: parseInt(e.detail.value)
      })
    }
  },
  // 获取描述信息
  getDesc(e) {
    if (!!e.detail.value) {
      this.setData({
        [`form.description`]: e.detail.value
      })
    }
  },

  // 校验表单
  checkForm() {
    if (this.data.form) {
      console.log(this.data.form);
    }
    return;
  },
  // 点击发布
  publish(e) {
    this.checkForm();
    this.setData({
      [`form.uuid`]: app.globalData.openid
    })
    api.request({
      url: 'public',
      data: this.data.form,
      success: (res) => {
        if (res.result_code === 0) {
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            success: () => {
              wx.switchTab({
                url: '/pages/index/index',
              })
            },

          })
        }
      },
      fail: (err) => {
        console.error('publish', err);
      }
    });
  },
})