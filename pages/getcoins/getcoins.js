const app = getApp();
const QRCode = require('../../utils/weapp-qrcode.js')
import rpx2px from '../../utils/rpx2px.js'
let qrcode;

// 300rpx 在6s上为 150px
const qrcodeWidth = rpx2px(362)

Page({
  data: {
    qrcodeWidth: qrcodeWidth
  },
  onLoad: function (options) {
    let userInfo = app.globalData.userInfo,
      uuid = app.globalData.openid;
    qrcode = new QRCode('canvas', {
      // usingIn: this,         //限制了长度，省略了前面路径部分
      text: "name=" + userInfo.nickName + '&avatar=' + userInfo.avatarUrl + '&uuid=' + uuid,
      image: '/images/shoufenmabg.png',
      width: qrcodeWidth,
      height: qrcodeWidth,
      colorDark: "#000000",
      colorLight: "white",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },
})