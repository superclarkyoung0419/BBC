//index.js
//获取应用实例
const app = getApp()
import api from '../../utils/fetch';
Page({
    data: {
        userInfo: {},
        taskList: null,
    },
    onLoad: function () {
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

        this.setData({
            slideButtons: [{
                text: '完成',
                extClass: 'complete'
            }],
        });
    },
    onShow() {
        if (app.globalData.openid) {
            this._getTaskList(app.globalData.openid);
        } else {
            console.error('未获得用户openid');
        }
    },
    slideButtonTap(e) {

        if (e.detail.index === 0 && e.currentTarget.dataset.taskid) {
            this.completeTask(e.currentTarget.dataset.taskid);
        }
    },
    navigatorToCoin() {
        wx.navigateTo({
            url: '/pages/getcoins/getcoins'
        })
    },
    getScancode: function () {
        wx.scanCode({
            success: (res) => {
                if (res.result) {
                    wx.navigateTo({
                        url: '/pages/transfer/transfer?' + res.result
                    })
                }
            },
            fail: (res) => {
                console.log(res)
            },
            complete: (res) => {
                console.log(res)
            }
        })
    },
    //获取首页任务列表
    _getTaskList(id) {
        api.request({
            url: 'tasks',
            data: {
                uuid: id
            },
            success: (res) => {
                const list = res;
                if (list && list.length > 0) {
                    list.map(item => {
                        item.avatar = item.wx_image;
                        item.name = item.wx_name;
                        item.user_hash = item.user_hash ? item.user_hash.slice(0, 3) + '*****' + item.user_hash.slice(item.user_hash.length - 3, item.user_hash.length) : '';
                    })

                    this.setData({
                        taskList: list
                    })
                }
            }
        })
    },

    //完成任务
    completeTask(id) {
        api.request({
            url: 'complete',
            data: {
                task_id: id,
                uuid: app.globalData.openid
            },
            success: (res) => {
                if (res.result_code === 0) {
                    this.onShow();
                }
            },
            fail: (err) => {
                console.error('completeTask', err);
            }
        });
    }
})