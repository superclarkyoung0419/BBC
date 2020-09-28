login: () => {
  return new Promise((resolve, reject) => {
    let sessionKey = wx.getStorageSync('sessionKey')
    if (sessionKey) {
      console.log('sessionKey不为空')
      this._checkWXSession() //检查用户的登录态在微信服务端是否过期
        .then(() => {
          console.log('微信后台未过期>>>开始检测开发者服务器登录态')
          return this._checkSerSession() // 检查用户登录态在开发者服务器端是否过期
        }).then(res => {
          console.log('sessionKey校验通过')
          resolve()
        })
        .catch((res) => {
          console.log('sessionKey校验未通过，过期了')
          this._wxLogin().then(res => {
            console.log(res)
            return this._serLogin(res.code)
          }).then(() => {
            resolve()
          })
        })
    } else {
      console.log('sessionKey为空，先微信服务器登录，再进行开发者服务器登录')
      this._wxLogin().then(res => {
        console.log(res)
        return this._serLogin(res.code)
      }).then(() => {
        resolve()
      })
    }
  })
}

_checkWXSession: () => {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: () => {
        resolve(true)
      },
      fail: () => {
        reject(false)
      }
    })
  })
}
_serLogin: (code) => {
  return new Promise((resolve, reject) => {
    this.request({
        url: api.login,
        data: {
          code: code
        },
        method: 'post'
      })
      .then(res => {
        wx.setStorageSync('sessionKey', res.data)
        console.log('登录成功的回调')
        resolve()
      })
      .catch(err => {
        this._show_error('开发者服务器登录失败') //这个是消息提示框，在请求中封装了，这里简单理解错误弹出消息提示。
      })
  })
}
_wxLogin: () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    })
  })
}
