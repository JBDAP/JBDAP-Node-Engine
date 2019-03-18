/**
 * JBDAP-Node-Engine 入口
 */

// 引入开发糖
if (!global.NiceError) require('./global')

// 标记运行环境语言
global.$i18nLang = 'zh-cn'

// 标记数据库类型
global.$dbServer = 'unknown'

// 标记数据表主键
global.$primaryKey = 'id'

// 自定义一个 i18n 的错误抛出器
global.$throwError = function(name,cause,info,dict) {
    $throwErrorInLanguage(name,cause,info,dict,global.$i18nLang)
}

// 引入其它模块
import validator from './validator'
import parser from './parser'
import calculator from './calculator'
import reference from './reference'

/**
 * 解析并执行 json 中的指令
 * @param {object} knex 数据库连接对象
 * @param {object} json 要执行的 JBDAP 参数
 * @param {object} configs 配置参数
 */
async function manipulate(knex,json,configs) {
    configs = configs || {}
    if (_.isString(configs.serverName) && configs.serverName !== '') global.$dbServer = configs.serverName
    if (_.isString(configs.primaryKey) && configs.primaryKey !== '') global.$primaryKey = configs.primaryKey
    if (_.isString(configs.language) && configs.language !== '') global.$i18nLang = configs.language
    // 执行完成后返回的结果
    let returnObj = {
        code: 200,
        message: 'ok',
        data: {},
        logs: []
    }
    // 执行过程日志
    let logs = []
    try {
        addLog(logs, [
            ['zh-cn', '- 开启 JBDAP 任务'],
            ['en-us', '- JBDAP task begins']
        ])
        // 1、验证参数是否合法
        addLog(logs, [
            ['zh-cn', '- 检查接收到的 JSON 是否合法'],
            ['en-us', '- Check JSON validity']
        ])
        validator.checkJson(json)
        // 2、取得当前用户用户账号及权限定义
        addLog(logs, [
            ['zh-cn', '* 识别用户身份'],
            ['en-us', '* Get user identity']
        ])
        let user = {}
        if (_.isFunction(configs.recognizer)) user = await configs.recognizer(json.security || {})
        // 3、定义要用到的变量
        // root 用于保存数据的临时空间
        let root = {}
        let commands = json.commands
        if (Object.prototype.toString.call(json.commands) === '[object Object]') commands = [commands]
        // 4、开始执行
        addLog(logs, [
            ['zh-cn', '- 开始处理接收到的指令'],
            ['en-us', '- Proceed to handle commands']
        ])
        await proceed(knex,configs.doorman,configs.scanner,commands,json.isTransaction,root,logs,user)
        addLog(logs, [
            ['zh-cn', '- 全部指令处理完成'],
            ['en-us', '- All commands handled successfully']
        ])
        addLog(logs, [
            ['zh-cn', '- JBDAP 任务成功'],
            ['en-us', '- JBDAP task succeeded']
        ])
        // 5、获取结果数据返回
        for (let i=0; i<commands.length; i++) {
            let item = commands[i]
            if (root[item.name].error) {
                returnObj.code = 500
                returnObj.message = root[item.name].error
            }
            if (item.return !== false) {
                returnObj.data[item.name] = root[item.name].data
            }
        }
        // console.log('原始数据：',JSON.stringify(root,null,4))
        // 整理返回格式
        if (json.needLogs !== true) delete returnObj.logs
        else returnObj.logs = logs
        return returnObj
    }
    catch (err) {
        addLog(logs, [
            ['zh-cn', '- JBDAP 任务失败'],
            ['en-us', '- JBDAP task failed']
        ])
        // $throwError('JBDAPTaskError',err,null,[
        //     ['zh-cn','JBDAP 任务执行失败'],
        //     ['en-us','JBDAP Task failed']
        // ])
        // 根据错误提示来给出错误码
        returnObj.code = 500
        let msg = err.fullMessage()
        // 参数定义错误
        if (msg.indexOf('DefError]') >= 0 || msg.indexOf('TypeError]') >= 0 || msg.indexOf('MissingError]') >= 0 || msg.indexOf('EmptyError]') >= 0 || msg.indexOf('ValueInvalidError]') >= 0 || msg.indexOf('SpilthError]') >= 0){
            returnObj.code = 400
        }
        // 没有操作权限
        if (msg.indexOf('[AuthError]') >= 0) returnObj.code = 403
        returnObj.message = err.fullMessage()
        returnObj.data = null
        if (json.needLogs !== true) delete returnObj.logs
        else returnObj.logs = logs
        return returnObj
    }
}
module.exports.manipulate = manipulate
import { version } from '../package.json'
module.exports.version = version

/**
 * 开始执行指令
 * @param {object} knex knex 实例
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {array} commands 指令集
 * @param {boolean} isTrans 是否事务
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 */
async function proceed(knex,doorman,scanner,commands,isTrans,root,logs,user) {
    // 检查是否以事务执行
    if (isTrans === true) {
        addLog(logs, [
            ['zh-cn', '- 以事务方式执行'],
            ['en-us', '- Commands will be handled as a transaction']
        ])
        await knex.transaction(async function(trx) {
            // 这里开始事务
            try {
                // 递归执行 commands 中的指令
                for (let i=0; i<commands.length; i++) {
                    let cmd = commands[i]
                    // 执行顶层指令
                    await handleCmd(knex,trx,doorman,scanner,true,cmd,null,root,logs,user,commands,1)
                }
                addLog(logs, [
                    ['zh-cn', '- 事务执行成功'],
                    ['en-us', '- Transaction succeeded']
                ])
                return true
            }
            catch (err) {
                addLog(logs, [
                    ['zh-cn', '- 事务失败，数据回滚'],
                    ['en-us', '- Transaction failed, data has been rolled back']
                ])
                $throwError('TransactionError',err,null,[
                    ['zh-cn','解析或执行事务失败'],
                    ['en-us','Proceed transaction failed']
                ])
            }
        })
    }
    else {
        try {
            addLog(logs, [
                ['zh-cn', '- 非事务方式执行'],
                ['en-us', '- Commands will be handled in non-transaction mode']
            ])
            // 递归执行 commands 中的指令
            for (let i=0; i<commands.length; i++) {
                let cmd = commands[i]
                // 执行顶层指令
                await handleCmd(knex,null,doorman,scanner,true,cmd,null,root,logs,user,commands,1)
            }
        }
        catch (err) {
            $throwError('CommandsExecError',err,null,[
                ['zh-cn','解析或执行指令失败'],
                ['en-us','Proceed commands failed']
            ])
        }
    }
}

/**
 * 处理单个指令
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 */
async function handleCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands,level) {
    try {
        if (isTop === true) addLog(logs, [
            ['zh-cn', `${prefix(level)}$ 开始执行顶层命令 /${cmd.name} (${cmd.type} 类型)`],
            ['en-us', `${prefix(level)}$ Begin to handle top command /${cmd.name} ('${cmd.type}' type)`]
        ])
        else addLog(logs, [
            ['zh-cn', `${prefix(level)}@ 开始执行级联指令 /${cmd.name} (${cmd.type} 类型)`],
            ['en-us', `${prefix(level)}@ Begin to handle cascaded command /${cmd.name} ('${cmd.type}' type)`]
        ])
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
                addLog(logs, [
                    ['zh-cn', `${prefix(level)}$ /${cmd.name} 已经存在`],
                    ['en-us', `${prefix(level)}$ /${cmd.name} already exists`]
                ])
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
        let cr = await checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level)
        // console.log(cr)
        if (cr === false) {
            addLog(logs, [
                ['zh-cn', `${prefix(level)}* 前置条件不成立！跳过 '${cmd.name}' 指令`],
                ['en-us', `${prefix(level)}* Precondition does not match, skip '${cmd.name}' command`]
            ])
            return null
        }
        // 3、检查指令权限
        // 非引用指令才有必要检查
        if (cmd.target.indexOf('/') < 0) {
            // 以 JBDAP_ 开头的系统内置表均不可被前端访问
            if (cmd.target.indexOf('JBDAP_') === 0) $throwError('AuthError',null,null,[
                ['zh-cn', `没有权限执行当前指令 '${cmd.name}'`],
                ['en-us', `No authority to handle current command '${cmd.name}'`]
            ])
            // 调用自定义权限控制函数进行检查
            if (_.isFunction(doorman)) {
                let data = null
                // 删和改操作需要对目标数据进行预校验
                let operations = [
                    'update',
                    'delete',
                    'increase',
                    'decrease'
                ]
                if (operations.indexOf(cmd.type) >= 0) {
                    // 将当前 cmd 改为 values 查询获取包含所有 id 的数组
                    let qCmd = _.cloneDeep(cmd)
                    qCmd.type = 'values'
                    // 只查询 id 字段
                    qCmd.fields = ['pick#' + $primaryKey + '=>ids']
                    delete qCmd.data
                    data = (await queryCmd(knex,trx,doorman,scanner,false,qCmd,parent,root,logs,user,commands,level)).ids
                    // console.log(data)
                }
                if (cmd.type === 'create') data = cmd.data
                // 传给检验函数
                let authorized = true
                try {
                    // 没有定义则生成一个
                    if (_.isFunction(doorman)) authorized = await doorman(user,cmd,data)
                }
                catch (err) {
                    $throwError('AuthError',err,null,[
                        ['zh-cn', `没有权限执行当前指令 '${cmd.name}'`],
                        ['en-us', `No authority to handle current command '${cmd.name}'`]
                    ])
                }
                if (authorized === false) $throwError('AuthError',null,null,[
                    ['zh-cn', `没有权限执行当前指令 '${cmd.name}'`],
                    ['en-us', `No authority to handle current command '${cmd.name}'`]
                ])
            }
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
            addLog(logs, [
                ['zh-cn', `${prefix(level)}# 开始执行后置指令`],
                ['en-us', `${prefix(level)}# Subsequent commands begin`]
            ])
            let afterCmds = cmd.after
            if (!_.isArray(cmd.after)) afterCmds = [cmd.after]
            for (let i=0; i<afterCmds.length; i++) {
                // 只执行不返回
                let temp = await handleCmd(knex,trx,doorman,scanner,false,afterCmds[i],result,root,logs,user,commands,level+2)
                // console.log(temp)
            }
            addLog(logs, [
                ['zh-cn', `${prefix(level)}# 后置指令执行完毕`],
                ['en-us', `${prefix(level)}# Subsequent commands finished`]
            ])
        }
        if (isTop === true) addLog(logs, [
            ['zh-cn', `${prefix(level)}$ 顶层命令 /${cmd.name} 执行完毕`],
            ['en-us', `${prefix(level)}$ Top command /${cmd.name} finished`]
        ])
        else addLog(logs, [
            ['zh-cn', `${prefix(level)}@ 级联指令 /${cmd.name} 执行完毕`],
            ['en-us', `${prefix(level)}@ Cascaded command '${cmd.name}' finished`]
        ])
        return result
    }
    catch (err) {
        if (isTop === true) addLog(logs, [
            ['zh-cn', `${prefix(level)}$ 执行顶层命令 /${cmd.name} 出错`],
            ['en-us', `${prefix(level)}$ Error occurred in top command /${cmd.name}`]
        ])
        else addLog(logs, [
            ['zh-cn', `${prefix(level)}@ 执行级联指令 /${cmd.name} 出现错误`],
            ['en-us', `${prefix(level)}$ Error occurred in cascaded command /${cmd.name}`]
        ])
        $throwError('CommandHandlerError',err,null,[
            ['zh-cn', `处理指令 '${cmd.name}' 出错`],
            ['en-us', `Error occurred while handling command '${cmd.name}'`]
        ])
    }
}

/**
 * 写入日志
 * @param {array} logs 日志存储列表
 * @param {array} dict 不同语言日志内容
 */
function addLog(logs,dict) {
    for (let i=0; i<dict.length; i++) {
        let item = dict[i]
        if (item[0] === $i18nLang) {
            logs.push(item[1])
            break
        }
    }
}

/**
 * 根据缩进增加空格
 * @param {integer} n 缩进层次
 */
function prefix(n) {
    let result = ''
    for (let i=1; i<n; i++) result += '  '
    return result
}

/**
 * 执行单个查询指令
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 */
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
                else $throwError('RefDefError',null,null,[
                    ['zh-cn', `被引用对象 '/${objName}' 不存在于 commands 指令集中`],
                    ['en-us', `The referred target '/${objName}' doesn't exist in commands`]
                ])
            }
            // 被引用数据
            let rawData = root[objName].data
            if (_.isNull(rawData)) $throwError('RefDefError',null,null,[
                ['zh-cn', `被引用对象 '/${objName}' 不能为 null`],
                ['en-us', `The referred target '/${objName}' can not be a null`]
            ])
            // 级联属性
            if (_.isPlainObject(rawData)) {
                let slices = cmd.target.split('/')[1].split('.')
                if (slices.length > 1) {
                    for (let i=1; i<slices.length; i++) {
                        if (Object.keys(rawData).indexOf(slices[i]) < 0) $throwError('RefDefError',null,null,[
                            ['zh-cn', `引用对象有误，不存在 '${cmd.target}' 路径`],
                            ['en-us', `The referred path '${cmd.target}' does not exist`]
                        ])
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
            else $throwError('RefValueError',null,null,[
                ['zh-cn', `被引用对象 '${cmd.target}' 必须是 Array 或者 Object 类型`],
                ['en-us', `The referred target '${cmd.target}' must be an Array or an Object`]
            ])
        }
        else {
            // 数据表查询开始 ==>
            // 0、检查 query 是否合法
            validator.checkQuery(cmd.query)
            // 1、定位到数据表
            let query = knex.from(cmd.target)
            if (trx !== null) query = trx(cmd.target)
            // 2、设定要查询的原始字段
            // 能够使用 sql 函数的计算类型
            let toolingTypes = [
                'first',
                'pick',
                'clone',
            ]
            // values 计算存在不能使用 sql 函数得到结果的查询时，就必须查出所有数据
            let needList = _.findIndex(valuesFields, (item) => { return toolingTypes.indexOf(item.operator) >= 0 }) >= 0
            if (cmd.type !== 'values' || (cmd.type === 'values' && needList)) {
                if (rawFields === '*') query = query.select()
                else query = query.column(rawFields).select()
            }
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
            // 只用 sql 函数就可以实现的 values 查询
            if (cmd.type === 'values' && needList === false) {
                if (valuesFields.length === 0) $throwError('FieldsDefError',null,null,[
                    ['zh-cn', `'values' 查询类型至少要定义一个取值字段`],
                    ['en-us', `Queries of type 'values' require at least one value field`]
                ])
                for (let i=0; i<valuesFields.length; i++) {
                    // 传入查询结果进行处理
                    let item = valuesFields[i]
                    let slices = item.fields.split(',')
                    if (slices.length > 1) $throwError('FieldsDefError',null,null,[
                        ['zh-cn', `'${item.operator}' 运算只接受一个字段`],
                        ['en-us', `Calculations of type '${item.operator}' accept only one field`]
                    ])
                    query = eval(`query.${item.operator}({ ${item.name}: '${slices[0]}' })`)
                }
                console.log('sql:',query.toString())
                let list = await query
                result = list[0]
            }
            else {
                console.log('sql:',query.toString())
                result = await query
            }
            // console.log('result',result)
            // 5、敏感字段过滤
            // 非引用类型才需要过滤
            if (cmd.target.indexOf('/') < 0) {
                if (_.isFunction(scanner)) result = scanner(user,cmd,fields,result)
            }
            // 6、如果是 values 取值查询，则执行相应的数据处理
            if (cmd.type === 'values' && needList === true) {
                if (valuesFields.length === 0) $throwError('FieldsDefError',null,null,[
                    ['zh-cn', `'values' 查询类型至少要定义一个取值字段`],
                    ['en-us', `Queries of type 'values' require at least one value field`]
                ])
                let values = {}
                for (let i=0; i<valuesFields.length; i++) {
                    // 传入查询结果进行处理
                    let item = valuesFields[i]
                    if (Object.keys(values).indexOf(item.name) >= 0) $throwError('FieldsDefError',null,null,[
                        ['zh-cn', `'fields' 中定义的别名有重复`],
                        ['en-us', `'fields' property contains conflict alias definition`]
                    ])
                    values[item.name] = calculator.getValue(result,item)
                }
                result = values
            }
            // console.log('values',values)
        }
        // 7、填充级联字段
        if (cmd.type !== 'values') {
            for (let i=0; i<result.length; i++) {
                // entity 只填充第一行
                if (cmd.type === 'entity' && i > 0) break
                let item = result[i]
                for (let i=0; i<cascadedFields.length; i++) {
                    let key = cascadedFields[i].name
                    if (_.isUndefined(key)) $throwError('CmdDefError',null,null,[
                        ['zh-cn', `级联字段定义错误，'name' 属性是必须的`],
                        ['en-us', `Cascaded fields definition is invalid, requires a 'name' property`]
                    ])
                    item[key] = await handleCmd(knex,trx,doorman,scanner,false,cascadedFields[i],item,root,logs,user,commands,level+1)
                }
            }
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
        $throwError('DBQueryError',err,null,[
            ['zh-cn', `查询数据出错`],
            ['en-us', `Error occurred while querying data`]
        ])
    }
}

/**
 * 执行单个操作指令
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 */
async function executeCmd(knex,trx,doorman,scanner,isTop,cmd,parent,root,logs,user,commands) {
    // 查询类指令
    let result = null
    try {
        // console.log('executeCmd',cmd.name)
        // 判断查询类型
        if (cmd.target.indexOf('/') >= 0) $throwError('TargetDefError',null,null,[
            ['zh-cn', `操作类指令 'target' 不能是引用对象`],
            ['en-us', `A referred object can not be the 'target' in '${cmd.type}' commands`]
        ])
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
                if (cmd.type === 'create') query = query.insert(cmd.data,[$primaryKey])
                if (cmd.type === 'update') query = query.update(cmd.data[0],[$primaryKey])
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
        $throwError('DBExecError',err,null,[
            ['zh-cn', `操作数据出错`],
            ['en-us', `Error occurred while operating data`]
        ])
    }
}

/**
 * 拼组 where 查询条件
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {boolean} isTop 是否顶层指令
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 */
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
        $throwError('WhereParserError',err,null,[
            ['zh-cn', `'where' 条件解析出错`],
            ['en-us', `Error occurred while parsing 'where' conditions`]
        ])
    }
}

/**
 * 拼组 where 分组查询条件
 * @param {object} obj 分组条件
 * @param {object} type 分组类别
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {boolean} isTop 是否顶层指令
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 */
async function getSubConditionFunc(obj,type,cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level) {
    if (Object.prototype.toString.call(obj) !== '[object Object]') $throwError('WhereDefError',null,null,[
        ['zh-cn', `where 子查询条件不正确，'$${type}' 的值必须是 Object 类型`],
        ['en-us', `Invalid sub condition definition, value of '$${type}' must be an Object`]
    ])
    try {
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
                        else $throwError('WhereDefError',null,null,[
                            ['zh-cn', `'where' 查询中的被引用对象 '/${ref}' 不存在于 commands 指令集中`],
                            ['en-us', `The referred target '/${ref}' in 'where' conditions doesn't exist in commands`]
                        ])
                    }
                    else $throwError('WhereValueError',null,null,[
                        ['zh-cn', `'where' 条件赋值出错`],
                        ['en-us', `Error occurred while setting values for 'where' conditions`]
                    ])
                }
                // 后拼组查询条件
                let left = comparision.left, right = comparision.right, operator = comparision.operator
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
                        $throwError('WhereDefError',null,null,[
                            ['zh-cn', `运算符 '${operator}' 不存在`],
                            ['en-us', `Operator '${operator}' does not exist`]
                        ])
                }
            }
        }
        funcDefine += ' }'
        return funcDefine
    }
    catch (err) {
        $throwError('SubWhereParserError',err,null,[
            ['zh-cn', `'where' 子条件解析出错`],
            ['en-us', `Error occurred while parsing 'where' sub conditions`]
        ])
    }
}

/**
 * 前置条件是否成立
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {boolean} isTop 是否顶层指令
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 */
async function checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,isTop,logs,user,commands,level) {
    try {
        // console.log('checkOnlyIf',cmd.name)
        if (_.isUndefined(cmd.onlyIf)) return true
        if (Object.prototype.toString.call(cmd.onlyIf) === '[object Object]') {
            return calculator.checkCondition(cmd.onlyIf,'and',parent,root,null)
        }
    }
    catch (err) {
        if (err.name === 'ConditionCalError' && err.fullMessage().indexOf('[TagRefNotFilled]') > 0) {
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
            else $throwError('OnlyIfDefError',null,null,[
                ['zh-cn', `'onlyIf' 条件中的被引用对象 '/${ref}' 不存在于 commands 指令集中`],
                ['en-us', `The referred target '/${ref}' in 'onlyIf' conditions doesn't exist in commands`]
            ])
        }
        else $throwError('OnlyIfError',err,null,[
            ['zh-cn', `'onlyIf' 条件解析出错`],
            ['en-us', `Error occurred while parsing 'onlyIf' conditions`]
        ])
    }
}

