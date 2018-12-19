const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    claimApplyId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    _this.data.claimApplyId = options.claimApplyId;
    wx.showLoading({
      mask: true
    });
    const url = app.globalData.baseUrl + 'apiIndex/claimDetailPage';
    const params = {
      claimApplyId: _this.data.claimApplyId,
      userId: wx.getStorageSync('userId')
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header')).then(res => {
      const resJson = res.data;
      console.log(resJson);
      if (resJson.ret == "0") {
        _this.setData({
          claimApplyId: _this.data.claimApplyId,
          pageData: resJson
        })
      } else {
        wx.showToast({
          title: resJson.msg,
          icon: "none",
          duration: 2000
        });
      }
    }).catch(e => {
      console.log(e);
      wx.redirectTo({
        url: '../error/error?msg=请求错误'
      });
    }).finally(function(res) {
      console.log('finally~');
      wx.hideLoading();
    })

  },
  claimAttachPage: function(e) {
    const _this = this;
    wx.redirectTo({
      url: '../claimPage/claimAttach?auditStatus=1&claimApplyId=' + _this.data.claimApplyId
    });
  },
  claimReceiptPage: function(e) {
    const _this = this;
    wx.redirectTo({
      url: '../claimPage/claimReceipt?claimApplyId=' + _this.data.claimApplyId
    });
  },
  back: function(e) {
    wx.redirectTo({
      url: '../claimPage/claimPage'
    });
  }
})