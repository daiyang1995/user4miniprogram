// pages/claimStep/claimStepFour.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  goClaimPage: function(e){
    wx.redirectTo({
      url: '../claimPage/claimPage'
    });
  }
})