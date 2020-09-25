const ajax = require('../../utils/fetch');
Page({
  data: {
    userInfo: {},
    formData: {}
  },
  getUserInfo() {

  },
  submitForm() {
    console.log('submitForm');
  },


  // ---------------request

  // 提交转账
  postTransfer() {
    ajax.myRequest({
      url: "/transaction",
      data: {
        from: 'aaaaa',
        to: 'bbbb',
        bonus: 15,
        description: 'asdfadf'
      },
      success: (res) => {
        console.log('postTransfer', res);
      }
    })
  },
})