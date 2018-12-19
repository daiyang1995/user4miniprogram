const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();
const animateTime = 200;
const util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {},
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
    const url = app.globalData.baseUrl + 'apiClaim/claimStepTwoPage';
    const params = {
      claimApplyId: _this.data.claimApplyId,
      userId: wx.getStorageSync('userId') 
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header') ).then(res => {
      const resJson = res.data;
      if (resJson.ret == "0") {
        _this.setData({
          pageData: resJson
        });
      } else {
        wx.redirectTo({
          url: '../error/error?msg=' + resJson.msg
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
    });

  },
  //取消
  cancel: function(e) {
    const _this = this;
    wx.showModal({
      content: '你确定要取消么',
      confirmColor: "#3385ff",
      success(res) {
        if (res.confirm) {
          const url = app.globalData.baseUrl + 'apiClaim/claimCancel';
          const params = {
            claimApplyId: _this.data.claimApplyId,
            userId: wx.getStorageSync('userId')
          }
          wxRequest.postRequest(url, params, wx.getStorageSync('header')).then(res => {
            const resJson = res.data;
            if (resJson.ret == "0") {
              wx.redirectTo({
                url: '../home/home'
              });
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
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  goClaimStepThree:function(e){
    const _this = this;
    const url = app.globalData.baseUrl + 'apiClaim/claimStepThreePage';
    const params = {
      claimApplyId: _this.data.claimApplyId,
      userId: wx.getStorageSync('userId') 
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header') ).then(res => {
      const resJson = res.data;
      if (resJson.ret == "0") {
        app.globalData.policyStepThreeData = resJson;
        wx.redirectTo({
          url: '../claimStep/claimStepThree?claimApplyId=' + _this.data.claimApplyId
        });
      } else {
        wx.redirectTo({
          url: '../error/error?msg=' + resJson.msg
        });
      }
    }).catch(e => {
      console.log(e);
      wx.redirectTo({
        url: '../error/error?msg=请求错误'
      });
    }).finally(function (res) {
      console.log('finally~');
      wx.hideLoading();
    });
  }
})