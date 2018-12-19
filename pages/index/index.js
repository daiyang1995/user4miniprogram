const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();

const jumpDelay = 1000 * 5 ; //10S
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    welcomeImg:"http://wx-test.melktech.com/user/images/bindingBanner.png"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    //1.获取code
    const wxLogin = wxApi.wxLogin()
    wxLogin().then(res => {
      const url = app.globalData.baseUrl + 'apiOther/getOpenId';
      const params = {
        code: res.code
      }
      //2.获取openid
      return wxRequest.postRequest(url, params);
    }).then(res => {
      //记录header
      wx.setStorageSync('header', {"Cookie": "JSESSIONID=" + res.data.sessionId});
      wx.setStorageSync('openId', res.data.openId);
      const url = app.globalData.baseUrl + 'apiOauth/checkUserExist';
      const params = {
        openId: res.data.openId,
        channel: app.globalData.channel,
        state: app.globalData.state
      }
      //3.校验用户是否存在
      return wxRequest.postRequest(url, params, wx.getStorageSync("header"));
    }).then(res => {
      const resJson = res.data;
      wx.setStorageSync('banner', "banner" in resJson ? resJson["banner"] : app.globalData.banner );
      wx.setStorageSync('tel', "tel" in resJson ? resJson["tel"] : app.globalData.tel);
      const welcomeImg  = ("loadingUrl" in resJson && resJson["loadingUrl"] != "") ? resJson["loadingUrl"] : _this.data.welcomeImg;
      wx.setStorageSync('welcomeImg', welcomeImg);
      if (resJson.ret == "0") {
        wx.setStorageSync('userId', resJson.userId);
        _this.setData({
          show:true,
          welcomeImg: welcomeImg
        });
        setTimeout(function() {
          _this.goHomePage();
        }, jumpDelay);
      } else {
        wx.redirectTo({
          url: '../binding/binding'
        });
        jump = true;
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
  goHomePage: function(e) {
    wx.redirectTo({
      url: '../home/home'
    });
  }

})