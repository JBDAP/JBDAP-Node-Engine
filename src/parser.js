/**
 * 解析器，用于 JBDAP 处理过程中的各类定义解析
 */

// 运行环境准备
import { JS, JE } from './global'

/**
 * 将 cmd 中的 fields 分类拆分
 * @param {object} fields 要解析的对象
 * @param {string} lang 提示信息所用语言
 */
function parseFields(fields,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    if (JS._.isUndefined(fields)) return {
        raw: '*',
        values: [],
        cascaded: []
    }
    let values = []
    let rawFields = []
    let cascadedFields = []
    try {
        let list = []
        if (JS._.isString(fields)) {
            // 对字符串的缩略写法进行解析
            // 经过验证的 fields 字段不可能为空，但有可能是 *
            if (fields === '*') list.push('*')
            else {
                // 以 , 分割字段名
                let slices = fields.split(',')
                if (slices.length === 1) list.push(slices[0])
                else {
                    for (let i=0; i<slices.length; i++) {
                        if (slices[i] !== '') list.push(slices[i])
                    }
                }
            }
        }
        else list = fields
        let hasStar = false
        JS._.forEach(list, (item) =>{
            if (JS._.isString(item)) {
                if (item === '*') {
                    rawFields.push('*')
                    hasStar = true
                }
                else {
                    if (hasStar) JS.throwError('FieldsDefError',null,null,[
                        ['zh-cn',`字段 '${item}' 定义有误，前面已经有 * 就不能再定义其它字段名`],
                        ['en-us',`Invalid field '${item}' definition，no more fields can be defined after a '*'`]
                    ],lang)
                    // 用 => 解析别名
                    let slices = item.split('=>')
                    if (slices.length === 1) rawFields.push(item)
                    else if (slices.length === 2) {
                        if (slices[0] === '' || slices[1] === '') JS.throwError('FieldsDefError',null,null,[
                            ['zh-cn',`字段 '${item}' 定义有误，'=>' 两侧都不能是空字符串`],
                            ['en-us',`Invalid field '${item}' definition，empty String is not allowed in both left and right sides around '=>'`]
                        ],lang)
                        // 用 # 解析 values 的计算符
                        let pieces = slices[0].split('#')
                        if (pieces.length === 1) {
                            // 对别名写法进行解析
                            let temp = {}
                            temp[slices[1]] = slices[0]
                            rawFields.push(temp)
                        }
                        else if (pieces.length === 2) {
                            if (pieces[0] === '' || pieces[1] === '') JS.throwError('FieldsDefError',null,null,[
                                ['zh-cn',`字段 '${item}' 定义有误，'#' 两侧都不能是空字符串`],
                                ['en-us',`Invalid field '${item}' definition，empty String is not allowed in both left and right sides around '#'`]
                            ],lang)
                            // 对 values 运算符解析
                            let temp = {
                                name: slices[1],
                                operator: pieces[0],
                                fields: pieces[1]
                            }
                            values.push(temp)
                        }
                        else JS.throwError('FieldsDefError',null,null,[
                            ['zh-cn',`字段 '${item}' 定义有误，有多于1个 '#' 符号`],
                            ['en-us',`Invalid field '${item}' definition，having more than one '#' is not allowed`]
                        ],lang)
                    }
                    else JS.throwError('FieldsDefError',null,null,[
                        ['zh-cn',`字段 '${item}' 定义有误，有多于1个 '=>' 符号`],
                        ['en-us',`Invalid field '${item}' definition，having more than one '=>' is not allowed`]
                    ],lang)
                } 
            }
            else if (Object.prototype.toString.call(item) === '[object Object]') {
                cascadedFields.push(item)
            }
            else JS.throwError('FieldsDefError',null,null,[
                ['zh-cn',`'fields' 数组元素必须是 String 或者 Object`],
                ['en-us',`Each element in 'fields' must be a String or an Object`]
            ],lang)
        })
        // 检查是否 * 与其它字段并存于原始字段定义里
        if (rawFields.indexOf('*') >= 0 && rawFields.length > 1) JS.throwError('FieldsDefError',null,null,[
            ['zh-cn',`请检查 'fields' 定义，* 不能与其它字段定义同时出现`],
            ['en-us',`Please check the 'fields' property, once you have a '*', other fields are not allowed to exist`]
        ],lang)
        // 只要含有 '*' 一律转字符串
        if (rawFields.indexOf('*') >= 0 && rawFields.length === 1) rawFields = '*'
        return {
            raw: rawFields,
            values: values,
            cascaded: cascadedFields
        }
    }
    catch (err) {
        JS.throwError('FieldsPaserError',err,null,[
            ['zh-cn',`解析 fields 出错`],
            ['en-us',`Error occurred while parsing 'fields' property`]
        ],lang)
    }
}
module.exports.parseFields = parseFields

/**
 * 将字符串表达式解析成对象
 * @param {string} input 输入的字符串
 * @param {string} lang 提示信息所用语言
 */
function parseDataString(input,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    try {
        let slices = input.split(':')
        if (input.indexOf(' ') >= 0) JS.throwError('DataDefError',null,null,[
            ['zh-cn',`表达式 '${input}' 不能含有空格`],
            ['en-us',`Spaces are not allowed in expression '${input}'`]
        ],lang)
        if (slices.length !== 2) JS.throwError('DataDefError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，必须且只能有一个 ':' 字符`],
            ['en-us',`Expression '${input}' is invalid, it must and can only have one ':'`]
        ],lang)
        if (slices[0] === '' || slices[1] === '') JS.throwError('DataDefError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，':' 两侧都不能是空字符串`],
            ['en-us',`Expression '${input}' is invalid，empty String is not allowed in both left and right sides around ':'`]
        ],lang)
        if (isNaN(parseFloat(slices[1]))) JS.throwError('DataValueInvalidError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，'${slices[1]}' 不是有效数字`],
            ['en-us',`Expression '${input}' is invalid, '${slices[1]}' is not a number`]
        ],lang)
        if (parseFloat(slices[1]) <= 0) JS.throwError('DataValueInvalidError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，'${slices[1]}' 不能小于等于 0`],
            ['en-us',`Expression '${input}' is invalid, '${slices[1]}' must be a positive number or 0`]
        ],lang)
        let temp = {}
        temp[slices[0]] = parseFloat(slices[1])
        return temp
    }
    catch (err) {
        JS.throwError('DataPaserError',err,null,[
            ['zh-cn',`解析 data 出错`],
            ['en-us',`Error occurred while parsing 'data' property`]
        ],lang)
    }
}
module.exports.parseDataString = parseDataString

/**
 * 解析 cmd 中的 query.order 配置
 * @param {object} order query 中的 order 定义
 * @param {string} lang 提示信息所用语言
 */
function parseOrder(order,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 未定义
    if (JS._.isUndefined(order)) return []
    try {
        // 字符串类型
        if (JS._.isString(order)) {
            let temp = []
            let slices = order.split(',')
            for(let i=0; i<slices.length; i++) {
                if (slices[i] !== '') temp.push(slices[i])
            }
            order = temp
        }
        // 数组类型
        if (JS._.isArray(order)) {
            let result = []
            for (let i=0; i<order.length; i++) {
                if (!JS._.isString(order[i])) JS.throwError('OrderDefError',null,null,[
                    ['zh-cn',`下标为 ${i} 的元素不是 String 类型`],
                    ['en-us',`The element with index ${i} is not a String`]
                ],lang)
                let slices = order[i].split('#')
                if (slices.length === 1) {
                    result.push({
                        column: slices[0],
                        order: 'asc'
                    })
                }
                else if (slices.length === 2) {
                    if (slices[0] === '' || slices[1] === '') JS.throwError('OrderDefError',null,null,[
                        ['zh-cn',`'${order[i]}' 定义有误，'#' 符号两侧均不能为空字符串`],
                        ['en-us',`'${order[i]}' is invalid，empty String is not allowed in both left and right sides around '#'`]
                    ],lang)
                    result.push({
                        column: slices[0],
                        order: slices[1]
                    })
                }
                else JS.throwError('OrderDefError',null,null,[
                    ['zh-cn',`'${order[i]}' 定义有误，有多于1个 '#' 符号`],
                    ['en-us',`'${order[i]}' is invalid，having more than one '#' is not allowed`]
                ],lang)
            }
            return result
        }
    }
    catch (err) {
        JS.throwError('OrderPaserError',err,null,[
            ['zh-cn',`解析 order 出错`],
            ['en-us',`Error occurred while parsing 'order' property`]
        ],lang)
    }
}
module.exports.parseOrder = parseOrder

/**
 * 解析查询偏移及数量控制参数
 * @param {integer} page 第几页
 * @param {integer} size 每页记录数
 * @param {string} lang 提示信息所用语言
 */
function parseOffsetAndLimit(page,size,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    let result = {
        offset: 0,
        limit: 0
    }
    try {
        // 均未定义
        if (JS._.isUndefined(page) && JS._.isUndefined(size)) return result
        // 只定义了 size 未定义 page
        if (!JS._.isUndefined(size) && JS._.isUndefined(page)) {
            result.limit = size
            return result
        }
        // 只定义了 page 未定义 size
        if (!JS._.isUndefined(page) && JS._.isUndefined(size)) {
            JS.throwError('SizeDefError',null,null,[
                ['zh-cn',`如果定义了 'page'，也必须定义 'size'`],
                ['en-us',`If you have defined a 'page', one 'size' definition is required too`]
            ],lang)
        }
        // 两个都有定义
        if (!JS._.isUndefined(size) && !JS._.isUndefined(page)) {
            result.offset = (page - 1) * size
            result.limit = size
            return result
        }
    }
    catch (err) {
        JS.throwError('QueryPaserError',err,null,[
            ['zh-cn',`解析 page 和 size 出错`],
            ['en-us',`Error occurred while parsing 'page' and 'size'`]
        ],lang)
    }
}
module.exports.parseOffsetAndLimit = parseOffsetAndLimit

/**
 * 将键值对解析成结构体
 * @param {string} key 键名
 * @param {string} value 值
 * @param {string} lang 提示信息所用语言
 */
function parseComparision(key,value,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    try {
        // 单一条件解析
        let comparision = {
            left: '',
            operator: 'eq',
            right: ''
        }
        let pieces = key.split('#')
        if (pieces.length === 1) {
            comparision.left = pieces[0]
            comparision.operator = 'eq'
            comparision.right = value
        }
        if (pieces.length === 2) {
            if (pieces[0] === '' || pieces[1] === '') JS.throwError('OpDefError',null,null,[
                ['zh-cn',`'${key}' 定义有误，'#' 符号两侧均不能为空字符串`],
                ['en-us',`'${key}' is invalid，empty String is not allowed in both left and right sides around '#'`]
            ],lang)
            comparision.left = pieces[0]
            comparision.operator = pieces[1]
            comparision.right = value
        }
        if (pieces.length > 2) JS.throwError('OpDefError',null,null,[
            ['zh-cn',`'${key}' 定义有误，有多于1个 '#' 符号`],
            ['en-us',`'${key}' is invalid，having more than one '#' is not allowed`]
        ],lang)
        return comparision
    }
    catch (err) {
        JS.throwError('ComparisionParserError',err,null,[
            ['zh-cn',`单个比较运算条件解析失败`],
            ['en-us',`Error occurred while parsing single comparision`]
        ],lang)
    }
}
module.exports.parseComparision = parseComparision
