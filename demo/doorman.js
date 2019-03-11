/**
 * 数据访问权限校验模块
 * 这个模块必须由后端开发人员来写
 * 传入给 JBDAP 模块的 manipulate 函数当参数使用
 */

if (!global.NiceError) require('../src/global')

/**
 * 检查当前用户是否拥有执行该操作的权限
 * @param {object} user 当前用户信息
 * @param {object} cmd 要执行的指令
 */
function check(user,cmd) {
    // 这里根据 cmd 的类型和参数结合 user 信息进行判断
    // TODO:
    return true
}

module.exports = check