const app = getApp();
const appid = 'wxa9ff3a8a8c5b5d84';
const appSecret = '76c073ec6a5f04e50e0ed4c2ce6dc8c5';
let ajaxNum = 0,
  baseUrl = "https://www.cfetsit-bbc.top";

// 获取accessToken
function getAccessToken(callback) {
  wx.request({
    url: '/api/Token',
    data: {
      appid: appid, // aesEncrypt():自定义的用crypto-js.js进行aes加密的方法,这里只需要知道加密了即可，不需要关注此方法
      appSecret: appSecret,
    },
    success: function (res) {
      if (res.statusCode === 200 && res.data.code === 0) {
        let accesstoken = res.data.data.accesstoken;
        if (typeof (callback) === 'function' && accesstoken) {
          callback(accesstoken);
        }
      }
    },
  })
}

// 封装request请求
const myRequest = options => {
  if (options) {

    // header 设置Content-Type，accesstoken, usertoken, noncestr, timestamp等信息，与后台协商好
    if (options.header === undefined || options.header === null) {
      options.header = {};
    }
    options.header['Content-Type'] = 'application/json; charset=UTF-8';
    // usertoken在登录后保存在缓存中，所以从缓存中取出，放在header
    let usertoken = wx.getStorageSync('usertoken');
    if (usertoken) {
      options.header['usertoken'] = usertoken;
    }


    if (options.url.indexOf('http') != 0) {
      options.url = baseUrl + options.url;
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
          try {
            console.log('ajax', res);
            successCallback(res.data)
          } catch (e) {
            console.error(options.url + ':' + e)
          };
        } else if (res.statusCode === 404) {
          console.log('404');
        }
      }
    }
    //执行微信的请求
    wx.request(options);

  }
}


module.exports = {
  myRequest: myRequest
}