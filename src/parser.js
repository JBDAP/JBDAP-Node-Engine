/**
 * 解析器，用于 JBDAP 处理过程中的各类定义解析
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 准备 i18n 的默认环境（单元测试用）
if (!global.$i18nLang) global.$i18nLang = 'zh-cn'
if (!global.$throwError) global.$throwError = function(name,cause,info,dict) {
    $throwErrorInLanguage(name,cause,info,dict,global.$i18nLang)
}

/**
 * 将 cmd 中的 fields 分类拆分
 * @param {object} fields 要解析的对象
 */
function parseFields(fields) {
    if (_.isUndefined(fields)) return {
        raw: '*',
        values: [],
        cascaded: []
    }
    let values = []
    let rawFields = []
    let cascadedFields = []
    try {
        let list = []
        if (_.isString(fields)) {
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
        _.forEach(list, (item) =>{
            if (_.isString(item)) {
                if (item === '*') {
                    rawFields.push('*')
                    hasStar = true
                }
                else {
                    if (hasStar) $throwError('FieldsDefError',null,null,[
                        ['zh-cn',`字段 '${item}' 定义有误，前面已经有 * 就不能再定义其它字段名`],
                        ['en-us',`Invalid field '${item}' definition，no more fields can be defined after a '*'`]
                    ])
                    // 用 => 解析别名
                    let slices = item.split('=>')
                    if (slices.length === 1) rawFields.push(item)
                    else if (slices.length === 2) {
                        if (slices[0] === '' || slices[1] === '') $throwError('FieldsDefError',null,null,[
                            ['zh-cn',`字段 '${item}' 定义有误，'=>' 两侧都不能是空字符串`],
                            ['en-us',`Invalid field '${item}' definition，empty String is not allowed in both left and right sides around '=>'`]
                        ])
                        // 用 # 解析 values 的计算符
                        let pieces = slices[0].split('#')
                        if (pieces.length === 1) {
                            // 对别名写法进行解析
                            let temp = {}
                            temp[slices[1]] = slices[0]
                            rawFields.push(temp)
                        }
                        else if (pieces.length === 2) {
                            if (pieces[0] === '' || pieces[1] === '') $throwError('FieldsDefError',null,null,[
                                ['zh-cn',`字段 '${item}' 定义有误，'#' 两侧都不能是空字符串`],
                                ['en-us',`Invalid field '${item}' definition，empty String is not allowed in both left and right sides around '#'`]
                            ])
                            // 对 values 运算符解析
                            let temp = {
                                name: slices[1],
                                operator: pieces[0],
                                fields: pieces[1]
                            }
                            values.push(temp)
                        }
                        else $throwError('FieldsDefError',null,null,[
                            ['zh-cn',`字段 '${item}' 定义有误，有多于1个 '#' 符号`],
                            ['en-us',`Invalid field '${item}' definition，having more than one '#' is not allowed`]
                        ])
                    }
                    else $throwError('FieldsDefError',null,null,[
                        ['zh-cn',`字段 '${item}' 定义有误，有多于1个 '=>' 符号`],
                        ['en-us',`Invalid field '${item}' definition，having more than one '=>' is not allowed`]
                    ])
                } 
            }
            else if (Object.prototype.toString.call(item) === '[object Object]') {
                cascadedFields.push(item)
            }
            else $throwError('FieldsDefError',null,null,[
                ['zh-cn',`'fields' 数组元素必须是 String 或者 Object`],
                ['en-us',`Each element in 'fields' must be a String or an Object`]
            ])
        })
        // 检查是否 * 与其它字段并存于原始字段定义里
        if (rawFields.indexOf('*') >= 0 && rawFields.length > 1) $throwError('FieldsDefError',null,null,[
            ['zh-cn',`请检查 'fields' 定义，* 不能与其它字段定义同时出现`],
            ['en-us',`Please check the 'fields' property, once you have a '*', other fields are not allowed to exist`]
        ])
        if (rawFields.indexOf('*') >= 0 && rawFields.length === 1) rawFields = '*'
        return {
            raw: rawFields,
            values: values,
            cascaded: cascadedFields
        }
    }
    catch (err) {
        $throwError('FieldsPaserError',err,null,[
            ['zh-cn',`解析 fields 出错`],
            ['en-us',`Error occurred while parsing 'fields' property`]
        ])
    }
}
module.exports.parseFields = parseFields

/**
 * 将字符串表达式解析成对象
 * @param {string} input 输入的字符串
 */
function parseDataString(input) {
    try {
        let slices = input.split(':')
        if (input.indexOf(' ') >= 0) $throwError('DataDefError',null,null,[
            ['zh-cn',`表达式 '${input}' 不能含有空格`],
            ['en-us',`Spaces are not allowed in expression '${input}'`]
        ])
        if (slices.length !== 2) $throwError('DataDefError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，必须且只能有一个 ':' 字符`],
            ['en-us',`Expression '${input}' is invalid, it must and can only have one ':'`]
        ])
        if (slices[0] === '' || slices[1] === '') $throwError('DataDefError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，':' 两侧都不能是空字符串`],
            ['en-us',`Expression '${input}' is invalid，empty String is not allowed in both left and right sides around ':'`]
        ])
        if (parseFloat(slices[1]) === NaN) $throwError('DataValueInvalidError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，'${slices[1]}' 不是有效数字`],
            ['en-us',`Expression '${input}' is invalid, '${slices[1]}' is not a number`]
        ])
        if (parseFloat(slices[1]) <= 0) $throwError('DataValueInvalidError',null,null,[
            ['zh-cn',`表达式 '${input}' 定义有误，'${slices[1]}' 不能小于等于 0`],
            ['en-us',`Expression '${input}' is invalid, '${slices[1]}' must be a positive number or 0`]
        ])
        let temp = {}
        temp[slices[0]] = parseFloat(slices[1])
        return temp
    }
    catch (err) {
        $throwError('DataPaserError',err,null,[
            ['zh-cn',`解析 data 出错`],
            ['en-us',`Error occurred while parsing 'data' property`]
        ])
    }
}
module.exports.parseDataString = parseDataString

/**
 * 解析 cmd 中的 query.order 配置
 * @param {object} order query 中的 order 定义
 */
function parseOrder(order) {
    // 未定义
    if (_.isUndefined(order)) return []
    try {
        // 字符串类型
        if (_.isString(order)) {
            let temp = []
            let slices = order.split(',')
            for(let i=0; i<slices.length; i++) {
                if (slices[i] !== '') temp.push(slices[i])
            }
            order = temp
        }
        // 数组类型
        if (_.isArray(order)) {
            let result = []
            for (let i=0; i<order.length; i++) {
                if (!_.isString(order[i])) $throwError('OrderDefError',null,null,[
                    ['zh-cn',`下标为 ${i} 的元素不是 String 类型`],
                    ['en-us',`The element with index ${i} is not a String`]
                ])
                let slices = order[i].split('#')
                if (slices.length === 1) {
                    result.push({
                        column: slices[0],
                        order: 'asc'
                    })
                }
                else if (slices.length === 2) {
                    if (slices[0] === '' || slices[1] === '') $throwError('OrderDefError',null,null,[
                        ['zh-cn',`'${order[i]}' 定义有误，'#' 符号两侧均不能为空字符串`],
                        ['en-us',`'${order[i]}' is invalid，empty String is not allowed in both left and right sides around '#'`]
                    ])
                    result.push({
                        column: slices[0],
                        order: slices[1]
                    })
                }
                else $throwError('OrderDefError',null,null,[
                    ['zh-cn',`'${order[i]}' 定义有误，有多于1个 '#' 符号`],
                    ['en-us',`'${order[i]}' is invalid，having more than one '#' is not allowed`]
                ])
            }
            return result
        }
    }
    catch (err) {
        $throwError('OrderPaserError',err,null,[
            ['zh-cn',`解析 order 出错`],
            ['en-us',`Error occurred while parsing 'order' property`]
        ])
    }
}
module.exports.parseOrder = parseOrder

/**
 * 解析查询偏移及数量控制参数
 * @param {integer} page 第几页
 * @param {integer} size 每页记录数
 */
function parseOffsetAndLimit(page,size) {
    let result = {
        offset: 0,
        limit: 0
    }
    try {
        // 均未定义
        if (_.isUndefined(page) && _.isUndefined(size)) return result
        // 只定义了 size 未定义 page
        if (!_.isUndefined(size) && _.isUndefined(page)) {
            result.limit = size
            return result
        }
        // 只定义了 page 未定义 size
        if (!_.isUndefined(page) && _.isUndefined(size)) {
            $throwError('SizeDefError',null,null,[
                ['zh-cn',`如果定义了 'page'，也必须定义 'size'`],
                ['en-us',`If you have defined a 'page', one 'size' definition is required too`]
            ])
        }
        // 两个都有定义
        if (!_.isUndefined(size) && !_.isUndefined(page)) {
            result.offset = (page - 1) * size
            result.limit = size
            return result
        }
    }
    catch (err) {
        $throwError('QueryPaserError',err,null,[
            ['zh-cn',`解析 page 和 size 出错`],
            ['en-us',`Error occurred while parsing 'page' and 'size'`]
        ])
    }
}
module.exports.parseOffsetAndLimit = parseOffsetAndLimit

/**
 * 将键值对解析成结构体
 * @param {string} key 键名
 * @param {string} value 值
 */
function parseComparision(key,value) {
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
            if (pieces[0] === '' || pieces[1] === '') $throwError('OpDefError',null,null,[
                ['zh-cn',`'${key}' 定义有误，'#' 符号两侧均不能为空字符串`],
                ['en-us',`'${key}' is invalid，empty String is not allowed in both left and right sides around '#'`]
            ])
            comparision.left = pieces[0]
            comparision.operator = pieces[1]
            comparision.right = value
        }
        if (pieces.length > 2) $throwError('OpDefError',null,null,[
            ['zh-cn',`'${key}' 定义有误，有多于1个 '#' 符号`],
            ['en-us',`'${key}' is invalid，having more than one '#' is not allowed`]
        ])
        return comparision
    }
    catch (err) {
        $throwError('ComparisionParserError',err,null,[
            ['zh-cn',`单个比较运算条件解析失败`],
            ['en-us',`Error occurred while parsing single comparision`]
        ])
    }
}
module.exports.parseComparision = parseComparision
