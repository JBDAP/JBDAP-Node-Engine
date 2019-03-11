/**
 * JBDAP-node-wrap 入口
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 标记数据库类型
global.$dbServer = 'unknown'

// 引入其它模块
const validator = require('./validator')
const parser = require('./parser')
const calculator = require('./calculator')
const reference = require('./reference')

/**
 * 解析并执行 json 中的指令
 * @param {object} knex 数据库连接对象
 * @param {function} doorman 权限校验函数
 * @param {function} scanner 数据扫描器，用于屏蔽敏感字段，不返回给调用者
 * @param {object} json 要执行的 JBDAP 参数
 */
async function manipulate(knex,doorman,scanner,json) {
    // 执行完成后返回的结果
    let returnObj = {
        code: 1,
        message: 'ok',
        data: {},
        logs: []
    }
    // 执行过程日志
    let logs = []
    try {
        logs.push('- 开启 JBDAP 任务')
        // 1、验证参数是否合法
        logs.push('- 检查接收到的 JSON 是否合法')
        validator.checkJson(json)
        // 2、取得当前用户用户账号及权限定义
        let user = await getCurrentUser(knex,json.token)
        logs.push('* 用户身份校验')
        user.authority = JSON.parse(user.authority)
        // 3、定义要用到的变量
        // root 用于保存数据的临时空间
        let root = {}
        let commands = json.commands
        if (Object.prototype.toString.call(json.commands) === '[object Object]') commands = [commands]
        // 4、开始执行
        logs.push('- 开始处理接收到的指令')
        await proceed(knex,doorman,scanner,commands,json.isTransaction,root,logs,user)
        logs.push('- 全部指令处理完成')
        logs.push('- JBDAP 任务成功')
        // 5、获取结果数据返回
        for (let i=0; i<commands.length; i++) {
            let item = commands[i]
            if (root[item.name].error) {
                returnObj.code = 0
                returnObj.message = root[item.name].error
            }
            if (item.return !== false) {
                returnObj.data[item.name] = root[item.name].data
            }
        }
        // console.log('原始数据：',JSON.stringify(root,null,4))
        // 整理返回格式
        if (json.withLogs !== true) delete returnObj.logs
        else returnObj.logs = logs
        return returnObj
    }
    catch (err) {
        logs.push('- JBDAP 任务失败')
        returnObj.code = 0
        returnObj.message = err.fullMessage()
        returnObj.data = null
        if (json.withLogs !== true) delete returnObj.logs
        else returnObj.logs = logs
        return returnObj
        // $throwError('执行 JBDAP 任务出错',err,{},'JBDAPError')
    }
}
module.exports.manipulate = manipulate

/**
 * 设定当前运行环境的数据库名称
 * 默认为 'unknow'，可以用一个开发团队内部代号，以尽可能少的暴露服务端信息
 * @param {string} name 数据库名称
 */
function setServerName(name) {
    // 标记当前数据库为 sqlite
    global.$dbServer = name
}
module.exports.setServerName = setServerName

/**
 * 根据 token 获取用户 id、角色、授权
 * @param {object} knex 数据库实例
 * @param {string} token 要查询的 token
 */
async function getCurrentUser(knex,token) {
    let condition = {}
    let result = {
        id: 0,
        role: 'default',
        authority: null
    }
    // 如果 token 为 undefined 或者空字符串，则返回默认角色，即 'default' role
    if (_.isUndefined(token) || (_.isString(token) && token === '')) {
        condition = {
            name: 'default'
        }
    }
    else {
        // 读取 token 记录
        let tokenInfo = await $exec(knex('JBDAP_Token').select(['userId','roleId','expiresAt']).where({
            token: token
        }))
        if (tokenInfo.error) $throwError('查询 token 信息失败',tokenInfo.error,{},'DBQueryError')
        if (tokenInfo.data === null) $throwError('找不到 token 记录',null,{
            token: token
        },'TokenError')
        if (tokenInfo.data.length !== 1) {
            $throwError('无法正确读取 token 信息',tokenInfo.error,{
                count: tokenInfo.data.length
            },'DBQueryError')
        }
        else {
            condition = {
                id: tokenInfo.data[0].roleId
            }
            result.id = tokenInfo.data[0].userId
        }
    }
    // 查询角色信息
    let roleInfo = await $exec(knex.select(['name','authority']).from('JBDAP_Role').where(condition))
    if (roleInfo.error) $throwError('查询默认角色权限失败',roleInfo.error,{},'DBQueryError')
    if (roleInfo.data.length === 1) {
        // 查询成功
        result.role = roleInfo.data[0].name
        result.authority = roleInfo.data[0].authority
    }
    else $throwError('无法正确读取默认角色权限',roleInfo.error,{
        count: roleInfo.data.length
    },'DBQueryError')
    return result
}
module.exports.getCurrentUser = getCurrentUser

async function proceed(knex,doorman,scanner,commands,isTrans,root,logs,user) {
    // 检查是否以事务执行
    if (isTrans === true) {
        logs.push('- 以事务方式执行')
        await knex.transaction(async function(trx) {
            // 这里开始事务
            try {
                // 递归执行 commands 中的指令
                for (let i=0; i<commands.length; i++) {
                    let cmd = commands[i]
                    // 执行顶层指令
                    await handleCmd(knex,trx,doorman,scanner,true,cmd,null,root,logs,user,commands,1)
                }
                logs.push('- 事务执行成功')
                return true
            }
            catch (err) {
                logs.push('- 事务失败，数据回滚')
                $throwError('解析或执行指令失败',err,{},'CmdExecError')
            }
        })
    }
    else {
        try {
            logs.push('- 非事务方式执行')
            // 递归执行 commands 中的指令
            for (let i=0; i<commands.length; i++) {
                let cmd = commands[i]
                // 执行顶层指令
                await handleCmd(knex,null,doorman,scanner,true,cmd,null,root,logs,user,commands,1)
            }
        }
        catch (err) {
            $throwError('解析或执行指令失败',err,{},'CmdExecError')
        }
    }
}

async function handleCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands,level) {
    try {
        if (isTop === true) logs.push(prefix(level) + '$ 开始执行顶层指令 /' + cmd.name + ' - ' + cmd.type + ' 类型')
        else logs.push(prefix(level) + '@ 开始执行级联指令 [' + cmd.name + '] - ' + cmd.type + ' 类型')
        // console.log('handleCmd',cmd.name)
        let result = null
        // 执行指令
        // 1、对指令合法性进行检查
        if (!isTop) {
            validator.checkCommand(cmd)
        }
        else {
            // 检查缓存空间是否已经存在
            if (Object.keys(root).indexOf(cmd.name) >= 0) {
                logs.push(prefix(level) + '$ /' + cmd.name + ' 已经存在')
                return root[cmd.name].data
            }
            validator.checkTopCommand(cmd)
            // 顶层命令需要创建缓存空间
            root[cmd.name] = {
                return: cmd.return || true,
                error: null,
                data: null
            }
        }
        // 2、检查 onlyIf 前置条件
        // logs.push('* 检查前置条件')
        let cr = await checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level)
        // console.log(cr)
        if (cr === false) {
            // logs.push('* 不成立！跳过 "' + cmd.name + '" 指令')
            return null
        }
        // 3、检查指令权限
        // logs.push('* 检查是否具有操作当前指令的权限')
        if (doorman(user,cmd) === false) {
            // logs.push('* 没有权限！终止 JBDAP 任务')
            $throwError('没有权限执行当前指令 "' + cmd.name + '"',null,{},'JBDAPAuthError')
        }
        // 4、对指令进行分类执行
        switch (cmd.type) {
            case 'entity':
            case 'list':
            case 'values':
                // 查询类指令
                result = await queryCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands,level)
                break
            case 'create':
            case 'update':
            case 'delete':
            case 'increase':
            case 'decrease':
                // 操作类指令
                result = await executeCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands)
                break
        }
        // 5、执行 after 定义的后续指令
        validator.checkAfter(cmd.after)
        if (!_.isUndefined(cmd.after)) {
            logs.push(prefix(level+1) + '# 开始执行后置指令')
            let afterCmds = cmd.after
            if (!_.isArray(cmd.after)) afterCmds = [cmd.after]
            for (let i=0; i<afterCmds.length; i++) {
                // 只执行不返回
                let temp = await handleCmd(knex,trx,doorman,scanner,false,afterCmds[i],result,root,logs,user,commands,level+2)
                // console.log(temp)
            }
            logs.push(prefix(level+1) + '# 后置指令执行完毕')
        }
        if (isTop === true) logs.push(prefix(level) + '$ 顶层指令 /' + cmd.name + ' 执行完毕')
        else logs.push(prefix(level) + '@ 级联指令 [' + cmd.name + '] 执行完毕')
        return result
    }
    catch (err) {
        if (isTop === true) logs.push(prefix(level) + '$ 顶层指令 /' + cmd.name + ' 出现错误')
        else logs.push(prefix(level) + '@ 级联指令 [' + cmd.name + '] 出现错误')
        $throwError('处理指令 "' + cmd.name + '" 出错',err,{},'JBDAPCommandError')
    }
}

function prefix(n) {
    let result = ''
    for (let i=1; i<n; i++) result += '  '
    return result
}

async function queryCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands,level) {
    // 查询类指令
    let result = null
    try {
        // console.log('queryCmd',cmd.name)
        // 取得要获取的字段
        let fields = parser.parseFields(cmd.fields)
        let rawFields = fields.raw
        let cascadedFields = fields.cascaded
        let valuesFields = fields.values
        // 判断查询类型
        if (cmd.target.indexOf('/') === 0) {
            // 引用查询开始 ==>
            let objName = cmd.target.split('/')[1].split('.')[0]
            // 检查被引用数据是否填充，没有则先填充
            let idx = _.findIndex(commands,{ name: objName })
            if (Object.keys(root).indexOf(objName) < 0) {
                // 检查是否存在该引用
                if (idx >= 0) {
                    // 存在同名的指令
                    // 执行查询
                    await handleCmd(knex,trx,doorman,scanner,isTop,commands[idx],parent,root,logs,user,commands,level+1)
                }
                else $throwError('被引用对象 "/' + objName + '" 不存在于 commands 指令集中',null,{},'CmdDefError')
            }
            // 被引用数据
            let rawData = root[objName].data
            if (_.isNull(rawData)) $throwError('被引用对象 "/' + objName + '" 为 null',null,{},'RefValueError')
            // 级联属性
            if (_.isPlainObject(rawData)) {
                let slices = cmd.target.split('/')[1].split('.')
                if (slices.length > 1) {
                    for (let i=1; i<slices.length; i++) {
                        if (Object.keys(rawData).indexOf(slices[i]) < 0) $throwError('引用对象有误，不存在 "' + cmd.target + '" 路径',null,{},'RefDefError')
                        rawData = rawData[slices[i]]
                    }
                }
            }
            // 根据 cmd.type 和被引用数据类型来判断调用那个函数
            if (_.isArray(rawData)) {
                // 从数组中取出单个 entity
                if (cmd.type === 'entity') result = reference.getObjFromList(rawData,cmd.query,rawFields,parent,root)
                // 从数组中取出 list
                if (cmd.type === 'list') result = reference.getListFromList(rawData,cmd.query,rawFields,parent,root)
                // 对数组进行计算得到 values
                if (cmd.type === 'values') result = reference.getValuesFromList(rawData,valuesFields)
            }
            else if (_.isPlainObject(rawData)) {
                // 从 object 中取子集 object
                result = reference.getObjFromObj(rawData,rawFields)
            }
            else $throwError('被引用对象 "' + cmd.target + '" 必须是 Array 或者 Object 类型',null,{},'RefValueError')
        }
        else {
            // 数据表查询开始 ==>
            // 0、检查 query 是否合法
            validator.checkQuery(cmd.query)
            // 1、定位到数据表
            let query = knex.from(cmd.target)
            if (trx !== null) query = trx(cmd.target)
            // 2、设定要查询的原始字段
            if (rawFields === '*') query = query.select()
            else query = query.column(rawFields).select()
            // 3、是否有定义查询规则
            if (!_.isUndefined(cmd.query)) {
                // 3.1、解析 where
                let func = await getWhereFunc(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level)
                // console.log(func)
                if (func !== null) query = eval('query.where(' + func + ')')
                // 3.2、解析 order
                let order = parser.parseOrder(cmd.query.order)
                if (order.length > 0) query = query.orderBy(order)
                // 3.3、解析 size 和 page
                let pas = parser.parseOffsetAndLimit(cmd.query.page,cmd.query.size)
                // 取有限记录
                if (pas.limit > 0) query = query.limit(pas.limit)
                // 有翻页
                if (pas.offset > 0) query = query.offset(pas.offset)
            }
            // 4、执行查询
            console.log('sql:',query.toString())
            result = await query
            // console.log('result',result)
            // 5、如果是 values 取值查询，则执行相应的数据处理
            if (cmd.type === 'values') {
                if (valuesFields.length === 0) $throwError('values 查询类型至少要定义一个取值字段',null,{},'CmdDefError')
                let values = {}
                for (let i=0; i<valuesFields.length; i++) {
                    // 传入查询结果进行处理
                    let item = valuesFields[i]
                    values[item.name] = calculator.getValue(result,item)
                }
                result = values
            }
            // console.log('values',values)
            // 6、敏感字段过滤
            // logs.push('$ 屏蔽 "' + cmd.name + '" 的敏感字段')
            result = scanner(user,cmd,fields,result)
        }
        // 7、填充级联字段
        if (cmd.type !== 'values') {
            // logs.push('@ 开始为 "' + cmd.name + '" 填充级联属性')
            for (let i=0; i<result.length; i++) {
                // entity 只填充第一行
                if (cmd.type === 'entity' && i > 0) break
                let item = result[i]
                for (let i=0; i<cascadedFields.length; i++) {
                    let key = cascadedFields[i].name
                    if (_.isUndefined(key)) $throwError('级联字段定义错误，name 属性是必须的',null,{},'CmdDefError')
                    item[key] = await handleCmd(knex,trx,doorman,scanner,false,cascadedFields[i],item,root,logs,user,commands,level+1)
                }
            }
            // logs.push('@ "' + cmd.name + '" 的级联属性填充成功')
        }
        // 整理返回值
        if (cmd.type === 'entity') {
            if (_.isArray(result) && result.length === 0) result = null
            else if (_.isArray(result)) result = result[0]
            if (isTop) root[cmd.name].data = result
        }
        if (cmd.type === 'list') {
            if (_.isArray(result) && result.length === 0) result = null
            if (isTop) root[cmd.name].data = result
        }
        if (cmd.type === 'values') {
            if (isTop) root[cmd.name].data = result
        }
        // 返回
        return result
    }
    catch (err) {
        $throwError('查询数据出错',err,{},'DBQueryError')
    }
}

async function executeCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands) {
    // 查询类指令
    let result = null
    try {
        // console.log('executeCmd',cmd.name)
        // 判断查询类型
        if (cmd.target.indexOf('/') >= 0) $throwError('操作类指令 target 不能是引用对象',null,{},'CmdDefError')
        else {
            // 数据表操作开始
            // 0、检查 query 是否合法
            // 只有 create 不需要 where 查询条件
            if (cmd.type !== 'create') validator.checkQuery(cmd.query)
            // 1、定位到数据表
            let query = knex(cmd.target)
            if (trx !== null) query = trx(cmd.target)
            // 2、是否有定义查询规则
            if (!_.isUndefined(cmd.query)) {
                // 3.1、解析 where
                let func = await getWhereFunc(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands)
                if (func !== null) query = eval('query.where(' + func + ')')
                // 3.2、解析 order
                let order = parser.parseOrder(cmd.query.order)
                if (order.length > 0) query = query.orderBy(order)
                // 3.3、解析 size 和 page
                let pas = parser.parseOffsetAndLimit(cmd.query.page,cmd.query.size)
                // 取有限记录
                if (pas.limit > 0) query = query.limit(pas.limit)
                // 有翻页
                if (pas.offset > 0) query = query.offset(pas.offset)
            }
            // 3、检查 data 是否合法
            validator.checkData(cmd.type,cmd.data)
            // 4、执行操作
            if (cmd.type === 'delete') query = query.delete()
            // increase 和 decrease 需要特殊整理 data 数据后执行
            else if (cmd.type === 'increase' || cmd.type === 'decrease') {
                if (_.isString(cmd.data)) cmd.data = parser.parseDataString(cmd.data)
                if (cmd.type === 'increase') query = query.increment(cmd.data)
                if (cmd.type === 'decrease') query = query.decrement(cmd.data)
            }
            else {
                // 处理内置函数
                if (Object.prototype.toString.call(cmd.data) === '[object Object]') cmd.data = [cmd.data]
                for (let i=0; i<cmd.data.length; i++) {
                    let item = cmd.data[i]
                    let keys = Object.keys(item)
                    for (let j=0; j<keys.length; j++) {
                        let key = keys[j]
                        if (_.isString(item[key])) {
                            switch (item[key]) {
                                case 'JBDAP.fn.ISODate': item[key] = new Date().toISOString()
                            }
                        }
                    }
                }
                if (cmd.type === 'create') query = query.insert(cmd.data,['id'])
                if (cmd.type === 'update') query = query.update(cmd.data[0],['id'])
            }
            console.log('sql:',query.toString())
            result = await query
            result = {
                dbServer: global.$dbServer,
                return: result
            }
            // console.log('result',result)
            // 7、将结果保存至缓存空间
            if (isTop) root[cmd.name].data = result
            // console.log(result)
            // 返回
            return result
        }
    }
    catch (err) {
        $throwError('操作数据出错',err,{},'DBExecError')
    }
}

async function getWhereFunc(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level) {
    if (_.isUndefined(cmd.query.where)) return null
    if (Object.prototype.toString(cmd.query.where) === '[object Object]' && Object.keys(cmd.query.where).length === 0) return null
    try {
        let where = {}
        if (Object.prototype.toString.call(cmd.query.where) === '[object Object]') where = cmd.query.where
        let func = await getSubConditionFunc(where,'and',cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level)
        // console.log(func.toString())
        return func
    }
    catch (err) {
        $throwError('where 条件解析出错',err,{},'JBDAPWhereError')
    }
}

async function getSubConditionFunc(obj,type,cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') $throwError('where 子查询条件不正确，$' + type + ' 的值必须是 Object 类型',null,{},'WhereDefError')
    let keys = Object.keys(obj)
    let funcDefine = 'function(){ '
    // 注意，这里是为了构造一个函数
    // 此函数下所有的 this 在运行时都指向正在执行的 knex 实例
    // 
    for (let i=0;i<keys.length; i++) {
        let key = keys[i]
        let value = obj[key]
        // key 的处理
        // 如果是子查询表达式
        if (key === '$or' || key === '$and' || key === '$not') {
            // 构造子查询条件
            let sub = await getSubConditionFunc(value,key.replace('$',''),cmd,parent,root,knex,trx,doorman,isTop,logs,user,commands,level)
            let w = 'this.where'
            if (type === 'not') w = w + 'Not'
            if (i > 0) {
                if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                else  w = '.andWhereNot'
            }
            funcDefine += `${w}(${sub})`
        }
        // 单项表达式
        else {
            // 先解析
            let comparision = parser.parseComparision(key,value)
            try {
                if (_.isString(comparision.right)) comparision.right = calculator.tag2value(comparision.right,parent,root,null)
            }
            catch (err) {
                if (err.name === 'Tag2ValueError' && err.fullMessage().indexOf('[TagRefNotFilled]') > 0) {
                    // 发现尚未填充的引用对象
                    // 这里要调用填充
                    let ref = err.fullInfo().needRef
                    // console.log(err.fullInfo())
                    // 检查是否存在该 ref
                    let idx = _.findIndex(commands,{ name: ref })
                    if (idx >= 0) {
                        // 存在与 ref 同名的指令
                        // 执行查询
                        // console.log(commands[idx])
                        await handleCmd(knex,trx,doorman,scanner,isTop,commands[idx],parent,root,logs,user,commands,level+1)
                        // 然后重新执行 attchWhere
                        return await getSubConditionFunc(obj,type,cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level)
                    }
                    else $throwError('where 查询中的引用对象 "/' + ref + '" 不存在于 commands 指令集中',err,{},'WhereDefError')
                }
                else $throwError('where 条件赋值出错',err,{},'WhereValueError')
            }            
            // 后拼组查询条件
            let left = comparision.left, right = comparision.right, operator = comparision.operator
            let bookend = (_.isString(right) ? "'" : "")
            switch (operator) {
                case 'eq': {
                    let w = 'this.where'
                    if (type === 'not') w = w + 'Not'
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNot'
                    }
                    funcDefine += `${w}({'${left}': ${JSON.stringify(right)}})`
                    break
                }
                case 'ne':{
                    let w = 'this.whereNot'
                    if (type === 'not') w = w.replace('Not','')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhere'
                    }
                    funcDefine += `${w}({'${left}': ${JSON.stringify(right)}})`
                    break
                }
                case 'gte': {
                    let w = 'this.where'
                    if (type === 'not') w = w + 'Not'
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNot'
                    }
                    funcDefine += `${w}('${left}','>=',${JSON.stringify(right)})`
                    break
                }
                case 'gt': {
                    let w = 'this.where'
                    if (type === 'not') w = w + 'Not'
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNot'
                    }
                    funcDefine += `${w}('${left}','>',${JSON.stringify(right)})`
                    break
                }
                case 'lte': {
                    let w = 'this.where'
                    if (type === 'not') w = w + 'Not'
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNot'
                    }
                    funcDefine += `${w}('${left}','<=',${JSON.stringify(right)})`
                    break
                }
                case 'lt': {
                    let w = 'this.where'
                    if (type === 'not') w = w + 'Not'
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNot'
                    }
                    funcDefine += `${w}('${left}','<',${JSON.stringify(right)})`
                    break
                }
                case 'in': {
                    let w = 'this.whereIn'
                    if (type === 'not') w = w.replace('In','NotIn')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNotIn'
                    }
                    funcDefine += `${w}('${left}',${JSON.stringify(right)})`
                    break
                }
                case 'notIn': {
                    let w = 'this.whereNotIn'
                    if (type === 'not') w = w.replace('NotIn','In')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereIn'
                    }
                    funcDefine += `${w}('${left}',${JSON.stringify(right)})`
                    break
                }
                case 'like': {
                    let w = 'this.where'
                    if (type === 'not') w = w + 'Not'
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNot'
                    }
                    funcDefine += `${w}('${left}','like',${JSON.stringify(right)})`
                    break
                }
                case 'notLike': {
                    let w = 'this.whereNot'
                    if (type === 'not') w = w.replace('Not','')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhere'
                    }
                    funcDefine += `${w}('${left}','like',${JSON.stringify(right)})`
                    break
                }
                case 'between': {
                    let w = 'this.whereBetween'
                    if (type === 'not') w = w.replace('Between','NotBetween')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNotBetween'
                    }
                    funcDefine += `${w}('${left}',${JSON.stringify(right)})`
                    break
                }
                case 'notBetween': {
                    let w = 'this.whereNotBetween'
                    if (type === 'not') w = w.replace('NotBetween','Between')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereBetween'
                    }
                    funcDefine += `${w}('${left}',${JSON.stringify(right)})`
                    break
                }
                case 'isNull': {
                    let w = 'this.whereNull'
                    if (type === 'not') w = w.replace('Null','NotNull')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNotNull'
                    }
                    funcDefine += `${w}('${left}')`
                    break
                }
                case 'isNotNull': {
                    let w = 'this.whereNotNull'
                    if (type === 'not') w = w.replace('NotNull','Null')
                    if (i > 0) {
                        if (type !== 'not') w = w.replace('this.where','.' + type + 'Where')
                        else  w = '.andWhereNull'
                    }
                    funcDefine += `${w}('${left}')`
                    break
                }
                default:
                    $throwError('运算符 "' + operator + '" 不存在',null,{},'WhereDefError')
            }
        }
    }
    funcDefine += ' }'
    return funcDefine
}

async function checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level) {
    try {
        // console.log('checkOnlyIf',cmd.name)
        if (_.isUndefined(cmd.onlyIf)) return true
        if (Object.prototype.toString.call(cmd.onlyIf) === '[object Object]') {
            return calculator.checkCondition(cmd.onlyIf,'and',parent,root,null)
        }
    }
    catch (err) {
        if (err.name === 'JBDAPConditionCalError' && err.fullMessage().indexOf('[TagRefNotFilled]') > 0) {
            // 发现尚未填充的引用对象
            // 这里要调用填充
            let ref = err.fullInfo().needRef
            // console.log(err.fullInfo())
            // 检查是否存在该 ref
            let idx = _.findIndex(commands,{ name: ref })
            if (idx >= 0) {
                // 存在与 ref 同名的指令
                // 执行查询
                await handleCmd(knex,trx,doorman,scanner,isTop,commands[idx],parent,root,logs,user,commands,level+1)
                // 然后重新执行 onlyIf 并返回
                return await checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level)
            }
            else $throwError('onlyIf 条件中的引用对象 "/' + ref + '" 不存在于 commands 指令集中',err,{},'OnlyIfDefError')
        }
        else $throwError('onlyIf 条件解析失败',err,{},'JBDAPOnlyIfError')
    }
}

