const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function checkMobile(mobile) {
  const mobileCheck = /^1[3456789][0-9]\d{8}$/;
  return (mobileCheck.test(mobile));
}

function checkIdentifyingCode(identifyingCode) {
  const identifyingCodeCheck = /^\d+$/; /* 非负整数*/
  return (identifyingCodeCheck.test(identifyingCode));
}
function checkMoney(money){
  const moneyCheck = /^[0-9]+([.]{1}[0-9]{1,2})?$/; 
  return (moneyCheck.test(money));
}

function checkEamil(email) {
  const emailCheck = /^([a-zA-Z0-9]){1}[a-zA-Z0-9_\.-]*([a-zA-Z0-9])@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){0,10}(.com|.cn|.net|.org)$/;
  return (emailCheck.test(email));
}

module.exports = {
  formatTime: formatTime,
  checkMobile: checkMobile,
  checkIdentifyingCode: checkIdentifyingCode,
  checkEamil: checkEamil,
  checkMoney: checkMoney
}
