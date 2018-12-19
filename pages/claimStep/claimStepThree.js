const wxRequest = require('../../wxTool/wxRequest.js');
const wxApi = require('../../wxTool/wxApi.js');
const app = getApp();
const animateTime = 200;
const util = require('../../utils/util.js');

const idCardCode = "1";
const bankCardCode = "2";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {},
    policyStepThreeData:{},
    claimApplyId: "",
    idCardName: "身份证",
    bankCardName: "银行卡",
    haveIdCard: false,
    haveBankCard: false,
    idCardShow: true,
    bankCardShow: true,
    idCardFont: null,
    idCardBack: null,
    bankCard: null,
    code2Num: {},
    code2Images: {},
    code2ImageUpload: {}


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this;
    wx.showLoading({
      mask: true
    })
    const url = app.globalData.baseUrl + 'apiClaim/claimStepThreePage';
    const params = {
      claimApplyId: _this.data.claimApplyId,
      userId: wx.getStorageSync('userId')
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header')).then(res => {
      const resJson = res.data;
      if (resJson.ret == "0") {
        _this.data.claimApplyId = options.claimApplyId;
        _this.data.policyStepThreeData = resJson;
        _this.data.pageData = JSON.parse(JSON.stringify(resJson));
        let noticeList = [];
        for (let idx in _this.data.pageData.noticeList) {
          let notice = _this.data.pageData.noticeList[idx];
          switch (notice.code) {
            case idCardCode:
              { //身份证
                _this.data.haveIdCard = (notice.isHave == "1" ? true : false);
                _this.data.idCardName = notice.name;
                _this.data.idCardShow = (notice.isHave == "1" ? false : true);
                break;
              }
            case bankCardCode:
              { //银行卡
                _this.data.haveIdCard = (notice.isHave == "1" ? true : false);
                _this.data.bankCardName = notice.name;
                _this.data.bankCardShow = (notice.isHave == "1" ? false : true);
                break;
              }
            default:
              {
                noticeList.push(notice);
                break;
              }
          }
        }
        _this.data.pageData.noticeList = noticeList;

        _this.setData({
          pageData: _this.data.pageData,
          idCardName: _this.data.idCardName,
          bankCardName: _this.data.bankCardName,
          haveIdCard: _this.data.haveIdCard,
          haveBankCard: _this.data.haveBankCard,
          idCardShow: _this.data.idCardShow,
          bankCardShow: _this.data.bankCardShow
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

   
  },
  //取消
  cancel: function(e) {
    const _this = this;
    wx.showModal({
      content: '你确定要取消么',
      confirmColor: "#3385ff",
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          });
          const url = app.globalData.baseUrl + 'apiClaim/claimCancel';
          const params = {
            claimApplyId: _this.data.claimApplyId,
            userId: wx.getStorageSync('userId')
          }
          wxRequest.postRequest(url, params, wx.getStorageSync('header')).then(res => {
            const resJson = res.data;
            if (resJson.ret == "0") {
              wx.redirectTo({
                url: '../index/index?type=old'
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
  //变更证件
  actionChange: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const type = dataset["type"];
    if (type == "idCard") {
      _this.setData({
        idCardShow: !_this.data.idCardShow
      })
    } else {
      _this.setData({
        bankCardShow: !_this.data.bankCardShow
      })
    }
  },
  //预览图片
  previewImage: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const url = dataset["url"];
    wx.previewImage({
      urls: [url]
    })
  },
  chooseImage: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const limit = dataset["limit"];
    const code = dataset["code"];
    const max = dataset["max"];
    const sign = dataset["sign"];
    let nowNum = (code in _this.data.code2Num ? _this.data.code2Num[code] : 0);
    let count = 1;
    if (limit == "true") {
      count = 1;
    } else {
      count = (Number(max) - Number(nowNum) > 9 ? 9 : Number(max) - Number(nowNum));
    }

    if (count == 0) {
      wx.showToast({
        title: "该类别上传张数超限",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    wx.showLoading({
      mask: true
    });
    wx.chooseImage({
      count: count,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        let images = res.tempFilePaths
        if (images.length > count) {
          images.splic(count, images.length - count);
        }
        switch (code) {
          case idCardCode:
            {
              if (!(idCardCode in _this.data.code2Images)) {
                _this.data.code2Images[idCardCode] = [];
              }
              if (sign == "idCardFront") {
                _this.data.code2Images[idCardCode][0] = images[0];
              } else {
                _this.data.code2Images[idCardCode][1] = images[0];
              }
              break;
            }
          case bankCardCode:
            {
              if (!(bankCardCode in _this.data.code2Images)) {
                _this.data.code2Images[bankCardCode] = [];
              }
              _this.data.code2Images[bankCardCode][0] = images[0];
              break;
            }
          default:
            {
              if (!(code in _this.data.code2Images)) {
                _this.data.code2Images[code] = [];
              }
              for (let idx in images) {
                _this.data.code2Images[code].push(images[idx]);
              }
              let i = dataset["idx"];
              _this.data.pageData.noticeList[i]["code2Images"] = _this.data.code2Images[code];
              break;
            }
        }
        _this.data.code2Num[code] = nowNum + images.length;
        _this.setData({
          pageData: _this.data.pageData,
          code2Images: _this.data.code2Images
        });
        //上传图片到服务器
        for (let idx in images) {
          wx.uploadFile({
            url: app.globalData.baseUrl + 'apiUpload/uploadImgByWxminiprogram',
            filePath: images[idx],
            name: 'image',
            header: {
              "Content-Type": "multipart/form-data"
            },
            formData: {
              path: images[idx],
              claimApplyId: _this.data.claimApplyId,
              userId: wx.getStorageSync('userId') 
            },
            success(res) {
              const resJson = JSON.parse(res.data);
              if (resJson.ret == "0") {
                if (!(code in _this.data.code2ImageUpload)) {
                  _this.data.code2ImageUpload[code] = {};
                }
                _this.data.code2ImageUpload[code][resJson.path] = true;
              }
            },
            fail(e) {
              console.log("上传失败", e);
            }
          })
        }
      },
      fail(e) {
        console.log(e);
        wx.showToast({
          title: "选择图片失败",
          icon: "none",
          duration: 2000
        });
      },
      complete() {
        wx.hideLoading();
      }
    })

  },
  delImage: function(e) {
    const _this = this;
    const dataset = e.currentTarget.dataset;
    const url = dataset["url"];
    const code = dataset["code"];
    switch (code) {
      case idCardCode:
        {
          for (let idx in _this.data.code2Images[idCardCode]) {
            if (_this.data.code2Images[idCardCode][idx] == url) {
              _this.data.code2Images[idCardCode][idx] = undefined;
            }
          }
          break;
        }
      case bankCardCode:
        {
          _this.data.code2Images[bankCardCode][0] = undefined;
          break;
        }
      default:
        {
          for (let idx in _this.data.code2Images[code]) {
            if (_this.data.code2Images[code][idx] == url) {
              _this.data.code2Images[code].splice(idx, 1);
              break;
            }
          }
          let i = dataset["idx"];
          _this.data.pageData.noticeList[i]["code2Images"] = _this.data.code2Images[code];
          break;
        }
    }
    _this.data.code2Num[code]--;
    _this.setData({
      pageData: _this.data.pageData,
      code2Images: _this.data.code2Images
    })
  },
  claimStepThreePageSubmit: function(e) {
    wx.showLoading({
      mask: true
    });
    const _this = this;
    let noticeList = _this.data.policyStepThreeData.noticeList;
    let errorStr = "";
    let canSubmit = true;
    let code2Name = {};
    for (let idx in noticeList) {
      let notice = noticeList[idx];
      let code = notice.code;
      let min = Number(notice.min);
      let max = Number(notice.max);
      let name = notice.name;
      let isHave = (notice.isHave == "1" ? true : false);
      let num = (code in _this.data.code2Num ? Number(_this.data.code2Num[code]) : 0);
      let tempStr = "";
      code2Name[code] = name;
      if ((code == idCardCode || code == bankCardCode) && num != 0) {
        isHave = false;
      }
      if (num < min) {
        tempStr = name + "的数量不得小于" + min + "张,"
      } else if (num > max) {
        tempStr = name + "的数量不得大于" + max + "张,"
      }
      if (!isHave && tempStr != "") {
        errorStr += tempStr;
        canSubmit = false;
      }
    }
    if (!canSubmit) {
      wx.hideLoading();
      wx.showToast({
        title: errorStr.substring(0, errorStr.length - 1),
        icon: "none",
        duration: 2000
      });
      return false;
    }
    let claimAttachList = [];
    let attachNum = 0;
    // 接下来 判断 所需图片是否上传完成
    for (let code in _this.data.code2Images) {
      let tempStr = code2Name[code] + "中，";
      let need = false;
      for (let idx in _this.data.code2Images[code]) {
        const path = _this.data.code2Images[code][idx];
        if (!(code in _this.data.code2ImageUpload) || !(path in _this.data.code2ImageUpload[code])) {
          tempStr += "第" + idx + "张,";
          need = true;
        }
      }
      if (need) {
        tempStr = tempStr.substring(0, tempStr.length - 1) + "未上传成功，";
        errorStr += tempStr;
        canSubmit = false;
      } else {
        claimAttachList.push({
          "code": code,
          imgBase64: _this.data.code2Images[code]
        });
        attachNum += _this.data.code2Images[code].length;
        continue;
      }
    }
    if (!canSubmit) {
      wx.hideLoading();
      wx.showToast({
        title: errorStr.substring(0, errorStr.length - 1) + "请重新上传",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    //真正的提交逻辑
    const url = app.globalData.baseUrl + 'apiClaim/claimStepThreePageSubmit';
    const params = {
      claimAttachList: JSON.stringify(claimAttachList),
      attachNum: attachNum,
      claimApplyId: _this.data.claimApplyId,
      userId: wx.getStorageSync('userId') 
    }
    wxRequest.postRequest(url, params, wx.getStorageSync('header') ).then(res => {
      const resJson = res.data;
      if(resJson.ret == "0"){
        wx.redirectTo({
          url: '../claimStep/claimStepFour'
        });
      }else{
        wx.showToast({
          title: resJson.msg,
          icon: "none",
          duration: 2000
        });
      }
    }).catch(e => {
      console.log(e);
      wx.showToast({
        title: "系统异常，请稍后再试",
        icon: "none",
        duration: 2000
      });
    }).finally(function(res) {
      console.log('finally~');
      wx.hideLoading();
    });

  }
})