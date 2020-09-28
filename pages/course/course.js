const api = require('../../utils/fetch');
const app = getApp();
Page({
  data: {
    dateLine: []
  },

  onLoad() {
    this.initData();
  },
  // 初始化数据
  initData() {
    this.getCourse();
  },
  // 处理历程数据
  groupDate(dateArr) {
    if (!dateArr || dateArr.length <= 0) return;
    //--------数据太少，增加模拟数据
    // let yearList = ['2017', '2018', '2019', '2020'],
    //   monthList = ['01', '03', '05', '06', '07', '09', '11'];

    // for (let i = 0; i < 15; i++) {
    //   let mockObj = {
    //     "bonus": Math.round(Math.random() * 30),
    //     "comment": "just for fun",
    //     "from": "clark1",
    //     "time": yearList[Math.round(Math.random() * 4) - 1] + '-' + monthList[Math.round(Math.random() * 7) - 1] + '-' + Math.round(Math.random() * 30) + " 13:59:28",
    //     "to": "clark2"
    //   }
    //   dateArr.push(mockObj);
    // }

    //---------模拟结束
    let dateObj = {},
      newDateArr = [];
    // 设置时间戳
    dateArr.map((item) => {
      //生成时间戳用于排序
      item.timestamp = new Date(item.time).getTime();
      //@parma {time}:"2020-09-24 13:59:28"
      item.date = item.time.slice(5, 10); //日期 @param {date}:09-24
      item.day = new Date(item.time).getDate(); //天 @param {day}:24
      item.month = item.time.slice(5, 7); //月 @parma {month}:09
      item.year = new Date(item.time).getFullYear(); //年 @parma {year}:2020
      //防止出现小数
      item.bonus = parseInt(item.bonus);
      item.user_hash = item.user_hash ? item.user_hash.slice(0, 3) + '*****' + item.user_hash.slice(item.user_hash.length - 3, item.user_hash.length) : null;
    })
    // 倒序排序
    dateArr.sort((na, nb) => nb.timestamp - na.timestamp);

    //生成去重对象
    dateArr.forEach(item => {
      if (!dateObj.hasOwnProperty(item.year)) {
        dateObj[item.year] = {}
      }
      if (!dateObj[item.year].hasOwnProperty(item.date)) {
        dateObj[item.year][item.date] = [item];
      } else {
        dateObj[item.year][item.date].push(item)
      }
    });
    //生成最终数据列表
    for (let key in dateObj) {
      let sortObj = {
        year: key,
        list: []
      }
      for (let date in dateObj[key]) {
        sortObj.list.push({
          month: date.slice(0, 2),
          day: date.slice(3, 5),
          list: dateObj[key][date]
        });
      }
      newDateArr.push(sortObj)
    }
    newDateArr.sort((na, nb) => nb.year - na.year);
    return newDateArr;
  },


  // -------------------request


  // 获取历程数据
  getCourse() {
    api.request({
      url: "course",
      data: {
        uuid: app.globalData.openid
      },
      success: (res) => {
        const courseList = this.groupDate(res);
        this.setData({
          dateLine: courseList
        })
      }
    })
  }
})