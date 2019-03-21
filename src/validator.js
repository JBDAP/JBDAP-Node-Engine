/**
 * 验证器，用于 JBDAP 处理过程中的参数合法性验证
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 准备 i18n 的默认环境（单元测试用）
if (!global.$i18nLang) global.$i18nLang = 'zh-cn'
if (!global.$throwError) global.$throwError = function(name,cause,info,dict) {
    $throwErrorInLanguage(name,cause,info,dict,global.$i18nLang)
}

/**
 * 检查 JBDAP 描述 json 是否合法
 * @param {object} json 完整的 JBDAP 描述 json
 */
function checkJson(json){
    // 参数可用性检查
    if (Object.prototype.toString.call(json) !== '[object Object]') $throwError('ParamTypeError',null,null,[
        ['zh-cn',`传入的 JSON 必须是 Object 类型`],
        ['en-us',`The param must be an Object`]
    ])
    // json 属性可用性检查
    if (!_.isUndefined(json.security) && Object.prototype.toString.call(json.security) !== '[object Object]') $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'security' 必须是 Object 类型`],
        ['en-us',`The 'security' property must be an Object`]
    ])
    if (!_.isUndefined(json.needLogs) && !_.isBoolean(json.needLogs)) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'needLogs' 必须是 Boolean 类型`],
        ['en-us',`The 'needLogs' property must be a Boolean`]
    ])
    if (!_.isUndefined(json.isTransaction) && !_.isBoolean(json.isTransaction)) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'isTransaction' 必须是 Boolean 类型`],
        ['en-us',`The 'isTransaction' property must be a Boolean`]
    ])
    // commands
    if (_.isUndefined(json.commands)) $throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 'commands' 必须要配置`],
        ['en-us',`The 'commands' property is required`]
    ])
    if (!_.isArray(json.commands) && Object.prototype.toString.call(json.commands) !== '[object Object]') $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'commands' 必须是 Array 或者 Object 类型`],
        ['en-us',`The 'commands' property must be an Array or an Object`]
    ])
    if (_.isArray(json.commands) && json.commands.length === 0) $throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 'commands' 最少要包含一个指令`],
        ['en-us',`The 'commands' property requires at least one command`]
    ])
    return true
}
module.exports.checkJson = checkJson

/**
 * 检查单个命令是否合法
 * @param {object} cmd 单个命令
 */
function checkCommand(cmd) {
    // 参数可用性检查
    if (Object.prototype.toString.call(cmd) !== '[object Object]') $throwError('ParamTypeError',null,null,[
        ['zh-cn',`传入的 'command' 参数必须是 Object 类型`],
        ['en-us',`The param 'command' must be an Object`]
    ])
    // 属性可用性检查
    let key = 'name'
    if (_.isUndefined(cmd[key])) $throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 '${key}' 必须要配置`],
        ['en-us',`The '${key}' property is required`]
    ])
    if (!_.isString(cmd[key])) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 String 类型`],
        ['en-us',`The '${key}' property must be a String`]
    ])
    if (cmd[key] === '') $throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 '${key}' 不能为空字符串`],
        ['en-us',`The '${key}' property can not be an empty String`]
    ])
    key = 'type'
    if (_.isUndefined(cmd[key])) $throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 '${key}' 必须要配置`],
        ['en-us',`The '${key}' property is required`]
    ])
    if (!_.isString(cmd[key])) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 String 类型`],
        ['en-us',`The '${key}' property must be a String`]
    ])
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
    if (validCmds.indexOf(cmd[key]) < 0) $throwError('PropValueInvalidError',null,null,[
        ['zh-cn',`属性 '${key}' 的值 '${cmd[key]}' 不合法`],
        ['en-us',`The value [${cmd[key]}] is invalid for property '${key}'`]
    ])
    key = 'target'
    if (_.isUndefined(cmd[key])) $throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 '${key}' 必须要配置`],
        ['en-us',`The '${key}' property is required`]
    ])
    if (!_.isString(cmd[key])) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 String 类型`],
        ['en-us',`The '${key}' property must be a String`]
    ])
    if (cmd[key] === '') $throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 '${key}' 不能为空字符串`],
        ['en-us',`The '${key}' property can not be an empty String`]
    ])
    key = 'onlyIf'
    if (!_.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
        ['en-us',`The '${key}' property must be an Object`]
    ])
    key = 'after'
    if (!_.isUndefined(cmd[key]) && !_.isArray(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 Object 或 Array 类型`],
        ['en-us',`The '${key}' property must be an Object or an Array`]
    ])
    // 
    // 根据 command 类型检查其它字段
    if (cmd.type === 'entity' || cmd.type === 'list' || cmd.type === 'values') {
        // 查询命令
        key = 'query'
        if (!_.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
            ['en-us',`The '${key}' property must be an Object`]
        ])
        key = 'fields'
        if (!_.isUndefined(cmd[key]) && !_.isArray(cmd[key]) && !_.isString(cmd[key])) $throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Array 或者 String 类型`],
            ['en-us',`The '${key}' property must be an Array or a String`]
        ])
        if (_.isArray(cmd[key]) && cmd[key].length === 0) $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 '${key}' 最少要包含一个字段`],
            ['en-us',`The '${key}' property requires at least one field`]
        ])
        if (_.isString(cmd[key]) && cmd[key] === '') $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 '${key}' 不能为空字符串`],
            ['en-us',`The '${key}' property can not be an empty String`]
        ])
        key = 'data'
        if (!_.isUndefined(cmd[key])) $throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在查询指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type queries`]
        ])
    }
    if (cmd.type === 'create' || cmd.type === 'update' || cmd.type === 'delete' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 操作指令
        key = 'fields'
        if (!_.isUndefined(cmd[key])) $throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在增删改指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type commands`]
        ])
    }
    if (cmd.type === 'create' || cmd.type === 'update' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 创建或者更新命令
        key = 'data'
        if (_.isUndefined(cmd[key])) $throwError('PropMissingError',null,null,[
            ['zh-cn',`属性 '${key}' 必须要配置`],
            ['en-us',`The '${key}' property is required`]
        ])
        if (!_.isArray(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Object 或 Array 类型`],
            ['en-us',`The '${key}' property must be an Object or an Array`]
        ])
        if (_.isArray(cmd[key]) && cmd[key].length === 0) $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 '${key}' 最少要包含一个字段`],
            ['en-us',`The '${key}' property requires at least one field`]
        ])
    }
    if (cmd.type === 'delete' || cmd.type === 'update' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 删除或者更新命令
        key = 'query'
        if (!_.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') $throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
            ['en-us',`The '${key}' property must be an Object`]
        ])
    }
    if (cmd.type === 'create') {
        // 删除或者更新命令
        key = 'query'
        if (!_.isUndefined(cmd[key])) $throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在增删改指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type commands`]
        ])
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
    let key = 'return'
    if (!_.isUndefined(cmd[key]) && !_.isBoolean(cmd[key])) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 Boolean 类型`],
        ['en-us',`The '${key}' property must be a Boolean`]
    ])
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
    if (Object.prototype.toString.call(query) !== '[object Object]') $throwError('ParamTypeError',null,null,[
        ['zh-cn',`传入的 'query' 参数必须是 Object 类型`],
        ['en-us',`The 'query' param must be an Object`]
    ])
    // 属性可用性检查
    if (!_.isUndefined(query.where) && Object.prototype.toString.call(query.where) !== '[object Object]') $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'where' 必须是 Object 类型`],
        ['en-us',`The 'whre' property must be an Object`]
    ])
    if (!_.isUndefined(query.order) && !_.isString(query.order) && !_.isArray(query.order)) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'order' 必须是 String 或者 Array 类型`],
        ['en-us',`The 'order' property must be a String or an Array`]
    ])
    if (_.isString(query.order) && query.order === '') $throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 'order' 不能为空字符串`],
        ['en-us',`The 'order' property can not be an empty String`]
    ])
    if (!_.isUndefined(query.size) && !_.isInteger(query.size)) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'size' 必须是整数`],
        ['en-us',`The 'size' property must be an integer`]
    ])
    if (query.size < 0) $throwError('PropValueInvalidError',null,null,[
        ['zh-cn',`属性 'size' 必须是正整数或 0`],
        ['en-us',`The 'size' property must be a positive integer or 0`]
    ])
    if (!_.isUndefined(query.page) && !_.isInteger(query.page)) $throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'page' 必须是整数`],
        ['en-us',`The 'page' property must be an integer`]
    ])
    if (query.page <= 0) $throwError('PropValueInvalidError',null,null,[
        ['zh-cn',`属性 'page' 必须是正整数`],
        ['en-us',`The 'page' property must be a positive integer`]
    ])
    if (!_.isUndefined(query.page) && _.isUndefined(query.size)) $throwError('PropMissingError',null,null,[
        ['zh-cn',`如果定义了 'page' 属性, 则 'size' 属性也是必需的`],
        ['en-us',`If you defined a 'page' property, then a 'size' property is required too`]
    ])
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
    if (Object.prototype.toString.call(after) !== '[object Object]' && !_.isArray(after)) $throwError('ParamTypeError',null,null,[
        ['zh-cn',`属性 'after' 必须是 Object 或者 Array 类型`],
        ['en-us',`The property 'after' must be an Object or an Array`]
    ])
    return true
}
module.exports.checkAfter = checkAfter

/**
 * 检查 data 格式是否合法
 * @param {object} data 指令中的 data 对象
 */
function checkData(type,data) {
    // 对象类型检测
    if (_.isUndefined(data) && type !== 'delete') $throwError('ParamMissingError',null,null,[
        ['zh-cn',`对于 'create|update|increase|decrease' 操作，属性 'data' 必须要定义`],
        ['en-us',`Property 'data' is required for 'create|update|increase|decrease' type operations`]
    ])
    if (type === 'create') {
        if (Object.prototype.toString.call(data) !== '[object Object]' && !_.isArray(data)) $throwError('PropTypeError',null,null,[
            ['zh-cn',`对于 'create' 操作，属性 'data' 必须是 Object 或者 Array 类型`],
            ['en-us',`Property 'data' must be an Object or an Array for create type operations`]
        ])
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空对象`],
            ['en-us',`The 'data' Property can not be an empty Object`]
        ])
        if (_.isArray(data) && data.length === 0) $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空数组`],
            ['en-us',`The 'data' Property should be an Array which includes at least one element`]
        ])
    }
    if (type === 'update') {
        if (Object.prototype.toString.call(data) !== '[object Object]') $throwError('PropTypeError',null,null,[
            ['zh-cn',`对于 'update' 操作，属性 'data' 必须是 Object 类型`],
            ['en-us',`Property 'data' must be an Object for 'update' type operations`]
        ])
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空对象`],
            ['en-us',`The 'data' Property can not be an empty Object`]
        ])
    }
    if (type === 'increase' || type === 'decrease') {
        if (Object.prototype.toString.call(data) !== '[object Object]' && !_.isString(data)) $throwError('PropTypeError',null,null,[
            ['zh-cn',`对于 'increase|decrease' 操作，属性 'data' 必须是 String 或者 Object 类型`],
            ['en-us',`Property 'data' must be a String or an Object for 'increase|decrease' type operations`]
        ])
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空对象`],
            ['en-us',`The 'data' Property can not be an empty Object`]
        ])
        if (_.isString(data) && data === '') $throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空字符串`],
            ['en-us',`The 'data' Property can not be an empty String`]
        ])
        // 检查值是否数字
        let valid = true
        let fails = []
        _.forEach(Object.keys(data), (key) => {
            if (isNaN(parseFloat(data[key]))) {
                fails.push(key)
                valid = false
            }
        })
        if (valid === false) $throwError('PropValueInvalidError',null,null,[
            ['zh-cn',`字段 '${fails.join(',')}' 的值不是有效数字`],
            ['en-us',`Values of fields '${fails.join(',')}' are not numbers`]
        ])
    }
    if (type === 'delete' && !_.isUndefined(data)) $throwError('PropSpilthError',null,null,[
        ['zh-cn',`对于 'delete' 操作，属性 'data' 不应该出现`],
        ['en-us',`The 'data' Property should not exist in 'delete' type operations`]
    ])
    return true
}
module.exports.checkData = checkData
