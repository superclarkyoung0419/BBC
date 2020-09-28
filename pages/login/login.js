const app = getApp();
const api = require('../../utils/fetch');
app.globalData = {};
Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        if (app.globalData && app.globalData.userInfo) {
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
        }
    },
    // 绑定登录操作
    _login() {
        this.login()
            .then(res => {
                try {
                    wx.setStorageSync('globalData', app.globalData)
                } catch (e) {
                    console.error('login时setStorageSync设置失败');
                }
                //前往首页
                wx.switchTab({
                    url: '../index/index',
                })
            })
    },
    //获取用户信息
    _getUserInfo: function (code) {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: res => {
                    resolve({
                        ...res,
                        code
                    })
                },
                fail: err => {
                    reject(err)
                }
            })
        })
    },
    //获取用户可用权限设置 //暂时不用
    getSetting() {
        return new Promise((resolve, reject) => {
            // 获取用户信息
            wx.getSetting({
                success: res => {
                    console.log('getSetting', res);
                    if (res.authSetting['scope.userInfo']) {
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                        wx.getUserInfo({
                            success: res => {
                                if (this.userInfoReadyCallback) {
                                    this.userInfoReadyCallback(res)
                                }
                            }
                        })
                    }
                }
            })
        })
    },
    // 登录封装
    login() {
        return new Promise((resolve, reject) => {
            let sessionKey = wx.getStorageSync('sessionKey')
            if (sessionKey) {
                console.log('sessionKey不为空')
                this._checkWXSession() //检查用户的登录态在微信服务端是否过期
                    .then(res => {
                        console.log('sessionKey校验通过')
                        resolve()
                    })
                    .catch((res) => {
                        console.log('sessionKey校验未通过，过期了')
                        this._wxLogin()
                            .then(res => {
                                return this._serLogin(res.code)
                            }).then((res) => {
                                resolve(res)
                            })
                    })
            } else {
                console.log('sessionKey为空，先微信服务器登录，再进行开发者服务器登录')
                this._wxLogin()
                    .then(res => {
                        app.globalData.code = res.code;
                        return this._getUserInfo(res.code)
                    })
                    .then(res => {
                        let {
                            userInfo,
                            code
                        } = res;
                        app.globalData.userInfo = userInfo || null;
                        return this._serLogin(code, userInfo.nickName, userInfo.avatarUrl)
                    }).then((res) => {
                        app.globalData.openid = res.openid ? res.openid : null;
                        return resolve(res)
                    })
            }
        })
    },
    //检查微信服务器登录态是否过期的代码封装
    _checkWXSession() {
        return new Promise((resolve, reject) => {
            wx.checkSession({
                success: () => {
                    resolve(true)
                },
                fail: () => {
                    reject(false)
                }
            })
        })
    },

    //开发者服务器请求接口登录的封装：
    _serLogin(code, name, image) {
        if (!code || !name || !image) return;
        return new Promise((resolve, reject) => {
            api.request({
                url: 'login',
                data: {
                    'js_code': code,
                    'wx_name': name,
                    'wx_image': image
                },
                success: res => {
                    wx.setStorageSync('sessionKey', res.data)
                    console.log('登录成功的回调')
                    resolve(res)
                },
                fail: err => {
                    this._show_error('开发者服务器登录失败') //这个是消息提示框，在请求中封装了，这里简单理解错误弹出消息提示。
                }
            })
        })
    },

    //wx.login()微信登录接口api的封装：
    _wxLogin() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    if (res.code) {
                        resolve(res);
                    } else {
                        reject(res);
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            })
        })
    }
})