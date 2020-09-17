//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
    },
    onLoad: function() {
        console.log(app.globalData.userInfo);
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }
        // else if (this.data.canIUse) {
        //     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //     // 所以此处加入 callback 以防止这种情况
        //     app.userInfoReadyCallback = res => {
        //         this.setData({
        //             userInfo: res.userInfo,
        //             hasUserInfo: true
        //         })
        //     }
        // }
        else {
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
    getWxUserInfo() {

    },
    navigatorToCoin() {
        wx.navigateTo({
            url: '/pages/getcoins/getcoins'
        })
    },
    getScancode: function() {
        wx.scanCode({
            success: (res) => {
                var result = res.result;
                console.log(result)
                    // _this.setData({
                    //     result: result,
                    // })
                    // wx.showToast({
                    //     title: '成功',
                    //     icon: 'success',
                    //     duration: 2000
                    // })
            },
            fail: (res) => {
                console.log(res)
            },
            complete: (res) => {
                console.log(res)
            }

        })

    }
})