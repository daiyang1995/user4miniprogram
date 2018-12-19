const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    noData: false,
    dataList: [],
    pageNum: 1,
    show: false,
    complete: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.searchSubmit();
  },
  /**
   * 上拉加载
   */
  searchScroll: function(e) {
    this.searchSubmit();
  },
  /**
   * 查询
   */
  searchSubmit: function(dataId) {
    const _this = this;
    if (_this.data.complete == true) {
      wx.showToast({
        title: '没有更多了',
        icon: "none",
        duration: 2000
      });
      return false;
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    });

    const url = app.globalData.baseUrl + 'apiIndex/getClaimDataList';
    const params = {
      pageNum: _this.data.pageNum,
      userId: wx.getStorageSync('userId')  
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header') ).then(res => {
      const resJson = res.data;
      console.log(resJson);
      if (resJson.ret == "0") {
        if (resJson.page.isLastPage == true) {
          _this.data.complete = true;
          if (_this.data.pageNum == 1 && resJson.page.list.length == 0) {
            _this.setData({
              noData: true
            });
            return false;
          }
        }
        _this.data.pageNum++; //将页码加1
        for (let idx in resJson.page.list) {
          let obj = resJson.page.list[idx];
          switch (obj.status.toString()) {
            case "10":
              {
                obj.color = "orange";
                break;
              }
            case "100":
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
          _this.data.dataList.push(obj);
        }
        _this.setData({
          noData: false,
          dataList: _this.data.dataList
        })

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
      wx.showToast({
        title: '系统异常，请联系管理员',
        icon: "none",
        duration: 2000
      });
    }).finally(function(res) {
      console.log('finally~');
      wx.hideLoading();
    })
  },
  claimDetailPage:function(e){
    wx.redirectTo({
      url: '../claimPage/claimDetail?claimApplyId=' + e.currentTarget.dataset["id"]
    });
  },
  backHomePage: function(e) {
    wx.redirectTo({
      url: '../home/home'
    });
  }

})