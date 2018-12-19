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
    settlementTypeStr: "",
    policyStepOneData: {},
    homePageAnimation: {},
    pageTwoAnimation: {},
    pageThreeAnimation: {},
    treatDepartmentStr: "请选择",
    hospitalName: "请选择",
    treatDate: "请选择",
    hospitalList: [],
    treatMoney: "",
    mobile: "",
    policyId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    _this.data.policyId = options.policyId;
    _this.data.settlementTypeStr = options.settlementTypeStr;
    wx.showLoading({
      mask: true
    });

    const url = app.globalData.baseUrl + 'apiClaim/claimStepOnePage';
    const params = {
      policyId: _this.data.policyId,
      settlementTypeStr: _this.data.settlementTypeStr,
      userId: wx.getStorageSync("userId")
    }
    wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
      const resJson = res.data;
      if (resJson.ret == "0") {
        _this.data.policyStepOneData = resJson;
        let mobile = "mobile" in resJson ? resJson.mobile : "";
        _this.setData({
          pageData: resJson,
          mobile: mobile
        });
      } else {
        wx.redirectTo({
          url: '../error/error?resJson.msg'
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
  //页面展示点击事件
  pageShow: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const page = dataset["page"];
    _this.pageShowFunction(page);
  },
  //页面展示方法
  pageShowFunction: function(page) {
    const _this = this;
    // Animation
    wx.showLoading({
      mask: true
    });
    let homePageAnimation = wx.createAnimation({
      duration: animateTime,
      timingFunction: 'ease',
    });
    homePageAnimation.left("-100%").step();
    if (page == "pageTwo") {
      let pageTwoAnimation = wx.createAnimation({
        duration: animateTime,
        timingFunction: 'ease',
      });
      pageTwoAnimation.left("0%").step();
      _this.setData({
        homePageAnimation: homePageAnimation.export(),
        pageTwoAnimation: pageTwoAnimation.export()
      });
    } else {
      let pageThreeAnimation = wx.createAnimation({
        duration: animateTime,
        timingFunction: 'ease',
      });
      pageThreeAnimation.left("0%").step();
      _this.setData({
        homePageAnimation: homePageAnimation.export(),
        pageThreeAnimation: pageThreeAnimation.export()
      });
    }
    wx.hideLoading();
  },
  //页面隐藏 点击事件
  pageHide: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const page = dataset["page"];
    _this.pageHideFunction(page);
  },
  //页面隐藏方法
  pageHideFunction: function(page) {
    const _this = this;
    // Animation
    wx.showLoading({
      mask: true
    });
    let homePageAnimation = wx.createAnimation({
      duration: animateTime,
      timingFunction: 'ease',
    });
    homePageAnimation.left("0%").step();
    if (page == "pageTwo") {
      let pageTwoAnimation = wx.createAnimation({
        duration: animateTime,
        timingFunction: 'ease',
      });
      pageTwoAnimation.left("100%").step();
      _this.setData({
        homePageAnimation: homePageAnimation.export(),
        pageTwoAnimation: pageTwoAnimation.export()
      });
    } else {
      let pageThreeAnimation = wx.createAnimation({
        duration: animateTime,
        timingFunction: 'ease',
      });
      pageThreeAnimation.left("100%").step();
      _this.setData({
        homePageAnimation: homePageAnimation.export(),
        pageThreeAnimation: pageThreeAnimation.export()
      });
    }
    wx.hideLoading();
  },
  //选择一个诊室
  choseTreatDepartment: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const value = dataset["value"];
    _this.setData({
      treatDepartmentStr: value
    });
    _this.pageHideFunction("pageThree");
  },
  //选择一个医院
  choseHospitalName: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const value = dataset["value"];
    _this.setData({
      hospitalName: value
    });
    _this.pageHideFunction("pageTwo");
  },
  //查询医院
  searchHospital: function(e) {
    const _this = this;
    let value = e.detail.value;
    if (value.length > 3) {
      wx.showLoading({
        title: "查询中",
        mask: true
      });
      const url = app.globalData.baseUrl + 'apiClaim/getHospitalList';
      const params = {
        hospitalInfo: value,
        userId: wx.getStorageSync("userId")
      }
      wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
        const resJson = res.data;
        if (resJson.ret == "0") {
          _this.setData({
            hospitalList: resJson.hospitalList
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
    }
  },
  bindDateChange: function(e) {
    let value = e.detail.value;
    this.setData({
      treatDate: value
    })
  },
  bindTreatMoney: function(e) {
    const _this = this;
    let value = e.detail.value;
    _this.data.treatMoney = value;
  },
  bindMobile: function(e) {
    const _this = this;
    let value = e.detail.value;
    _this.data.mobile = value;
  },
  claimStepOnePageSubmit: function(e) {
    const _this = this;
    if (!util.checkMobile(_this.data.mobile)) {
      wx.showToast({
        title: '手机号码有误',
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (_this.data.treatDate == "请选择") {
      wx.showToast({
        title: '请选择就诊日期',
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (!util.checkMoney(_this.data.treatMoney)) {
      wx.showToast({
        title: '请输入正确的就诊费用',
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (_this.data.hospitalName == "请选择") {
      wx.showToast({
        title: '请选择就诊医院',
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (_this.data.treatDepartmentStr == "请选择") {
      wx.showToast({
        title: '请选择就诊诊室',
        duration: 2000,
        icon: 'none'
      });
      return false;
    }


    wx.showLoading({
      title: "查询中",
      mask: true
    });
    const url = app.globalData.baseUrl + 'apiClaim/claimStepOnePageSubmit';
    const params = {
      policyId: _this.data.policyId,
      settlementTypeStr: _this.data.policyStepOneData.settlementTypeStr,
      mobile: _this.data.mobile,
      treatHospitalName: _this.data.hospitalName,
      treatDate: _this.data.treatDate,
      treatMoney: _this.data.treatMoney,
      treatDepartment: _this.data.treatDepartmentStr,
      userId: wx.getStorageSync('userId')
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header')).then(res => {
      const resJson = res.data;
      if (resJson.ret == "0") {
        wx.redirectTo({
          url: '../claimStep/claimStepTwo?claimApplyId=' + resJson.claimApplyId
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
  }

})