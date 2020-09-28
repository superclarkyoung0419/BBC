//app.js
import api from './utils/fetch'
App({
    onLaunch: function () {
        // 展示本地存储能力
        let globalData = wx.getStorageSync('globalData') || null;
        this.globalData = globalData;

    },
    globalData: {
        userInfo: null,
        code: '',
        openid: null,
    },

    //用户登录流程


})