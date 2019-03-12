/**
 * 用户身份识别模块
 * 这个模块必须由后端开发人员来写
 * 传入给 JBDAP 模块的 manipulate 函数当参数使用
 */

if (!global.NiceError) require('../lib/global')

/**
 * 根据前端传递来的 security 对象来识别用户身份，保存成一个对象返回
 * 返回的这个对象将会在 doorman 和 scanner 两个函数中用到
 * @param {object} security 前端传递过来的 security 对象
 */
async function recognize(security) {
    // 这里根据 cmd 的类型和参数结合 user 信息进行判断
    let user = {}
    // TODO：
    // 
    return user
}

module.exports = recognize