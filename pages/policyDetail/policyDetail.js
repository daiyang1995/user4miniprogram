const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {},
    policyDetail:{},
    className: "ui-grid-a",
    policyId: "",
    tel: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    _this.data.policyId = options.policyId;
    _this.data.policyDetail = wx.getStorageSync("policyDetail");
    _this.data.policyDetail.planInfo = JSON.parse( _this.data.policyDetail.planInfo);

    let i = Object.keys(_this.data.policyDetail.coverageInfo).length;
    if (i < 2) {
      i = 2;
    }
    const className = "ui-grid-" + String.fromCharCode("a".charCodeAt() + (i - 2));
    let baseCode = "a".charCodeAt();
    for (let key in _this.data.policyDetail.coverageInfo) {
      let json = {
        "nowMoney": 0,
        "money": _this.data.policyDetail.coverageInfo[key],
        "className": "ui-block-" + String.fromCharCode(baseCode++)
      };
      _this.data.policyDetail.coverageInfo[key] = json;
    }

    _this.setData({
      pageData: _this.data.policyDetail,
      className: className,
      tel: wx.getStorageSync("tel")
    });
    //预计变化30次
    const coverageInfoJson = _this.data.policyDetail.coverageInfo;
    let intervalArray = [];
    i = 0
    for (let key in coverageInfoJson) {
      _this.data.policyDetail.coverageInfo[key].innerI = i++;
      var interval = setInterval(function() {
        const innerI = Number(_this.data.policyDetail.coverageInfo[key].innerI);
        let money = Number(_this.data.policyDetail.coverageInfo[key].money);
        let nowMoney = Number(_this.data.policyDetail.coverageInfo[key].nowMoney);
        const time = 1000 / 30;
        const oneMoney = Number(money) / time;
        nowMoney += oneMoney;
        if ((money + "").indexOf(".") > -1) {
          nowMoney = Number(nowMoney).toFixed(2);
        }
        if (nowMoney > Number(money)) {
          nowMoney = money;
          clearInterval(intervalArray[innerI]);
        }
        _this.data.policyDetail.coverageInfo[key] = {
          "innerI": innerI,
          "nowMoney": nowMoney,
          "money": money,
          "className": _this.data.policyDetail.coverageInfo[key].className
        };
        _this.setData({
          pageData: _this.data.policyDetail
        });
      }, 30);
      intervalArray.push(interval);
    }

  },
  claimStepOnePage: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const settlementTypeStr = dataset["key"];
    wx.redirectTo({
      url: '../claimStep/claimStepOne?policyId=' + _this.data.policyId + "&settlementTypeStr="+settlementTypeStr
    });
  },
  call: function(e) {
    const dataset = e.currentTarget.dataset;
    const tel = dataset["tel"];
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  backHomePage: function(e) {
    wx.redirectTo({
      url: '../home/home'
    });
  }
})