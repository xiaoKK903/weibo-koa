const crypto = require('crypto');

function _md5(content) {
  const md5 = crypto.createHash('md5');
  return md5.update(content).digest('hex');
}

function doCrypto(content) {
  const str = `password=${content}&key=SD123ui_sd$@`;
  return _md5(str);
}

console.log('123456 的加密值:', doCrypto('123456'));