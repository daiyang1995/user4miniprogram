const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [], //放置返回数据的数组
    dataId: 0,
    noData: false,
    page: {
      "0": {
        globelData: [],
        pageNum: 1,
        show: false,
        complete: false
      },
      "1": {
        globelData: [],
        pageNum: 1,
        show: false,
        complete: false
      },
      "2": {
        globelData: [],
        pageNum: 1,
        show: false,
        complete: false
      },
      "3": {
        globelData: [],
        pageNum: 1,
        show: false,
        complete: false
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    //初始化
    const dataId = "0";
    _this.resetValue();
    _this.searchSubmit(dataId);

  },
  /**
   * 重新赋值
   */
  resetValue: function() {
    const _this = this;
    _this.data.noData = false;
    for (let key in _this.data.page) {
      _this.data.page[key].show = false;
    }
  },
  /**
   * 点击切换
   */
  search: function(e) {
    const dataset = e.currentTarget.dataset;
    const dataId = dataset["id"];
    this.resetValue();
    this.searchSubmit(dataId);
  },
  /**
   * 上拉加载
   */
  searchScroll: function(e) {
    const dataset = e.currentTarget.dataset;
    const dataId = dataset["id"];
    this.resetValue();
    this.searchSubmit(dataId);
  },
  /**
   * 查询
   */
  searchSubmit: function(dataId) {
    const _this = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    _this.data.page[dataId].show = true;
    if (_this.data.page[dataId].pageNum == 0) {
      _this.setData({
        dataId: dataId,
        noData: true,
        page: _this.data.page
      });
    } else if (_this.data.page[dataId].complete) {
      _this.setData({
        dataId: dataId,
        page: _this.data.page,
        noData: false,
        dataList: _this.data.page[dataId].globelData
      });
      wx.showToast({
        title: '没有更多了',
        icon: "none",
        duration: 2000
      });
      return false;
    }
    const url = app.globalData.baseUrl + 'apiIndex/getPolicyDataList';
    const params = {
      pageNum: _this.data.page[dataId].pageNum,
      relation: dataId,
      userId: wx.getStorageSync("userId")
    }
    wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
      const resJson = res.data;
      console.log(resJson);
      if (resJson.ret == "0") {
        if (resJson.page.isLastPage == true) {
          if (_this.data.page[dataId].pageNum == 1 && resJson.page.list.length == 0) {
            _this.data.page[dataId].pageNum = 0;
            _this.data.page[dataId].pageNum.complete = true;
            _this.setData({
              dataId: dataId,
              page: _this.data.page,
              noData: true,
              dataList: _this.data.page[dataId].globelData
            });
            return false;
          }
          _this.data.page[dataId].complete = true;
        }
        if (_this.data.page[dataId].pageNum != 0) {
          _this.data.page[dataId].pageNum++; //将页码加1
          for (let idx in resJson.page.list) {
            let obj = resJson.page.list[idx];
            switch (obj.policyStatus.toString()) {
              case "0":
                {
                  obj.color = "orange";
                  break;
                }
              case "1":
                {
                  obj.color = "blue";
                  break;
                }
              case "-1":
                {
                  obj.color = "gray";
                  break;
                }
              default:
                {
                  obj.color = "gray";
                  console.log("数据异常");
                }
            }
            _this.data.page[dataId].globelData.push(obj);
          }
          _this.setData({
            dataId: dataId,
            page: _this.data.page,
            noData: false,
            dataList: _this.data.page[dataId].globelData
          })
        }

      } else if (resJson.ret == "-1") {
        wx.showToast({
          title: resJson.msg,
          icon: "none",
          duration: 2000
        });
      } else {
        wx.showToast({
          title: '请求出错',
          icon: "none",
          duration: 2000
        });
      }

    }).catch(e => {
      console.log(e);
      _this.data.page[dataId].searchLoading = false;
      wx.redirectTo({
        url: '../error/error?msg=请求错误'
      });
    }).finally(function(res) {
      console.log('finally~');
      _this.data.page[dataId].searchLoading = false;
      wx.hideLoading();
    })
  },
  /**
   * 方案详情
   */
  goPolicyDetailPage: function(e) {
    wx.showLoading({
      title: '请求中',
      mask: true
    });
    const dataset = e.currentTarget.dataset;
    const policyId = dataset["id"];

    const url = app.globalData.baseUrl + 'apiIndex/policyDetailPage';
    const params = {
      policyId: policyId,
      userId: wx.getStorageSync("userId")
    }
    wxRequest.postRequest(url, params, wx.getStorageSync("header")).then(res => {
      const resJson = res.data;
      console.log(resJson);
      if (resJson.ret == "0") {
        wx.setStorageSync("policyDetail", resJson);
        wx.redirectTo({
          url: '../policyDetail/policyDetail?policyId=' + policyId
        });
      } else if (resJson.ret == "-99") { //直接去提交影像件
        wx.redirectTo({
          url: '../claimStep/claimStepTwo?claimApplyId=' + resJson.claimApplyId
        });
      } else if (resJson.ret == "-1") {
        wx.showToast({
          title: resJson.msg,
          icon: "none",
          duration: 2000
        });
      } else {
        wx.showToast({
          title: '请求出错',
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
  goClaimPage: function(e) {
    wx.redirectTo({
      url: '../claimPage/claimPage'
    });
  }
})