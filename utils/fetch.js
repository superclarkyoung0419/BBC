const app = getApp();
const appid = 'wxa9ff3a8a8c5b5d84';
const appSecret = '76c073ec6a5f04e50e0ed4c2ce6dc8c5';
let ajaxNum = 0;

// 获取accessToken
function getAccessToken(callback) {
  wx.request({
    url: '/api/Token',
    data: {
      appid: aesEncrypt(appid), // aesEncrypt():自定义的用crypto-js.js进行aes加密的方法,这里只需要知道加密了即可，不需要关注此方法
      appSecret: aesEncrypt(appSecret),
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
    getAccessToken(function (accesstoken) {
      // header 设置Content-Type，accesstoken, usertoken, noncestr, timestamp等信息，与后台协商好
      if (options.header === undefined || options.header === null) {
        options.header = {};
      }
      options.header['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
      // usertoken在登录后保存在缓存中，所以从缓存中取出，放在header
      let usertoken = wx.getStorageSync('usertoken');
      if (usertoken) {
        options.header['usertoken'] = usertoken;
      }
      // 自定义getNoncestr()设置随机字符串，getTimestamp()获取时间戳
      let noncestr = getNoncestr();
      let timestamp = getTimestamp();
      // sign进行加密
      let sign = getSign(accesstoken, appid, appSecret, noncestr, timestamp);
      if (timestamp) {
        options.header['timestamp'] = timestamp;
      }
      if (noncestr) {
        options.header['noncestr'] = noncestr;
      }
      if (sign) {
        options.header['sign'] = sign;
      }
      //url
      let baseUrl = config.BASE_HOST;
      if (options.url.indexOf('http') != 0) {
        options.url = baseUrl + options.url;
      }
      // method、data
      if (options.method === undefined || options.method === null) {
        options.method = 'post';
      }
      if (options.method.toLowerCase() === 'post') {
        if (options.data) {
          let dataStr = JSON.stringify(options.data);
          let base64Str = base64Encrypt(dataStr);
          options.data = serializeData({
            param: base64Str
          });
        }
      }
      //success
      if (options.success && typeof (options.success) === 'function') {
        let successCallback = options.success;
        options.success = function (res) {
          // 判断不同的返回码 200/404
          if (res.statusCode === 200) {
            try {
              // 接收的后台数据用自定义base64解密方法解密后转为对象 
              let str = base64Decrypt(res.data);
              let data = JSON.parse(str);
              if (parseInt(data.resultCode, 10) === -1) { //后台商议好的状态码，-2未登录，-1-3后台出错
                console.error('网络超时，请稍后重试');
              } else if (parseInt(data.resultCode, 10) === -3) {
                console.error(data.msg);
              } else if (parseInt(data.resultCode, 10) === -2) {
                console.log("用户未登录-ajax");
              }
              res.data = data;
              //调用自定义的success
              successCallback(res);
            } catch (e) {
              console.error('出错了，' + e + ',接口返回数据:' + res.data);
            }
          } else if (res.statusCode === 404) {
            console.log('404');
          }
        }
      }
      //执行微信的请求
      wx.request(options);
    });
  }
}


module.exports = {
  myRequest: myRequest
}