const app = getApp();
const ajax = require('../../utils/fetch');
Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function() {
        wx.getStorage({
            key: 'code',
            success(res) {
                debugger
                wx.request({
                    url: 'https://www.cfetsit-bbc.top/login', //仅为示例，并非真实的接口地址
                    data: {
                        "js_code": res.data,
                        "wx_name": "roy",
                        "wx_image": "http://baidu.com"
                    },
                    method: 'POST',
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success: function(res) {
                        console.log(res.data)
                    },
                    fail: res => {
                        console.log(res)
                    }
                })
            }
        })

        // ajax.myRequest({
        //     url: '/login',
        //     data: {
        //         "uuid": '021jLwGa1YS6Fz0mvDFa1p8Okt2jLwGd',
        //         "wx_name": "roy",
        //         "wx_image": "http://baidu.com"
        //     },
        //     method: 'POST',
        //     success: res => {
        //         console.log(res, '成功')
        //     },
        //     fail: err => {
        //         console.error(err);
        //     }
        // })



        if (app.globalData.userInfo) {

            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }
    },
    getUserInfo: function(e) {
        console.log(e)

        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
        wx.switchTab({
            url: `/pages/index/index`
        })
    }
})