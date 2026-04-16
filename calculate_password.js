const crypto = require('crypto');
const key = 'SD123ui_sd$@';
const content = '123456';
const str = `password=${content}&key=${key}`;
const md5 = crypto.createHash('md5');
console.log(md5.update(str).digest('hex'));
