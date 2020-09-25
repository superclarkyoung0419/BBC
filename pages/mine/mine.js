const app = getApp();
const ajax = require('../../utils/fetch');
Page({
  data: {
    userInfo: {},
    courseList: [],
    shopList: []
  },
  // 载入时执行
  onLoad: function () {
    console.log('loading');

    this.initData();
  },
  //初始化数据
  initData() {
    this.getUserInfo();
    this.getCourseList();
    this.getShopList();
  },
  // 获取用户信息
  getUserInfo() {

    this.getWallet();

  },
  // 获取历程列表
  getCourseList() {
    this.getCourse();
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
  getWallet() {
    ajax.myRequest({
      url: "/my_wallet",
      data: {
        uuid: "afasdfasdfasdf"
      },
      success: (res) => {
        if (res.hasOwnProperty("wallet")) {
          const user = app.globalData.userInfo;
          let userInfo = {
            ...user,
            bonus: res.wallet
          };
          this.setData({
            userInfo: userInfo
          })
        }
      }
    })
  },

  // 获取历程数据
  getCourse() {
    ajax.myRequest({
      url: '/my_log',
      data: {
        uuid: "afasdfasdfasdf"
      },
      success: (res) => {
        console.log('getCourse', res)
      }
    })
  },


  //------------mock data----------------
  mockUserData() {
    const user = {
      userName: 'lucky',
      hasBonus: Math.round(Math.random() * 1000),
      department: `开发${Math.round(Math.random()*5)}组`,
      avatar: "https://i.loli.net/2017/08/21/599a521472424.jpg"
    };
    return user;
  },

  mockCourseData() {
    const textStr = "需要市场调研及商业计划书";
    const textArr = [];
    for (let i = 0; i < Math.round(Math.random() * 10); i++) {
      textArr.push({
        title: textStr.slice(0, parseInt(Math.random() * 12) + 4),
        time: new Date()
      })
    }
    return textArr;
  },
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