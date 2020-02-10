const path = require('path')
const knex = require('knex')

let db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.join(__dirname, 'db.sqlite')
    },
    useNullAsDefault: true,
    asyncStackTraces: true,
    debug: false
})

let json = {
    'type': 'string',
    'id#in': [6,7,8,9,10],
    '$not': {
        'id#in': [1,2,3,4,5],
        'hearts#gt': 100,
        'stop#ne': true
    },
    '$or': {
        'click#gt': 100,
        'complaint#gt': 10
    }
}

function obj2where(obj) {
    return goDeep(obj,'and')
}

function goDeep(obj,type) {
    let funcDefine = 'function(){'
    let keys = Object.keys(obj)
    for (let i=0; i<keys.length; i++) {
        // 子项的 key
        let key = keys[i]
        if (key.indexOf('$') === 0) {
            // 子项是复杂解析
            let func = ''
            let subType = key.replace('$','')
            let subfuncDefine = goDeep(obj[key],subType)
            if (i===0) {
                if (type==='and' || type==='or') func = `this.where({content})`
                if (type==='not') func = `this.whereNot({content})`
            }
            else {
                if (type==='and') func = `.andWhere({content})`
                if (type==='or') func = `.orWhere({content})`
                if (type==='not') func = `.whereNot({content})`
            }
            let itemStr = func.replace('{content}',subfuncDefine)
            funcDefine += itemStr
        }
        else {
            // 说明是简单解析
            // 把键值对解析成公式
            let slices = key.split('#')
            let left = slices[0]
            let operator = slices[1] ? slices[1] : 'eq'
            let right = obj[key]
            console.log(left,operator,right)
            switch (operator) {
                case 'eq': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where({'{left}':{right}})`
                        if (type==='not') func = `this.whereNot({'{left}':{right}})`
                    }
                    else {
                        if (type==='and') func = `.andWhere({'{left}':{right}})`
                        if (type==='or') func = `.orWhere({'{left}':{right}})`
                        if (type==='not') func = `.whereNot({'{left}':{right}})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'ne':{
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNot({'{left}':{right}})`
                        if (type==='not') func = `this.where({'{left}':{right}})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNot('{left}',{right})})`
                        if (type==='or') func = `.orWhere(function(){this.whereNot('{left}',{right})})`
                        if (type==='not') func = `.where('{left}',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'gte': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','>=',{right})`
                        if (type==='not') func = `this.whereNot('{left}','>=',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','>=',{right})`
                        if (type==='or') func = `.orWhere('{left}','>=',{right})`
                        if (type==='not') func = `.whereNot('{left}','>=',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'gt': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','>',{right})`
                        if (type==='not') func = `this.whereNot('{left}','>',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','>',{right})`
                        if (type==='or') func = `.orWhere('{left}','>',{right})`
                        if (type==='not') func = `.whereNot('{left}','>',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'lte': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','<=',{right})`
                        if (type==='not') func = `this.whereNot('{left}','<=',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','<=',{right})`
                        if (type==='or') func = `.orWhere('{left}','<=',{right})`
                        if (type==='not') func = `.whereNot('{left}','<=',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'lt': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','<',{right})`
                        if (type==='not') func = `this.whereNot('{left}','<',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','<',{right})`
                        if (type==='or') func = `.orWhere('{left}','<',{right})`
                        if (type==='not') func = `.whereNot('{left}','<',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'in': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereIn('{left}',{right})`
                        else func = `this.whereNotIn('{left}',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereIn('{left}',{right})})`
                        if (type==='or') func = `.orWhereIn('{left}',{right})`
                        if (type==='not') func = `.whereNotIn('{left}',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    // console.log(itemStr)
                    funcDefine += itemStr
                    break
                }
                case 'notIn': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNotIn('{left}',{right})`
                        else func = `this.whereIn('{left}',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNotIn('{left}',{right})})`
                        if (type==='or') func = `.orWhereNotIn('{left}',{right})`
                        if (type==='not') func = `.whereIn('{left}',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    // console.log(itemStr)
                    funcDefine += itemStr
                    break
                }
                case 'like': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','like',{right})`
                        if (type==='not') func = `this.whereNot('{left}','like',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','like',{right})`
                        if (type==='or') func = `.orWhere('{left}','like',{right})`
                        if (type==='not') func = `.whereNot('{left}','like',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'notLike': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNot('{left}','like',{right})`
                        if (type==='not') func = `this.where('{left}','like',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNot('{left}','like',{right})})`
                        if (type==='or') func = `.orWhereNot('{left}','like',{right})`
                        if (type==='not') func = `.where('{left}','like',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    funcDefine += itemStr
                    break
                }
                case 'contains': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                        if (type==='not') func = `this.whereNot('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                        if (type==='or') func = `.orWhere('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                        if (type==='not') func = `.whereNot('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                    }
                    let itemStr = func.replace('{left}',left)
                    funcDefine += itemStr
                    break
                }
                case 'notContain': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNot('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                        if (type==='not') func = `this.where('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNot('{left}','like',${'%'+ JSON.stringify(right) +'%'})})`
                        if (type==='or') func = `.orWhereNot('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                        if (type==='not') func = `.where('{left}','like',${'%'+ JSON.stringify(right) +'%'})`
                    }
                    let itemStr = func.replace('{left}',left)
                    funcDefine += itemStr
                    break
                }
                case 'startsWith': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','like',${JSON.stringify(right) +'%'})`
                        if (type==='not') func = `this.whereNot('{left}','like',${JSON.stringify(right) +'%'})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','like',${JSON.stringify(right) +'%'})`
                        if (type==='or') func = `.orWhere('{left}','like',${JSON.stringify(right) +'%'})`
                        if (type==='not') func = `.whereNot('{left}','like',${JSON.stringify(right) +'%'})`
                    }
                    let itemStr = func.replace('{left}',left)
                    funcDefine += itemStr
                    break
                }
                case 'notStartWith': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNot('{left}','like',${JSON.stringify(right) +'%'})`
                        if (type==='not') func = `this.where('{left}','like',${JSON.stringify(right) +'%'})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNot('{left}','like',${JSON.stringify(right) +'%'})})`
                        if (type==='or') func = `.orWhereNot('{left}','like',${JSON.stringify(right) +'%'})`
                        if (type==='not') func = `.where('{left}','like',${JSON.stringify(right) +'%'})`
                    }
                    let itemStr = func.replace('{left}',left)
                    funcDefine += itemStr
                    break
                }
                case 'endsWith': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.where('{left}','like',${'%'+ JSON.stringify(right)})`
                        if (type==='not') func = `this.whereNot('{left}','like',${'%'+ JSON.stringify(right)})`
                    }
                    else {
                        if (type==='and') func = `.andWhere('{left}','like',${'%'+ JSON.stringify(right)})`
                        if (type==='or') func = `.orWhere('{left}','like',${'%'+ JSON.stringify(right)})`
                        if (type==='not') func = `.whereNot('{left}','like',${'%'+ JSON.stringify(right)})`
                    }
                    let itemStr = func.replace('{left}',left)
                    funcDefine += itemStr
                    break
                }
                case 'notEndWith': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNot('{left}','like',${JSON.stringify(right)})`
                        if (type==='not') func = `this.where('{left}','like',${JSON.stringify(right)})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNot('{left}','like',${JSON.stringify(right)})})`
                        if (type==='or') func = `.orWhereNot('{left}','like',${JSON.stringify(right)})`
                        if (type==='not') func = `.where('{left}','like',${JSON.stringify(right)})`
                    }
                    let itemStr = func.replace('{left}',left)
                    funcDefine += itemStr
                    break
                }
                case 'between': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereBetween('{left}',{right})`
                        else func = `this.whereNotBetween('{left}',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereBetween('{left}',{right})})`
                        if (type==='or') func = `.orWhereBetween('{left}',{right})`
                        if (type==='not') func = `.whereNotBetween('{left}',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    // console.log(itemStr)
                    funcDefine += itemStr
                    break
                }
                case 'notBetween': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNotBetween('{left}',{right})`
                        else func = `this.whereBetween('{left}',{right})`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNotBetween('{left}',{right})})`
                        if (type==='or') func = `.orWhereNotBetween('{left}',{right})`
                        if (type==='not') func = `.whereBetween('{left}',{right})`
                    }
                    let itemStr = func.replace('{left}',left).replace('{right}',JSON.stringify(right))
                    // console.log(itemStr)
                    funcDefine += itemStr
                    break
                }
                case 'isNull': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNull('{left}')`
                        else func = `this.whereNotNull('{left}')`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNull('{left}')})`
                        if (type==='or') func = `.orWhereNull('{left}')`
                        if (type==='not') func = `.whereNotNull('{left}')`
                    }
                    let itemStr = func.replace('{left}',left)
                    // console.log(itemStr)
                    funcDefine += itemStr
                    break
                }
                case 'isNotNull': {
                    // 第一项
                    let func = ''
                    if (i === 0) {
                        // 根据上层定义的关系来生成连接词
                        if (type==='and' || type==='or') func = `this.whereNotNull('{left}')`
                        else func = `this.whereNull('{left}')`
                    }
                    else {
                        if (type==='and') func = `.andWhere(function(){this.whereNotNull('{left}')})`
                        if (type==='or') func = `.orWhereNotNull('{left}')`
                        if (type==='not') func = `.whereNull('{left}')`
                    }
                    let itemStr = func.replace('{left}',left)
                    // console.log(itemStr)
                    funcDefine += itemStr
                    break
                }
                default:
                    JS.throwError('WhereDefError',null,null,[
                        ['zh-cn', `运算符 '${operator}' 不存在`],
                        ['en-us', `Operator '${operator}' does not exist`]
                    ],lang)
            }
        }
    }
    funcDefine += '}'
    return funcDefine
}

let content = obj2where(json)
let query = db.select('*').from('test')

console.log(eval(`query.where(${content}).toString()`))

