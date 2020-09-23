Page({
  data: {
    dateLine: []
  },
  onLoad() {
    this.initData();
  },
  initData() {
    this.getTimeLineData();
  },
  getTimeLineData() {
    const timelineList = this.mockTimeLineData();

    timelineList.sort((itema, itemb) => itemb.date - itema.date);

    const timelineData = this.groupDate(timelineList);

    this.setData({
      dateLine: timelineData
    })
  },

  groupDate(dateArr) {
    if (!dateArr || dateArr.length <= 0) return;
    let dateObj = {},
      newDateArr = [];
    dateArr.forEach((item, index) => {
      if (item.date) {
        item.year = new Date(item.date).getFullYear();
        item.month = new Date(item.date).getMonth() + 1;
        item.day = new Date(item.date).getDate();
      }
      if (!dateObj.hasOwnProperty(item.year) && item.year) {
        dateObj[item.year] = [];
      }
      dateObj[item.year].push(item);

    })
    for (let key in dateObj) {
      newDateArr.push({
        year: key,
        list: dateObj[key]
      })
    }
    newDateArr.sort((na, nb) => nb.year - na.year);


    return newDateArr;

  },

  //-----------mock data-----------


  mockTimeLineData() {
    const yearList = [2017, 2018, 2019, 2020],
      timeList = [];
    for (let i = 0; i < Math.round(Math.random() * 30); i++) {
      let year = yearList[Math.round(Math.random() * 3)],
        month = Math.round(Math.random() * 11) + 1,
        day = (month === 2) ? Math.round(Math.random() * 28) + 1 : Math.round(Math.random() * 30) + 1,
        timestamp = new Date(year + '-' + month + '-' + day + " 00:00:00").getTime(),
        titleStr = '需要市场调研及商业计划书需要市场调研及商业计划书';
      console.log(year + '-' + month + '-' + day);
      timeList.push({
        date: timestamp,
        title: titleStr.slice(0, Math.round(Math.random() * 20) + 4),
        bouns: Math.round(Math.random() * 50)
      })
    }
    return timeList;
  },
})