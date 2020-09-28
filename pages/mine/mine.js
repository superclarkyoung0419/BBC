const app = getApp();
const api = require('../../utils/fetch');
Page({
  data: {
    userInfo: {},
    courseList: [],
    shopList: [],
    uuid: null,
  },
  // 载入时执行
  onLoad: function () {
    const globalData = app.globalData;
    this.setData({
      uuid: globalData.openid
    });
    this.initData(globalData.openid);
  },
  onShow(){
    this.onLoad();
  },
  //初始化数据
  initData(id) {
    this.getUserInfo(id);
    this.getCourseList(id);
    this.getShopList();
  },
  // 获取用户信息
  getUserInfo(id) {

    this.getWallet(id);
  },
  // 获取历程列表
  getCourseList(id) {
    this.getCourse(id);
  },
  // 获取积分商城列表
  getShopList() {
    const shopList = this.mockShopListData();
    this.setData({
      shopList: shopList
    })
  },

  //------------- request

  // 获取个人钱包数据
  getWallet(uuid) {
    api.request({
      url: "wallet",
      data: {
        uuid: uuid
      },
      success: (res) => {
        if (res.hasOwnProperty("wallet")) {
          const user = app.globalData.userInfo;

          let userInfo = {
            ...user,
            bonus: res.wallet
          };
          if (res.user_hash) {
            userInfo.user_hash = res.user_hash.slice(0, 3) + '*****' + res.user_hash.slice(res.user_hash.length - 3, res.user_hash.length)
          } else {
            userInfo.user_hash = null;
          }
          this.setData({
            userInfo: userInfo
          })
        }
      }
    })
  },

  // 获取历程数据
  getCourse(uuid) {
    api.request({
      url: 'course',
      data: {
        uuid: uuid
      },
      success: (res) => {
        if (res && res.length > 0) {
          let courseArr = [];
          res.forEach(item => {
            courseArr.push({
              title: item.comment
            })
          })
          this.setData({
            courseList: courseArr
          })
        }
      }
    })
  },


  //------------mock data----------------

  mockShopListData() {
    const gifArr = [];
    for (let i = 0; i < Math.round(Math.random() * 15) + 1; i++) {
      gifArr.push({
        gifImg: "../../images/shop-item.png",
        gifTitle: `Apple iMac ${(Math.random()*50).toFixed(1)}英寸`,
        gifBonus: Math.round(Math.random() * 10000)
      })
    }
    gifArr.sort((ia, ib) => ia.gifBonus - ib.gifBonus);
    return gifArr;
  }
})