const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    auditStatus: 1,
    claimApplyId: "",
    pageData: {},
    urls:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    _this.data.auditStatus = options.auditStatus;
    _this.data.claimApplyId = options.claimApplyId;
    wx.showLoading({
      mask: true
    })
    const url = app.globalData.baseUrl + 'apiIndex/claimAttachPage';
    const params = {
      auditStatus: _this.data.auditStatus,
      claimApplyId: _this.data.claimApplyId,
      userId: wx.getStorageSync("userId")
    }
    wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
      const resJson = res.data;
      console.log(resJson);
      if (resJson.ret == "0") {
        let urls = [];
        for (let idx in resJson.claimAttachList){
          urls.push(resJson.claimAttachList[idx]["url"]);
        }
        _this.data.urls = urls;
        _this.setData({
          auditStatus: _this.data.auditStatus,
          claimApplyId: _this.data.claimApplyId,
          pageData: resJson
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
    }).finally(function (res) {
      console.log('finally~');
      wx.hideLoading();
    })
  },
  claimAttachValidPage: function (e) {
    const _this = this;
    wx.redirectTo({
      url: '../claimPage/claimAttach?auditStatus=1&claimApplyId=' + _this.data.claimApplyId
    });
  },
  claimAttachInvalidPage: function (e) {
    const _this = this;
    wx.redirectTo({
      url: '../claimPage/claimAttach?auditStatus=0&claimApplyId=' + _this.data.claimApplyId
    });
  },
  //预览图片
  previewImage: function (e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const url = dataset["url"];
    wx.previewImage({
      urls: _this.data.urls,
      current: url
    })
  },
  back: function(e) {
    const _this = this;
    wx.redirectTo({
      url: '../claimPage/claimDetail?claimApplyId=' + _this.data.claimApplyId
    });
  }

})