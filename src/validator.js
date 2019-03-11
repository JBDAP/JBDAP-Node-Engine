/**
 * 验证器，用于 JBDAP 处理过程中的参数合法性验证
 */

// 引入开发糖
if (!global.NiceError) require('./global')

/**
 * 检查 JBDAP 描述 json 是否合法
 * @param {object} json 完整的 JBDAP 描述 json
 */
function checkJson(json){
    // 参数可用性检查
    if (Object.prototype.toString.call(json) !== '[object Object]') $throwError('传入的参数必须是 Object 类型',null,{},'ParamTypeError')
    // json 属性可用性检查
    if (!_.isUndefined(json.token) && !_.isString(json.token)) $throwError('属性 [token] 必须是 String 类型',null,{},'PropTypeError')
    if (json.token === '') $throwError('属性 [token] 不可以为空字符串',null,{},'PropValueError')
    if (!_.isUndefined(json.withLogs) && !_.isBoolean(json.withLogs)) $throwError('属性 [withLogs] 必须是 Boolean 类型',null,{},'PropTypeError')
    if (!_.isUndefined(json.isTransaction) && !_.isBoolean(json.isTransaction)) $throwError('属性 [isTransaction] 必须是 Boolean 类型',null,{},'PropTypeError')
    // commands
    if (_.isUndefined(json.commands)) $throwError('属性 [commands] 必须要配置',null,{},'PropMissingError')
    if (!_.isArray(json.commands) && Object.prototype.toString.call(json.commands) !== '[object Object]') $throwError('属性 [commands] 必须是 Array 或者 Object 类型',null,{},'PropTypeError')
    if (_.isArray(json.commands) && json.commands.length === 0) $throwError('属性 [commands] 最少要包含一个命令',null,{},'PropValueError')
    return true
}
module.exports.checkJson = checkJson

/**
 * 检查单个命令是否合法
 * @param {object} cmd 单个命令
 */
function checkCommand(cmd) {
    // 参数可用性检查
    if (Object.prototype.toString.call(cmd) !== '[object Object]') $throwError('传入的 command 参数必须是 Object 类型',null,{},'ParamTypeError')
    // 属性可用性检查
    let key = 'name'
    if (_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 必须要配置',null,{},'PropMissingError')
    if (!_.isString(cmd[key])) $throwError('属性 [' + key + '] 必须是 String 类型',null,{},'PropTypeError')
    if (cmd[key] === '') $throwError('属性 [' + key + '] 不能为空',null,{},'PropValueError')
    key = 'type'
    if (_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 必须要配置',null,{},'PropMissingError')
    if (!_.isString(cmd[key])) $throwError('属性 [' + key + '] 必须是 String 类型',null,{},'PropTypeError')
    let validCmds = [
        'entity',
        'list',
        'values',
        'create',
        'update',
        'delete',
        'increase',
        'decrease'
    ]
    if (validCmds.indexOf(cmd[key]) < 0) $throwError('属性 [' + key + '] 的值 "' + cmd[key] + '" 不正确',null,{},'PropValueError')
    key = 'target'
    if (_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 必须要配置',null,{},'PropMissingError')
    if (!_.isString(cmd[key])) $throwError('属性 [' + key + '] 必须是 String 类型',null,{},'PropTypeError')
    if (cmd[key] === '') $throwError('属性 [' + key + '] 不能为空',null,{},'PropValueError')
    key = 'onlyIf'
    if (!_.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('属性 [' + key + '] 必须是 Object 类型',null,{},'PropTypeError')
    key = 'after'
    if (!_.isUndefined(cmd[key]) && !_.isArray(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('属性 [' + key + '] 必须是 Object 或 Array 类型',null,{},'PropTypeError')
    // 
    // 根据 command 类型检查其它字段
    if (cmd.type === 'entity' || cmd.type === 'list' || cmd.type === 'values') {
        // 查询命令
        key = 'query'
        if (!_.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('属性 [' + key + '] 必须是 Object 类型',null,{},'PropTypeError')
        key = 'fields'
        if (!_.isUndefined(cmd[key]) && !_.isArray(cmd[key]) && !_.isString(cmd[key])) $throwError('属性 [' + key + '] 必须是 String 或者 Array 类型',null,{},'PropTypeError')
        if (_.isArray(cmd[key]) && cmd[key].length === 0) $throwError('属性 [' + key + '] 最少要包含一个字段',null,{},'PropValueError')    
        if (_.isString(cmd[key]) && cmd[key] === '') $throwError('属性 [' + key + '] 不能为空字符',null,{},'PropValueError')    
        key = 'data'
        if (!_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 不应该出现在查询指令中',null,{},'PropSpilthError')
    }
    if (cmd.type === 'create' || cmd.type === 'update' || cmd.type === 'delete' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 操作指令
        key = 'fields'
        if (!_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 不应该出现在增删改指令中',null,{},'PropSpilthError')
    }
    if (cmd.type === 'create' || cmd.type === 'update') {
        // 创建或者更新命令
        key = 'data'
        if (_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 必须要配置',null,{},'PropMissingError')
        if (!_.isArray(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('属性 [' + key + '] 必须是 Object 或者 Array 类型',null,{},'PropTypeError')
        if (_.isArray(cmd[key]) && cmd[key].length === 0) $throwError('属性 [' + key + '] 最少要包含一个字段',null,{},'PropValueError')    
    }
    if (cmd.type === 'delete' || cmd.type === 'update' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 删除或者更新命令
        key = 'query'
        if (!_.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('属性 [' + key + '] 必须是 Object 类型',null,{},'PropTypeError')
    }
    if (cmd.type === 'create') {
        // 删除或者更新命令
        key = 'query'
        if (!_.isUndefined(cmd[key])) $throwError('属性 [' + key + '] 不应该出现在查询指令中',null,{},'PropSpilthError')
    }
    return true
}
module.exports.checkCommand = checkCommand

/**
 * 检查单个顶级命令是否合法
 * @param {object} cmd 单个命令
 */
function checkTopCommand(cmd) {
    checkCommand(cmd)
    // 只有顶级指令需要指明是否 return
    // fields 下的级联查询肯定需要返回
    // after 下的级联操作无需返回
    key = 'return'
    if (!_.isUndefined(cmd[key]) && !_.isBoolean(cmd[key])) $throwError('属性 [' + key + '] 必须是 Boolean 类型',null,{},'PropTypeError')
    return true
}
module.exports.checkTopCommand = checkTopCommand

/**
 * 检查 query 格式是否合法
 * @param {object} query 指令中的 query 对象
 */
function checkQuery(query) {
    // query 未定义，视作查询全部，因此也是合法的
    if (_.isUndefined(query)) return true
    // 参数可用性检查
    if (Object.prototype.toString.call(query) !== '[object Object]') $throwError('传入的 query 参数必须是 Object 类型',null,{},'ParamTypeError')
    // 属性可用性检查
    if (!_.isUndefined(query.where) && Object.prototype.toString.call(query.where) !== '[object Object]') $throwError('属性 [where] 必须是 Object 类型',null,{},'PropTypeError')
    if (!_.isUndefined(query.order) && !_.isString(query.order) && !_.isArray(query.order)) $throwError('属性 [order] 必须是 String 或者 Array 类型',null,{},'PropTypeError')
    if (_.isString(query.order) && query.order === '') $throwError('属性 [order] 不能为空字符串',null,{},'PropValueError')
    if (!_.isUndefined(query.group) && !_.isString(query.group) && !_.isArray(query.group)) $throwError('属性 [group] 必须是 String 或者 Array 类型',null,{},'PropTypeError')
    if (_.isString(query.group) && query.group === '') $throwError('属性 [group] 不能为空字符串',null,{},'PropValueError')
    if (!_.isUndefined(query.size) && !_.isInteger(query.size)) $throwError('属性 [size] 必须是正整数',null,{},'PropTypeError')
    if (query.size < 0) $throwError('属性 [size] 不能小于 0',null,{},'PropValueError')
    if (!_.isUndefined(query.page) && !_.isInteger(query.page)) $throwError('属性 [page] 必须是正整数',null,{},'PropTypeError')
    if (query.page <= 0) $throwError('属性 [page] 不能小于或等于 0',null,{},'PropValueError')
    if (!_.isUndefined(query.page) && _.isUndefined(query.size)) $throwError('如果定义了 [page] 属性, 则 [size] 属性也是必需的',null,{},'PropMissingError')
    return true
}
module.exports.checkQuery = checkQuery

/**
 * 检查 after 格式是否合法
 * @param {object} after 指令中的 after 对象
 */
function checkAfter(after) {
    // after 未定义
    if (_.isUndefined(after)) return true
    // 对象类型检测
    if (Object.prototype.toString.call(after) !== '[object Object]' && !_.isArray(after)) $throwError('传入的 after 参数必须是 Object 或者 Array 类型',null,{},'ParamTypeError')
    return true
}
module.exports.checkAfter = checkAfter

/**
 * 检查 data 格式是否合法
 * @param {object} data 指令中的 data 对象
 */
function checkData(type,data) {
    // 对象类型检测
    if (_.isUndefined(data) && type !== 'delete') $throwError('对于 create、update、increase、decrease 操作，data 参数必须要定义',null,{},'ParamMissingError')
    if (type === 'create') {
        if (Object.prototype.toString.call(data) !== '[object Object]' && !_.isArray(data)) $throwError(type + ' 类型指令，data 参数必须是 Object 或者 Array 类型',null,{},'ParamTypeError')
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) $throwError('传入的 data 对象不能为空',null,{},'ParamEmptyError')
        if (_.isArray(data) && data.length === 0) $throwError('传入的 data 数组不能为空',null,{},'ParamEmptyError')
    }
    if (type === 'update') {
        if (Object.prototype.toString.call(data) !== '[object Object]') $throwError(type + ' 类型指令，data 参数必须是 Object 类型',null,{},'ParamTypeError')
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) $throwError('传入的 data 对象不能为空',null,{},'ParamEmptyError')
    }
    if (type === 'increase' || type === 'decrease') {
        if (Object.prototype.toString.call(data) !== '[object Object]' && !_.isString(data)) $throwError(type + ' 类型指令，data 参数必须是 String 或者 Object 类型',null,{},'ParamTypeError')
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) $throwError('传入的 data 对象不能为空',null,{},'ParamEmptyError')
        if (_.isString() && data === '') $throwError('传入的 data 字符串不能为空',null,{},'ParamEmptyError')
    }
    if (type === 'delete' && !_.isUndefined(data)) $throwError(type + ' 类型指令，不应该有 data 参数',null,{},'ParamDefError')
    return true
}
module.exports.checkData = checkData
