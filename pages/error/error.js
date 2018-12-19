// pages/error/error.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg:"系统异常,请联系管理员"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const msg = options.msg;
    this.setData({
      msg: msg
    })
  },
  call: function(e){
    const dataset = e.currentTarget.dataset;
    const tel = dataset["tel"];
    wx.makePhoneCall({
      phoneNumber: tel
    })
  }
})