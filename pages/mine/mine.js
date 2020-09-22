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
    const user = this.mockUserData();
    this.setData({
      userInfo: user
    })
  },
  // 获取历程列表
  getCourseList() {
    const courseList = this.mockCourseData();
    this.setData({
      courseList: courseList
    })
  },
  // 获取积分商城列表
  getShopList() {
    const shopList = this.mockShopListData();
    this.setData({
      shopList: shopList
    })
  },


  //------------mock data----------------
  mockUserData() {
    const user = {
      userName: 'lucky',
      hasBonus: '100',
      department: '开发一组',
      avatar: "https://i.loli.net/2017/08/21/599a521472424.jpg"
    };
    return user;
  },

  mockCourseData() {
    const textStr = "需要市场调研及商业计划书";
    const textArr = [];
    for (let i = 0; i < 5; i++) {
      textArr.push({
        title: textStr.slice(0, parseInt(Math.random() * 12)),
        time: new Date()
      })
    }
    return textArr;
  },
  mockShopListData() {
    const gifArr = [];
    for (let i = 0; i < Math.round(Math.random() * 15); i++) {
      gifArr.push({
        gifImg: "https://i.loli.net/2017/08/21/599a521472424.jpg",
        gifTitle: `Apple iMac ${(Math.random()*50).toFixed(1)}英寸`,
        gifBonus: Math.round(Math.random() * 10000)
      })
    }
    return gifArr;
  }
})