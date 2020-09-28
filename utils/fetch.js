const baseUrl = "https://www.cfetsit-bbc.top";
const urlList = {
  login: '/login', //登录接口
  userInfo: '/user_info', //获取用户信息
  transaction: '/transaction', //转积分
  wallet: '/my_wallet', //我的积分
  course: '/my_log', //历程
  public: '/insert_task', //发布任务
  complete: '/complete_task', //完成任务
  tasks: '/search_log', //任务列表
};
const resultMap = ['成功', 'login fail', 'fund insufficient', 'user not found', 'task publish failed', 'task complete failed']

// 封装request请求
const request = options => {
  if (options) {
    // header 设置Content-Type，accesstoken, usertoken, noncestr, timestamp等信息，与后台协商好
    if (options.header === undefined || options.header === null) {
      options.header = {};
    }
    options.header['Content-Type'] = 'application/json; charset=UTF-8';
    // usertoken在登录后保存在缓存中，所以从缓存中取出，放在header
    let openid = wx.getStorageSync('openid');
    if (openid) {
      options.header['openid'] = openid;
    }


    if (urlList[options.url] && urlList[options.url].indexOf('http') != 0) {
      options.url = baseUrl + urlList[options.url];
    }
    // method、data
    if (options.method === undefined || options.method === null) {
      options.method = 'post';
    }

    //success
    if (options.success && typeof (options.success) === 'function') {
      let successCallback = options.success;
      options.success = function (res) {
        // 判断不同的返回码 200/404
        if (res.statusCode === 200) {
          let resData = res.data;

          if (resData.result_code === 0 || !resData.result_code) {
            try {
              successCallback(resData)
            } catch (e) {
              console.error(options.url + ':' + e)
            };
          } else {
            wx.showToast({
              title: resultMap[resData.result_code] ? resultMap[resData.result_code] : '程序异常',
              icon: 'info',
              duration: 2000,
              mask: true,
              success: () => {},
              fail: () => {
                wx.reLaunch({
                  url: '/pages/login/login',
                })
              }
            })
          }
        } else if (res.statusCode === 404) {
          wx.showToast({
            title: "404",
            icon: 'warn',
            duration: 3000,
          })
        } else {
          console.error('请求失败');
          wx.showToast({
            title: "程序异常",
            icon: 'warn',
            duration: 5000,
          })
        }
      }
    }
    //执行微信的请求
    wx.request(options);

  }
}


module.exports = {
  request: request
}