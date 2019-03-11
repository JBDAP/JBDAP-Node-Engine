/**
 * 引用数据处理器，用于 JBDAP 中对引用数据进行各种处理
 * 注意引用类型的指令集均不支持级联属性
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 引入相关模块
const parser = require('./parser')
const calculator = require('./calculator')

/**
 * 从原始数据中过滤出需要的数据字段并返回
 * @param {object} data 原始 entity 数据
 * @param {string|array} rawFields 要获取的字段
 */
function getObjFromObj(data,rawFields) {
    // data 类型和 fields 有效性无需验证，已经可以得到保证
    try {
        if (rawFields === '*') return data
        let result = {}
        let keys = Object.keys(data)
        _.forEach(rawFields, (item) => {
            // 字段名
            if (_.isString(item)) {
                if (keys.indexOf(item) < 0) $throwError('原始数据中不存在 "' + item + '" 字段',null,{},'FieldNotExistError')
                result[item] = data[item]
            }
            // 别名
            if (_.isPlainObject(item)) {
                let key = Object.keys(item)[0]
                if (keys.indexOf(item[key]) < 0) $throwError('原始数据中不存在 "' + key + '" 字段',null,{},'FieldNotExistError')
                result[key] = data[item[key]]
            }
        })
        return result
    }
    catch (err) {
        $throwError('单个对象属性筛选出错',err,{},'DealRefError')
    }
}
module.exports.getObjFromObj = getObjFromObj

/**
 * 从原始数据列表中过滤出复合条件的单条数据，如果有多条符合，则取第一条
 * 支持 order、where，不支持 size、page 查询
 * @param {object} data 原始 list 数据
 * @param {object} query 指令中的 query 条件
 * @param {string|array} rawFields 要获取的字段
 * @param {object} parent 父对象
 * @param {object} root 数据存储根对象
 */
function getObjFromList(data,query,rawFields,parent,root) {
    // data 类型和 fields 有效性无需验证，已经可以得到保证
    try {
        // console.log('getObjFromList')
        let result = null
        if (data.length === 0) return null
        if (!_.isUndefined(query)) {
            if (!_.isUndefined(query.order)) {
                // 进行数据排序
                // 查询所需参数
                let orderFields = []
                let orderDirections = []
                // 首先对数据进行排序
                let order = parser.parseOrder(query.order)
                if (order.length > 0) {
                    // 构建排序条件
                    _.forEach(order, (item) => {
                        orderFields.push(item.column)
                        orderDirections.push(item.order)
                    })
                    // 进行排序
                    data = _.orderBy(data,orderFields,orderDirections)
                    result = data[0]
                }
            }
            if (!_.isUndefined(query.where)) {
                // 进行数据过滤（找到第一条符合条件的即可）
                // 整理过滤条件对象
                let whereObj = {}
                if (Object.prototype.toString.call(query.where) === '[object Object]') {
                    // Object，意味着复杂条件
                    whereObj = query.where
                }
                // 逐条过滤直到找出第一条符合条件的
                for (let i=0; i<data.length; i++) {
                    let item = data[i]
                    if (calculator.checkCondition(whereObj,'and',parent,root,item) === true) {
                        result = _.cloneDeep(item)
                        break
                    }
                }
                // 没有符合条件的直接返回 null
                if (result == null) return null
            }
        }
        // 如果没有经过筛选则取第一条返回
        else result = _.cloneDeep(data[0])
        // 对字段进行过滤
        if (result != null) result = getObjFromObj(result,rawFields)
        // console.log(result)
        return result
    }
    catch (err) {
        // console.log(err.fullStack())
        $throwError('多条记录中筛选目标出错',err,{},'DealRefError')
    }
}
module.exports.getObjFromList = getObjFromList


/**
 * 从原始数据列表中过滤出复合条件的多条数据
 * 支持 where、order、size、page 查询
 * @param {object} data 原始 list 数据
 * @param {object} query 指令中的 query 条件
 * @param {string|array} rawFields 要获取的字段
 * @param {object} parent 父对象
 * @param {object} root 数据存储根对象
 */
function getListFromList(data,query,rawFields,parent,root) {
    // data 类型和 fields 有效性无需验证，已经可以得到保证
    try {
        let result = []
        if (data.length === 0) return null
        if (!_.isUndefined(query)) {
            // 先进行数据过滤
            if (!_.isUndefined(query.where)) {
                // 整理过滤条件对象
                let whereObj = {}
                if (Object.prototype.toString.call(query.where) === '[object Object]') {
                    // Object，意味着复杂条件
                    whereObj = query.where
                }
                // 逐条过滤
                for (let i=0; i<data.length; i++) {
                    let item = data[i]
                    if (calculator.checkCondition(whereObj,'and',parent,root,item) === true) {
                        result.push(_.cloneDeep(item))
                    }
                }
                // 没有符合条件的直接返回 null
                if (result == []) return null
            }
            else result = _.cloneDeep(data)
            // 再进行数据排序
            if (!_.isUndefined(query.order)) {
                // 查询所需参数
                let orderFields = []
                let orderDirections = []
                // 首先对数据进行排序
                let order = parser.parseOrder(query.order)
                if (order.length > 0) {
                    // 构建排序条件
                    _.forEach(order, (item) => {
                        orderFields.push(item.column)
                        orderDirections.push(item.order)
                    })
                    // 进行排序
                    result = _.orderBy(result,orderFields,orderDirections)
                }
            }
            // 数量控制
            let temp = []
            let pas = parser.parseOffsetAndLimit(query.page,query.size)
            if (pas.limit > 0) {
                // 有数量限制
                for (let i=pas.offset; i<pas.offset+pas.limit; i++) {
                    // 数组合法下标范围内
                    if (i >= 0 && i<result.length) temp.push(result[i])
                }
            }
            else {
                // 没有数量限制
                for (let i=pas.offset; i<result.length; i++) {
                    // 数组合法下标范围内
                    temp.push(result[i])
                }
            }
            result = temp
        }
        // 没有经过筛选
        else result = _.cloneDeep(data)
        // 对字段进行过滤
        let ret = []
        _.forEach(result, (item) => {
            ret.push(getObjFromObj(item,rawFields))
        })
        return ret
    }
    catch (err) {
        // console.log(err.fullStack())
        $throwError('多条记录中筛选多条记录出错',err,{},'DealRefError')
    }
}
module.exports.getListFromList = getListFromList

/**
 * 对原始数据进行处理提取出需要的数据
 * @param {object} data 原始 list 数据
 * @param {string|array} valuesFields 要提取获取的字段
 */
function getValuesFromList(data,valuesFields) {
    try {
        if (valuesFields.length === 0) $throwError('values 查询类型至少要定义一个取值字段',null,{},'CmdDefError')
        let values = {}
        for (let i=0; i<valuesFields.length; i++) {
            // 传入查询结果进行处理
            let item = valuesFields[i]
            values[item.name] = calculator.getValue(data,item)
        }
        return values
    }
    catch (err) {
        $throwError('对数组进行取值查询出错',err,{},'DealRefError')
    }
}
module.exports.getValuesFromList = getValuesFromList
