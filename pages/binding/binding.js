const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const util = require('../../utils/util.js');
const app = getApp();

let canSubmit = false;
let sendCodeCD = false;
const intervalTime = 60;
let sendCodeInterVal;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    banner: "",
    tel: "",
    sendCode: "获取验证码",
    mobile: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    _this.setData({
      banner: wx.getStorageSync("banner"),
      tel: wx.getStorageSync("tel")
    })
  },
  call: function(e) {
    const dataset = e.currentTarget.dataset;
    const tel = dataset["tel"];
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  getMobile: function(e) {
    const _this = this;
    _this.mobile = e.detail.value;
  },
  sendCode: function(e) {
    const _this = this;
    if (sendCodeCD) {
      return false;
    } else {
      sendCodeCD = true;
    }
    wx.showLoading({
      mask: true
    })
    if (!util.checkMobile(_this.mobile)) {
      wx.showToast({
        title: '手机号码有误',
        duration: 2000,
        icon: 'none'
      });
      sendCodeCD = false;
      wx.hideLoading();
      return false;
    }
    let timeTemp = intervalTime;
  
    sendCodeInterVal = setInterval(function (e) {
      timeTemp--;
      _this.setData({
        sendCode: timeTemp
      })
      if (timeTemp < 0) {
        clearInterval(sendCodeInterVal);
        sendCodeCD = false;
        _this.setData({
          sendCode: "获取验证码"
        })
      }
    }, 1000);
    const url = app.globalData.baseUrl + 'apiOther/sendCaptcha';
    const params = {
      telPhoneNubmer: _this.mobile
    }
    wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
      const msg = "msg" in res.data ? res.data.msg : "失败";
      console.log(res);
      wx.showToast({
        title: msg,
        duration: 2000,
        icon: 'none'
      });
      if(res.data.ret == "0"){
        canSubmit = true;
      }
    }).catch(e => {
      console.log(e);
      wx.showToast({
        title: '发送失败，系统错误',
        duration: 2000,
        icon: 'none'
      });
    }).finally(function(res) {
      console.log('finally~');
      wx.hideLoading();
    })
  },
  formSubmit: function(e) {
    wx.showLoading({
      title: '登陆中',
      mask: true
    });
    if (!canSubmit) {
      wx.hideLoading();
      wx.showToast({
        title: '请先发送验证码',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }
    const idNum = e.detail.value.idNum;
    const mobile = e.detail.value.mobile;
    const identifyingCode = e.detail.value.identifyingCode;
    if (idNum.length > 20) {
      wx.hideLoading();
      wx.showToast({
        title: "身份证号码长度不能超过20位",
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (!util.checkMobile(mobile)) {
      wx.hideLoading();
      wx.showToast({
        title: "手机号不合法",
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (!util.checkIdentifyingCode(identifyingCode)) {
      wx.hideLoading();
      wx.showToast({
        title: "验证码不合法",
        duration: 2000,
        icon: 'none'
      });
      return false;
    }
    const url = app.globalData.baseUrl + 'apiOauth/binding';
    const params = {
      idNum: idNum,
      mobile: mobile,
      identifyingCode: identifyingCode,
      channel: app.globalData.channel,
      openId: wx.getStorageSync("openId")
    }
    wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
      const msg = "msg" in res.data ? res.data.msg : "失败";
      if (res.data.ret == "0") {
        wx.redirectTo({
          url: '../home/home'
        });
      }else{
        wx.showToast({
          title: msg,
          duration: 2000,
          icon: 'none'
        });
      }
    }).catch(e => {
      console.log(e);
      wx.showToast({
        title: '系统异常，请联系管理员',
        duration: 2000,
        icon: 'none'
      });
    }).finally(function (res) {
      console.log('finally~');
      wx.hideLoading();
    })
  }
})