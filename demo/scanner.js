/**
 * 敏感数据过滤模块
 * 这个模块必须由后端开发人员来写
 * 传入给 JBDAP 模块的 manipulate 函数当参数使用
 */

if (!global.NiceError) require('../src/global')

/**
 * 对查询得到的数据进行敏感字段过滤后返回
 * @param {object} user 当前用户信息
 * @param {object} cmd 要执行的指令类型
 * @param {object} fields 解析后的字段
 * @param {array|object} data 查询到的结果
 */
function scan(user,cmd,fields,data) {
    // 这里根据 cmd.type 和 被请求的字段，结合 user 信息对 data 进行敏感数据过滤
    // 只有 entity、list、values(clone操作) 类型的查询需要进行此操作
    // TODO:
    return data
}

module.exports = scan