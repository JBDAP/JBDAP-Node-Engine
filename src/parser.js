/**
 * 解析器，用于 JBDAP 处理过程中的各类定义解析
 */

// 引入开发糖
if (!global.NiceError) require('./global')

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
                    if (hasStar) $throwError('field "' + item + '" 定义有误，前面已经有 * 就不能再定义其它字段名',null,{},'FieldsDefError')
                    // 用 => 解析别名
                    let slices = item.split('=>')
                    if (slices.length === 1) rawFields.push(item)
                    else if (slices.length === 2) {
                        if (slices[0] === '' || slices[1] === '') $throwError('field "' + item + '" 定义有误，=> 前后都不能为空字符串',null,{},'FieldsDefError')
                        // 用 # 解析 values 的计算符
                        let pieces = slices[0].split('#')
                        if (pieces.length === 1) {
                            // 对别名写法进行解析
                            let temp = {}
                            temp[slices[1]] = slices[0]
                            rawFields.push(temp)
                        }
                        else if (pieces.length === 2) {
                            if (pieces[0] === '' || pieces[1] === '') $throwError('field "' + item + '" 定义有误，# 前后都不能为空字符串',null,{},'FieldsDefError')
                            // 对 values 运算符解析
                            let temp = {
                                name: slices[1],
                                operator: pieces[0],
                                fields: pieces[1]
                            }
                            values.push(temp)
                        }
                        else $throwError('field "' + item + '" 定义有误，有多于1个 # 符号',null,{},'FieldsDefError')
                    }
                    else $throwError('field "' + item + '" 定义有误，有多于1个 => 符号',null,{},'FieldsDefError')
                } 
            }
            else if (Object.prototype.toString.call(item) === '[object Object]') {
                cascadedFields.push(item)
            }
            else $throwError('fields 数组元素必须是 String 或者 Object',null,{},'FieldsDefError')
        })
        // 检查是否 * 与其它字段并存于原始字段定义里
        if (rawFields.indexOf('*') >= 0 && rawFields.length > 1) $throwError('请检查 fields 定义，* 不能与其它字段定义同时出现',null,{},'FieldsDefError')
        if (rawFields.indexOf('*') >= 0 && rawFields.length === 1) rawFields = '*'
        return {
            raw: rawFields,
            values: values,
            cascaded: cascadedFields
        }
    }
    catch (err) {
        $throwError('解析 fields 出错',err,{},'FieldsPaserError')
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
        if (input.indexOf(' ') >= 0) $throwError('data 表达式 "' + input + '" 不能含有空格',null,{},'DataDefError')
        if (slices.length !== 2) $throwError('data 表达式 "' + input + '" 定义错误，必须且只能有一个 ":" 字符',null,{},'DataDefError')
        if (slices[0] === '' || slices[1] === '') $throwError('data 表达式 "' + input + '" 定义错误，":" 前后均不能为空',null,{},'DataDefError')
        if (parseFloat(slices[1]) === NaN) $throwError('data 表达式 "' + input + '" 定义错误，"' + slices[1] + '" 不是有效数字',null,{},'DataDefError')
        if (parseFloat(slices[1]) < 0) $throwError('data 表达式 "' + input + '" 定义错误，"' + slices[1] + '" 不能小于 0',null,{},'DataValueError')
        let temp = {}
        temp[slices[0]] = parseFloat(slices[1])
        return temp
    }
    catch (err) {
        $throwError('解析 data 出错',err,{},'DataPaserError')
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
                if (!_.isString(order[i])) $throwError('order 定义出错，order 数组下标为 ' + i + ' 的元素不是 String 类型',null,{},'OrderDefError')
                let slices = order[i].split('#')
                if (slices.length === 1) {
                    result.push({
                        column: slices[0],
                        order: 'asc'
                    })
                }
                else if (slices.length === 2) {
                    if (slices[0] === '' || slices[1] === '') $throwError('order 定义出错 "' + order[i] + '"',null,{},'OrderDefError')
                    result.push({
                        column: slices[0],
                        order: slices[1]
                    })
                }
                else $throwError('order 定义出错，"' + order[i] + '" 有多于1个 #',null,{},'OrderDefError') 
            }
            return result
        }
    }
    catch (err) {
        $throwError('解析 order 出错',err,{},'OrderPaserError')
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
            $throwError('size 定义出错，如果定义了 page，也必须定义 size',null,{},'SizeDefError')
        }
        // 两个都有定义
        if (!_.isUndefined(size) && !_.isUndefined(page)) {
            result.offset = (page - 1) * size
            result.limit = size
            return result
        }
    }
    catch (err) {
        $throwError('解析 page 和 size 出错',err,{},'QueryPaserError')
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
            if (pieces[0] === '' || pieces[1] === '') $throwError('运算条件 "' + key +'" 定义错误',null,{},'OpDefError')
            comparision.left = pieces[0]
            comparision.operator = pieces[1]
            comparision.right = value
        }
        if (pieces.length > 2) $throwError('运算条件 "' + key +'" 定义错误',null,{},'OpDefError')
        return comparision
    }
    catch (err) {
        $throwError('单个比较运算条件解析失败',err,{},'JBDAPComparisionError')
    }
}
module.exports.parseComparision = parseComparision
