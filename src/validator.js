/**
 * 验证器，用于 JBDAP 处理过程中的参数合法性验证
 */

// 运行环境准备
import { JS, JE } from './global'

// 引入 xss 模块
const XSS = require('xss')
const options = {}
const xss = new XSS.FilterXSS(options)

/**
 * 检查 JBDAP 描述 json 是否合法
 * @param {object} json 完整的 JBDAP 描述 json
 * @param {string} lang 提示信息所用语言
 */
function checkJson(json,lang){
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 参数可用性检查
    if (Object.prototype.toString.call(json) !== '[object Object]') JS.throwError('ParamTypeError',null,null,[
        ['zh-cn',`传入的 JSON 必须是 Object 类型`],
        ['en-us',`The param must be an Object`]
    ],lang)
    // json 属性可用性检查
    if (!JS._.isUndefined(json.security) && Object.prototype.toString.call(json.security) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'security' 必须是 Object 类型`],
        ['en-us',`The 'security' property must be an Object`]
    ],lang)
    if (!JS._.isUndefined(json.needLogs) && !JS._.isBoolean(json.needLogs)) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'needLogs' 必须是 Boolean 类型`],
        ['en-us',`The 'needLogs' property must be a Boolean`]
    ],lang)
    if (!JS._.isUndefined(json.needTrace) && !JS._.isBoolean(json.needTrace)) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'needTrace' 必须是 Boolean 类型`],
        ['en-us',`The 'needTrace' property must be a Boolean`]
    ],lang)
    if (!JS._.isUndefined(json.isTransaction) && !JS._.isBoolean(json.isTransaction)) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'isTransaction' 必须是 Boolean 类型`],
        ['en-us',`The 'isTransaction' property must be a Boolean`]
    ],lang)
    // commands
    if (JS._.isUndefined(json.commands)) JS.throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 'commands' 必须要配置`],
        ['en-us',`The 'commands' property is required`]
    ],lang)
    if (!JS._.isArray(json.commands) && Object.prototype.toString.call(json.commands) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'commands' 必须是 Array 或者 Object 类型`],
        ['en-us',`The 'commands' property must be an Array or an Object`]
    ],lang)
    if (JS._.isArray(json.commands) && json.commands.length === 0) JS.throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 'commands' 最少要包含一个指令`],
        ['en-us',`The 'commands' property requires at least one command`]
    ],lang)
    return true
}
module.exports.checkJson = checkJson

/**
 * 检查单个命令是否合法
 * @param {object} cmd 单个命令
 * @param {string} lang 提示信息所用语言
 */
function checkCommand(cmd,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 参数可用性检查
    if (Object.prototype.toString.call(cmd) !== '[object Object]') JS.throwError('ParamTypeError',null,null,[
        ['zh-cn',`传入的 'command' 参数必须是 Object 类型`],
        ['en-us',`The param 'command' must be an Object`]
    ],lang)
    // 属性可用性检查
    let key = 'name'
    if (JS._.isUndefined(cmd[key])) JS.throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 '${key}' 必须要配置`],
        ['en-us',`The '${key}' property is required`]
    ],lang)
    if (!JS._.isString(cmd[key])) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 String 类型`],
        ['en-us',`The '${key}' property must be a String`]
    ],lang)
    if (cmd[key] === '') JS.throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 '${key}' 不能为空字符串`],
        ['en-us',`The '${key}' property can not be an empty String`]
    ],lang)
    key = 'type'
    if (JS._.isUndefined(cmd[key])) JS.throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 '${key}' 必须要配置`],
        ['en-us',`The '${key}' property is required`]
    ],lang)
    if (!JS._.isString(cmd[key])) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 String 类型`],
        ['en-us',`The '${key}' property must be a String`]
    ],lang)
    let validCmds = [
        'entity',
        'list',
        'values',
        'create',
        'update',
        'delete',
        'increase',
        'decrease',
        'function'
    ]
    if (validCmds.indexOf(cmd[key]) < 0) JS.throwError('PropValueInvalidError',null,null,[
        ['zh-cn',`属性 '${key}' 的值 '${cmd[key]}' 不合法`],
        ['en-us',`The value [${cmd[key]}] is invalid for property '${key}'`]
    ],lang)
    key = 'target'
    if (JS._.isUndefined(cmd[key])) JS.throwError('PropMissingError',null,null,[
        ['zh-cn',`属性 '${key}' 必须要配置`],
        ['en-us',`The '${key}' property is required`]
    ],lang)
    if (!JS._.isString(cmd[key])) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 String 类型`],
        ['en-us',`The '${key}' property must be a String`]
    ],lang)
    if (cmd[key] === '') JS.throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 '${key}' 不能为空字符串`],
        ['en-us',`The '${key}' property can not be an empty String`]
    ],lang)
    key = 'onlyIf'
    if (!JS._.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
        ['en-us',`The '${key}' property must be an Object`]
    ],lang)
    key = 'after'
    if (!JS._.isUndefined(cmd[key]) && !JS._.isArray(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 Object 或 Array 类型`],
        ['en-us',`The '${key}' property must be an Object or an Array`]
    ],lang)
    // 
    // 根据 command 类型检查其它字段
    if (cmd.type === 'entity' || cmd.type === 'list' || cmd.type === 'values') {
        // 查询命令
        key = 'query'
        if (!JS._.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
            ['en-us',`The '${key}' property must be an Object`]
        ],lang)
        key = 'fields'
        if (!JS._.isUndefined(cmd[key]) && !JS._.isArray(cmd[key]) && !JS._.isString(cmd[key])) JS.throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Array 或者 String 类型`],
            ['en-us',`The '${key}' property must be an Array or a String`]
        ],lang)
        if (JS._.isArray(cmd[key]) && cmd[key].length === 0) JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 '${key}' 最少要包含一个字段`],
            ['en-us',`The '${key}' property requires at least one field`]
        ],lang)
        if (JS._.isString(cmd[key]) && cmd[key] === '') JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 '${key}' 不能为空字符串`],
            ['en-us',`The '${key}' property can not be an empty String`]
        ],lang)
        key = 'data'
        if (!JS._.isUndefined(cmd[key])) JS.throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在查询指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type queries`]
        ],lang)
    }
    if (cmd.type === 'create' || cmd.type === 'update' || cmd.type === 'delete' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 操作指令
        key = 'fields'
        if (!JS._.isUndefined(cmd[key])) JS.throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在增删改指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type commands`]
        ],lang)
    }
    if (cmd.type === 'create' || cmd.type === 'update' || cmd.type === 'increase' || cmd.type === 'decrease' || cmd.type === 'function') {
        // 创建或者更新命令
        key = 'data'
        if (JS._.isUndefined(cmd[key])) JS.throwError('PropMissingError',null,null,[
            ['zh-cn',`属性 '${key}' 必须要配置`],
            ['en-us',`The '${key}' property is required`]
        ],lang)
        if (cmd.type === 'increase' || cmd.type === 'decrease') {
            if (Object.prototype.toString.call(cmd[key]) !== '[object Object]' && !JS._.isString(cmd[key])) JS.throwError('PropTypeError',null,null,[
                ['zh-cn',`属性 '${key}' 必须是 Object 或 String 类型`],
                ['en-us',`The '${key}' property must be an Object or a String`]
            ],lang)
        }
        else if (cmd.type === 'create') {
            if (!JS._.isArray(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
                ['zh-cn',`属性 '${key}' 必须是 Object 或 Array 类型`],
                ['en-us',`The '${key}' property must be an Object or an Array`]
            ],lang)
            if (JS._.isArray(cmd[key]) && cmd[key].length === 0) JS.throwError('PropEmptyError',null,null,[
                ['zh-cn',`属性 '${key}' 最少要包含一个字段`],
                ['en-us',`The '${key}' property requires at least one field`]
            ],lang)
        }
        else if (cmd.type === 'update') {
            if (Object.prototype.toString.call(cmd[key]) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
                ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
                ['en-us',`The '${key}' property must be an Object`]
            ],lang)
        }
    }
    if (cmd.type === 'delete' || cmd.type === 'update' || cmd.type === 'increase' || cmd.type === 'decrease') {
        // 删除或者更新命令
        key = 'query'
        if (!JS._.isUndefined(cmd[key]) && Object.prototype.toString.call(cmd[key]) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
            ['zh-cn',`属性 '${key}' 必须是 Object 类型`],
            ['en-us',`The '${key}' property must be an Object`]
        ],lang)
    }
    if (cmd.type === 'create') {
        // 删除或者更新命令
        key = 'query'
        if (!JS._.isUndefined(cmd[key])) JS.throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在增删改指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type commands`]
        ],lang)
    }
    if (cmd.type === 'function') {
        // 服务端函数
        key = 'query'
        if (!JS._.isUndefined(cmd[key])) JS.throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在服务端函数指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type commands`]
        ],lang)
        key = 'fields'
        if (!JS._.isUndefined(cmd[key])) JS.throwError('PropSpilthError',null,null,[
            ['zh-cn',`属性 '${key}' 不应该出现在服务端函数指令中`],
            ['en-us',`The '${key}' property should not exist in '${cmd.type}' type commands`]
        ],lang)
    }
    return true
}
module.exports.checkCommand = checkCommand

/**
 * 检查单个顶级命令是否合法
 * @param {object} cmd 单个命令
 * @param {string} lang 提示信息所用语言
 */
function checkTopCommand(cmd,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    checkCommand(cmd,lang)
    // 只有顶级指令需要指明是否 return
    // fields 下的级联查询肯定需要返回
    // after 下的级联操作无需返回
    let key = 'return'
    if (!JS._.isUndefined(cmd[key]) && !JS._.isBoolean(cmd[key])) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 '${key}' 必须是 Boolean 类型`],
        ['en-us',`The '${key}' property must be a Boolean`]
    ],lang)
    return true
}
module.exports.checkTopCommand = checkTopCommand

/**
 * 检查 query 格式是否合法
 * @param {object} query 指令中的 query 对象
 * @param {string} lang 提示信息所用语言
 */
function checkQuery(query,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // query 未定义，视作查询全部，因此也是合法的
    if (JS._.isUndefined(query)) return true
    // 参数可用性检查
    if (Object.prototype.toString.call(query) !== '[object Object]') JS.throwError('ParamTypeError',null,null,[
        ['zh-cn',`传入的 'query' 参数必须是 Object 类型`],
        ['en-us',`The 'query' param must be an Object`]
    ],lang)
    // 属性可用性检查
    if (!JS._.isUndefined(query.where) && Object.prototype.toString.call(query.where) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'where' 必须是 Object 类型`],
        ['en-us',`The 'whre' property must be an Object`]
    ],lang)
    if (!JS._.isUndefined(query.order) && !JS._.isString(query.order) && !JS._.isArray(query.order)) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'order' 必须是 String 或者 Array 类型`],
        ['en-us',`The 'order' property must be a String or an Array`]
    ],lang)
    if (JS._.isString(query.order) && query.order === '') JS.throwError('PropEmptyError',null,null,[
        ['zh-cn',`属性 'order' 不能为空字符串`],
        ['en-us',`The 'order' property can not be an empty String`]
    ],lang)
    if (!JS._.isUndefined(query.size) && !JS._.isInteger(query.size)) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'size' 必须是整数`],
        ['en-us',`The 'size' property must be an integer`]
    ],lang)
    if (query.size < 0) JS.throwError('PropValueInvalidError',null,null,[
        ['zh-cn',`属性 'size' 必须是正整数或 0`],
        ['en-us',`The 'size' property must be a positive integer or 0`]
    ],lang)
    if (!JS._.isUndefined(query.page) && !JS._.isInteger(query.page)) JS.throwError('PropTypeError',null,null,[
        ['zh-cn',`属性 'page' 必须是整数`],
        ['en-us',`The 'page' property must be an integer`]
    ],lang)
    if (query.page <= 0) JS.throwError('PropValueInvalidError',null,null,[
        ['zh-cn',`属性 'page' 必须是正整数`],
        ['en-us',`The 'page' property must be a positive integer`]
    ],lang)
    if (!JS._.isUndefined(query.page) && JS._.isUndefined(query.size)) JS.throwError('PropMissingError',null,null,[
        ['zh-cn',`如果定义了 'page' 属性, 则 'size' 属性也是必需的`],
        ['en-us',`If you defined a 'page' property, then a 'size' property is required too`]
    ],lang)
    return true
}
module.exports.checkQuery = checkQuery

/**
 * 检查 after 格式是否合法
 * @param {object} after 指令中的 after 对象
 * @param {string} lang 提示信息所用语言
 */
function checkAfter(after,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // after 未定义
    if (JS._.isUndefined(after)) return true
    // 对象类型检测
    if (Object.prototype.toString.call(after) !== '[object Object]' && !JS._.isArray(after)) JS.throwError('ParamTypeError',null,null,[
        ['zh-cn',`属性 'after' 必须是 Object 或者 Array 类型`],
        ['en-us',`The property 'after' must be an Object or an Array`]
    ],lang)
    return true
}
module.exports.checkAfter = checkAfter

/**
 * 检查 data 格式是否合法
 * @param {string} type 指令中的 type 对象
 * @param {object} data 指令中的 data 对象
 * @param {string} lang 提示信息所用语言
 */
function checkData(type,data,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 对象类型检测
    if (JS._.isUndefined(data) && type !== 'delete') JS.throwError('ParamMissingError',null,null,[
        ['zh-cn',`对于 'create|update|increase|decrease' 操作，属性 'data' 必须要定义`],
        ['en-us',`Property 'data' is required for 'create|update|increase|decrease' type operations`]
    ],lang)
    if (type === 'create') {
        if (Object.prototype.toString.call(data) !== '[object Object]' && !JS._.isArray(data)) JS.throwError('PropTypeError',null,null,[
            ['zh-cn',`对于 'create' 操作，属性 'data' 必须是 Object 或者 Array 类型`],
            ['en-us',`Property 'data' must be an Object or an Array for create type operations`]
        ],lang)
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空对象`],
            ['en-us',`The 'data' Property can not be an empty Object`]
        ],lang)
        if (JS._.isArray(data) && data.length === 0) JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空数组`],
            ['en-us',`The 'data' Property should be an Array which includes at least one element`]
        ],lang)
    }
    if (type === 'update') {
        if (Object.prototype.toString.call(data) !== '[object Object]') JS.throwError('PropTypeError',null,null,[
            ['zh-cn',`对于 'update' 操作，属性 'data' 必须是 Object 类型`],
            ['en-us',`Property 'data' must be an Object for 'update' type operations`]
        ],lang)
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空对象`],
            ['en-us',`The 'data' Property can not be an empty Object`]
        ],lang)
    }
    if (type === 'increase' || type === 'decrease') {
        if (Object.prototype.toString.call(data) !== '[object Object]' && !JS._.isString(data)) JS.throwError('PropTypeError',null,null,[
            ['zh-cn',`对于 'increase|decrease' 操作，属性 'data' 必须是 String 或者 Object 类型`],
            ['en-us',`Property 'data' must be a String or an Object for 'increase|decrease' type operations`]
        ],lang)
        if (Object.prototype.toString.call(data) === '[object Object]' && Object.keys(data).length === 0) JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空对象`],
            ['en-us',`The 'data' Property can not be an empty Object`]
        ],lang)
        if (JS._.isString(data) && data === '') JS.throwError('PropEmptyError',null,null,[
            ['zh-cn',`属性 'data' 不能为空字符串`],
            ['en-us',`The 'data' Property can not be an empty String`]
        ],lang)
        // 非字符串类型则检查值是否数字
        if (!JS._.isString(data)) {
            let valid = true
            let fails = []
            JS._.forEach(Object.keys(data), (key) => {
                if (isNaN(parseFloat(data[key]))) {
                    fails.push(key)
                    valid = false
                }
            })
            if (valid === false) JS.throwError('PropValueInvalidError',null,null,[
                ['zh-cn',`字段 '${fails.join(',')}' 的值不是有效数字`],
                ['en-us',`Values of fields '${fails.join(',')}' are not numbers`]
            ],lang)
        }
    }
    if (type === 'delete' && !JS._.isUndefined(data)) JS.throwError('PropSpilthError',null,null,[
        ['zh-cn',`对于 'delete' 操作，属性 'data' 不应该出现`],
        ['en-us',`The 'data' Property should not exist in 'delete' type operations`]
    ],lang)
    return true
}
module.exports.checkData = checkData

/**
 * 对输入字符串进行防 xss 安全处理
 * @param {string} str 要处理的字符串
 */
function safeString(str) {
    if (!JS._.isString(str)) return str
    return xss.process(str)
}
module.exports.safeString = safeString

/**
 * 检查字符串是否存在 sql 注入
 * @param {string} str 要处理的字符串
 */
function hasSqlInjection(str) {
    if (!JS._.isString(str)) return false
    const sql = new RegExp("w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))", 'i')
    const sqlMeta = new RegExp("(%27)|(')|(--)|(%23)|(#)", 'i')
    const sqlMeta2 = new RegExp("(()|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))", 'i')
    const sqlUnion = new RegExp("((%27)|('))union", 'i')
    return sql.test(str) || sqlMeta.test(str) || sqlMeta2.test(str) || sqlUnion.test(str)
}
module.exports.hasSqlInjection = hasSqlInjection
