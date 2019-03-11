/**
 * 常用加密模块
 */

const crypto = require('crypto');

module.exports.sha256 = function(content){
    let sha256 = crypto.createHash('sha256');
    sha256.update(content);
    return sha256.digest('hex');
};

module.exports.md5 = function(content){
    let md5 = crypto.createHash('sha256');
    md5.update(content);
    return md5.digest('hex');
};