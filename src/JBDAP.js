/**
 * JBDAP-Node-Engine 入口
 */

// 运行环境准备
import { JS, JE } from './global'

// 引入其它模块
import parser from './parser'
import validator from './validator'
import calculator from './calculator'
import reference from './reference'

// 包的版本
import { version } from '../package.json'
module.exports.version = version

// 将自带的 knex 暴露出来供调用
module.exports.knex = JS.knex

/**
 * 解析并执行 json 中的指令
 * @param {object} knex 数据库连接对象
 * @param {object} json 要执行的 JBDAP 参数
 * @param {object} configs 配置参数
 */
async function manipulate(knex,json,configs) {
    configs = configs || {}
    // 全局默认值
    if (JS._.isString(configs.serverName) && configs.serverName !== '') JE.dbServer = configs.serverName
    if (JS._.isString(configs.primaryKey) && configs.primaryKey !== '') JE.primaryKey = configs.primaryKey
    if (JS._.isString(configs.language) && configs.language !== '') JE.i18nLang = configs.language
    // 调用端是否有提示语言设定
    let lang = JE.i18nLang
    if (!JS._.isUndefined(json.i18nLang)) {
        // 目前仅支持中文和英文
        let langs = [
            'zh-cn',
            'en-us'
        ]
        // 有效的语言
        if (langs.indexOf(json.i18nLang) >= 0) lang = json.i18nLang
    }
    // 执行完成后返回的结果
    let returnObj = {
        code: 200,
        message: 'ok',
        data: {}
    }
    // 执行过程日志
    let logs = []
    try {
        addLog(logs, [
            ['zh-cn', '- 开启 JBDAP 任务'],
            ['en-us', '- JBDAP task begins']
        ],lang)
        // 1、验证参数是否合法
        addLog(logs, [
            ['zh-cn', '- 检查接收到的 JSON 是否合法'],
            ['en-us', '- Check JSON validity']
        ],lang)
        validator.checkJson(json,lang)
        // 2、取得当前用户用户账号及权限定义
        addLog(logs, [
            ['zh-cn', '* 识别用户身份'],
            ['en-us', '* Get user identity']
        ],lang)
        let user = {}
        if (JS._.isFunction(configs.recognizer)) user = await configs.recognizer(json.security || {},lang)
        // 3、定义要用到的变量
        // root 用于保存数据的临时空间
        let root = {}
        let commands = json.commands
        // 单个指令转数组
        if (JS._.isPlainObject(json.commands)) commands = [commands]
        // 4、开始执行
        addLog(logs, [
            ['zh-cn', '- 开始处理接收到的指令'],
            ['en-us', '- Proceed to handle commands']
        ],lang)
        await proceed(knex,configs.doorman,configs.scanner,configs.dispatcher,commands,json.isTransaction,root,logs,user,lang)
        addLog(logs, [
            ['zh-cn', '- 全部指令处理完成'],
            ['en-us', '- All commands handled successfully']
        ],lang)
        addLog(logs, [
            ['zh-cn', '- JBDAP 任务成功'],
            ['en-us', '- JBDAP task succeeded']
        ],lang)
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
        if (json.needLogs === true) returnObj.logs = logs
        return returnObj
    }
    catch (err) {
        addLog(logs, [
            ['zh-cn', '- JBDAP 任务失败'],
            ['en-us', '- JBDAP task failed']
        ],lang)
        // 根据错误提示来给出错误码
        returnObj.code = 500
        let msg = err.fullMessage()
        // 参数定义错误
        if (
            msg.indexOf('DefError]') >= 0 
            || msg.indexOf('TypeError]') >= 0 
            || msg.indexOf('MissingError]') >= 0 
            || msg.indexOf('EmptyError]') >= 0 
            || msg.indexOf('ValueInvalidError]') >= 0 
            || msg.indexOf('SpilthError]') >= 0 
            || msg.indexOf('[SqlInjectionError]') >= 0
        ){
            returnObj.code = 400
        }
        // 没有操作权限
        if (msg.indexOf('[AuthError]') >= 0) returnObj.code = 403
        returnObj.message = err.fullMessage()
        returnObj.data = null
        // 返回日志
        if (json.needLogs === true) returnObj.logs = logs
        // 返回错误堆栈信息跟踪
        if (json.needTrace === true) returnObj.trace = err.fullStack()
        return returnObj
    }
}
module.exports.manipulate = manipulate

/**
 * 开始执行指令
 * @param {object} knex knex 实例
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {function} dispatcher 服务端函数执行器
 * @param {array} commands 指令集
 * @param {boolean} isTrans 是否事务
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {string} lang 提示信息所用语言
 */
async function proceed(knex,doorman,scanner,dispatcher,commands,isTrans,root,logs,user,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 检查是否以事务执行
    if (isTrans === true) {
        addLog(logs, [
            ['zh-cn', '- 以事务方式执行'],
            ['en-us', '- Commands will be handled as a transaction']
        ],lang)
        await knex.transaction(async function(trx) {
            // 这里开始事务
            try {
                // 递归执行 commands 中的指令
                for (let i=0; i<commands.length; i++) {
                    let cmd = commands[i]
                    // 检查顶层指令是否合法
                    validator.checkTopCommand(cmd,lang)
                    // 执行顶层指令
                    addLog(logs, [
                        ['zh-cn', `${prefix(1)}$ 开始执行顶层命令 /${cmd.name} [${cmd.type} 类型]`],
                        ['en-us', `${prefix(1)}$ Begin to handle top command /${cmd.name} ['${cmd.type}' type]`]
                    ],lang)
                    await handleCmd(knex,trx,doorman,scanner,dispatcher,true,cmd,null,root,logs,user,commands,1,lang)
                    addLog(logs, [
                        ['zh-cn', `${prefix(1)}$ 顶层命令 /${cmd.name} 执行完毕`],
                        ['en-us', `${prefix(1)}$ Top command /${cmd.name} finished`]
                    ],lang)
                }
                addLog(logs, [
                    ['zh-cn', '- 事务执行成功'],
                    ['en-us', '- Transaction succeeded']
                ],lang)
                return true
            }
            catch (err) {
                addLog(logs, [
                    ['zh-cn', '- 事务失败，数据回滚'],
                    ['en-us', '- Transaction failed, data has been rolled back']
                ],lang)
                JS.throwError('TransactionError',err,null,[
                    ['zh-cn','解析或执行事务失败'],
                    ['en-us','Proceed transaction failed']
                ],lang)
            }
        })
    }
    else {
        try {
            addLog(logs, [
                ['zh-cn', '- 非事务方式执行'],
                ['en-us', '- Commands will be handled in non-transaction mode']
            ],lang)
            // 递归执行 commands 中的指令
            for (let i=0; i<commands.length; i++) {
                let cmd = commands[i]
                // 检查顶层指令是否合法
                validator.checkTopCommand(cmd,lang)
                // 执行顶层指令
                addLog(logs, [
                    ['zh-cn', `${prefix(1)}$ 开始执行顶层命令 /${cmd.name} [${cmd.type} 类型]`],
                    ['en-us', `${prefix(1)}$ Begin to handle top command /${cmd.name} ['${cmd.type}' type]`]
                ],lang)
                await handleCmd(knex,null,doorman,scanner,dispatcher,true,cmd,null,root,logs,user,commands,1,lang)
                addLog(logs, [
                    ['zh-cn', `${prefix(1)}$ 顶层命令 /${cmd.name} 执行完毕`],
                    ['en-us', `${prefix(1)}$ Top command /${cmd.name} finished`]
                ],lang)
            }
        }
        catch (err) {
            JS.throwError('CommandsExecError',err,null,[
                ['zh-cn','解析或执行指令失败'],
                ['en-us','Proceed commands failed']
            ],lang)
        }
    }
}

/**
 * 处理单个指令
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 * @param {string} lang 提示信息所用语言
 */
async function handleCmd(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,level,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    try {
        // console.log('handleCmd',cmd.name)
        let result = null
        // 执行指令
        if (isTop) {
            // 1、检查缓存空间是否已经存在
            if (Object.keys(root).indexOf(cmd.name) >= 0) {
                addLog(logs, [
                    ['zh-cn', `${prefix(level)}$ /${cmd.name} 已经存在`],
                    ['en-us', `${prefix(level)}$ /${cmd.name} already exists`]
                ],lang)
                return root[cmd.name].data
            }
            // 顶层命令需要创建缓存空间
            root[cmd.name] = {
                return: cmd.return || true,
                error: null,
                data: null
            }
        }
        // 2、检查 onlyIf 前置条件
        let cr = await checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang)
        // console.log(cr)
        if (cr === false) {
            addLog(logs, [
                ['zh-cn', `${prefix(level)}* 前置条件不成立！跳过 '${cmd.name}' 指令`],
                ['en-us', `${prefix(level)}* Precondition does not match, skip '${cmd.name}' command`]
            ],lang)
            return null
        }
        // 3、检查指令权限
        // 非引用指令才有必要检查
        if (cmd.target.indexOf('/') < 0) {
            // 以 JBDAP_ 开头的系统内置表均不可被前端访问
            if (cmd.target.indexOf('JBDAP_') === 0) JS.throwError('AuthError',null,null,[
                ['zh-cn', `没有权限执行当前指令 '${cmd.name}'`],
                ['en-us', `No authority to handle current command '${cmd.name}'`]
            ],lang)
            // 调用自定义权限控制函数进行检查
            if (JS._.isFunction(doorman)) {
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
                    let qCmd = JS._.cloneDeep(cmd)
                    qCmd.type = 'list'
                    // 只查询 id 字段
                    qCmd.fields = ['*']
                    delete qCmd.data
                    data = await queryCmd(knex,trx,doorman,scanner,dispatcher,false,qCmd,parent,root,logs,user,commands,level,lang)
                    // console.log(data)
                }
                if (cmd.type === 'create') {
                    if (JS._.isPlainObject(cmd.data)) cmd.data = [cmd.data]
                }
                // 传给检验函数
                let authorized = true
                try {
                    let queryTypes = [
                        'list',
                        'entity',
                        'values'
                    ]
                    if (JS._.isFunction(doorman)) {
                        // 操作类提前验证权限，查询类获得结果后再验证
                        if (queryTypes.indexOf(cmd.type) < 0) authorized = await doorman(user,cmd,data,lang)
                    }
                }
                catch (err) {
                    JS.throwError('AuthError',err,null,[
                        ['zh-cn', `不被许可执行当前指令 '${cmd.name}'`],
                        ['en-us', `No permission to handle current command '${cmd.name}'`]
                    ],lang)
                }
                if (authorized === false) JS.throwError('AuthError',null,null,[
                    ['zh-cn', `不被许可执行当前指令 '${cmd.name}'`],
                    ['en-us', `No permission to handle current command '${cmd.name}'`]
                ],lang)
            }
        }
        // 4、对指令进行分类执行
        switch (cmd.type) {
            case 'entity':
            case 'list':
            case 'values':
                // 查询类指令
                result = await queryCmd(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,level,lang)
                break
            case 'create':
            case 'update':
            case 'delete':
            case 'increase':
            case 'decrease':
                // 操作类指令
                result = await executeCmd(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,lang)
                break
            case 'function':
                // 服务端函数
                result = await executeFunction(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,lang)
                break
        }
        // 5、执行 after 定义的后续指令
        validator.checkAfter(cmd.after,lang)
        if (!JS._.isUndefined(cmd.after)) {
            addLog(logs, [
                ['zh-cn', `${prefix(level+1)}# 开始执行后置指令`],
                ['en-us', `${prefix(level+1)}# Subsequent commands begin`]
            ],lang)
            let afterCmds = cmd.after
            if (!JS._.isArray(cmd.after)) afterCmds = [cmd.after]
            for (let i=0; i<afterCmds.length; i++) {
                let afterCmd = afterCmds[i]
                // 检查指令是否合法
                validator.checkCommand(afterCmd,lang)
                addLog(logs, [
                    ['zh-cn', `${prefix(level+2)}$ 开始执行指令${i+1} /${afterCmd.name} [${afterCmd.type} 类型]`],
                    ['en-us', `${prefix(level+2)}$ Begin to handle command${i+1} /${afterCmd.name} ['${afterCmd.type}' type]`]
                ],lang)
                // 只执行不返回
                let temp = await handleCmd(knex,trx,doorman,scanner,dispatcher,false,afterCmd,result,root,logs,user,commands,level+2,lang)
                // console.log(temp)
                addLog(logs, [
                    ['zh-cn', `${prefix(level+2)}$ 指令${i+1} /${afterCmd.name} 执行完毕]`],
                    ['en-us', `${prefix(level+2)}$ Command${i+1} /${afterCmd.name} finished`]
                ],lang)                
            }
            addLog(logs, [
                ['zh-cn', `${prefix(level+1)}# 后置指令执行完毕`],
                ['en-us', `${prefix(level+1)}# Subsequent commands finished`]
            ],lang)
        }
        return result
    }
    catch (err) {
        if (isTop === true) addLog(logs, [
            ['zh-cn', `${prefix(level)}$ 执行顶层命令 /${cmd.name} 出错`],
            ['en-us', `${prefix(level)}$ Error occurred in top command /${cmd.name}`]
        ],lang)
        else addLog(logs, [
            ['zh-cn', `${prefix(level)}@ 执行级联指令 /${cmd.name} 出现错误`],
            ['en-us', `${prefix(level)}$ Error occurred in cascaded command /${cmd.name}`]
        ],lang)
        JS.throwError('CommandHandlerError',err,null,[
            ['zh-cn', `处理指令 '${cmd.name}' 出错`],
            ['en-us', `Error occurred while handling command '${cmd.name}'`]
        ],lang)
    }
}

/**
 * 写入日志
 * @param {array} logs 日志存储列表
 * @param {array} dict 不同语言日志内容
 * @param {string} lang 提示信息所用语言
 */
function addLog(logs,dict,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    for (let i=0; i<dict.length; i++) {
        let item = dict[i]
        if (item[0] === lang) {
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
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 * @param {string} lang 提示信息所用语言
 */
async function queryCmd(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,level,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 查询类指令
    let result = null
    try {
        // console.log('queryCmd',cmd.name)
        // 取得要获取的字段
        let fields = parser.parseFields(cmd.fields,lang)
        let rawFields = fields.raw
        let cascadedFields = fields.cascaded
        let valuesFields = fields.values
        // 判断查询类型 [引用|读表]
        if (cmd.target.indexOf('/') === 0) {
            // 引用查询开始 ==>
            let objName = cmd.target.split('/')[1].split('.')[0]
            // 检查被引用数据是否填充，没有则先填充
            let idx = JS._.findIndex(commands,{ name: objName })
            if (Object.keys(root).indexOf(objName) < 0) {
                // 检查是否存在该引用
                if (idx >= 0) {
                    // 存在同名的指令
                    let command = commands[idx]
                    // 检查指令是否合法
                    validator.checkTopCommand(command,lang)
                    addLog(logs, [
                        ['zh-cn', `${prefix(level+1)}$ 开始执行顶层命令 /${command.name} [${command.type} 类型]`],
                        ['en-us', `${prefix(level+1)}$ Begin to handle top command /${command.name} ['${command.type}' type]`]
                    ],lang)
                    // 执行查询
                    await handleCmd(knex,trx,doorman,scanner,dispatcher,isTop,command,parent,root,logs,user,commands,level+1,lang)
                    addLog(logs, [
                        ['zh-cn', `${prefix(level+1)}$ 顶层命令 /${command.name} 执行完毕`],
                        ['en-us', `${prefix(level+1)}$ Top command /${command.name} finished`]
                    ],lang)
                }
                else JS.throwError('RefDefError',null,null,[
                    ['zh-cn', `被引用对象 '/${objName}' 不存在于 commands 指令集中`],
                    ['en-us', `The referred target '/${objName}' doesn't exist in commands`]
                ],lang)
            }
            // 被引用数据
            let rawData = root[objName].data
            if (JS._.isNull(rawData)) JS.throwError('RefDefError',null,null,[
                ['zh-cn', `被引用对象 '/${objName}' 不能为 null`],
                ['en-us', `The referred target '/${objName}' can not be a null`]
            ],lang)
            // 级联属性
            if (JS._.isPlainObject(rawData)) {
                let slices = cmd.target.split('/')[1].split('.')
                if (slices.length > 1) {
                    for (let i=1; i<slices.length; i++) {
                        if (Object.keys(rawData).indexOf(slices[i]) < 0) JS.throwError('RefDefError',null,null,[
                            ['zh-cn', `引用对象有误，不存在 '${cmd.target}' 路径`],
                            ['en-us', `The referred path '${cmd.target}' does not exist`]
                        ],lang)
                        rawData = rawData[slices[i]]
                    }
                }
            }
            // 根据 cmd.type 和被引用数据类型来判断调用那个函数
            if (JS._.isArray(rawData)) {
                // 从数组中取出单个 entity
                if (cmd.type === 'entity') result = reference.getObjFromList(rawData,cmd.query,rawFields,parent,root,lang)
                // 从数组中取出 list
                if (cmd.type === 'list') result = reference.getListFromList(rawData,cmd.query,rawFields,parent,root,lang)
                // 对数组进行计算得到 values
                if (cmd.type === 'values') result = reference.getValuesFromList(rawData,valuesFields,lang)
            }
            else if (JS._.isPlainObject(rawData)) {
                // 从 object 中取子集 object
                result = reference.getObjFromObj(rawData,rawFields,lang)
            }
            else JS.throwError('RefValueError',null,null,[
                ['zh-cn', `被引用对象 '${cmd.target}' 必须是 Array 或者 Object 类型`],
                ['en-us', `The referred target '${cmd.target}' must be an Array or an Object`]
            ],lang)
        }
        else {
            // 数据表查询开始 ==>
            // 0、检查 query 是否合法
            validator.checkQuery(cmd.query,lang)
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
            let needList = JS._.findIndex(valuesFields, (item) => { return toolingTypes.indexOf(item.operator) >= 0 }) >= 0
            if (cmd.type !== 'values' || (cmd.type === 'values' && needList)) {
                if (rawFields === '*') query = query.select()
                else query = query.column(rawFields).select()
            }
            // 3、是否有定义查询规则
            if (!JS._.isUndefined(cmd.query)) {
                // 3.1、解析 where
                let func = await getWhereFunc(cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang)
                // console.log(func)
                if (func !== null) query = eval('query.where(' + func + ')')
                // 3.2、解析 order
                let order = parser.parseOrder(cmd.query.order,lang)
                if (order.length > 0) query = query.orderBy(order)
                // 3.3、解析 size 和 page
                let pas = parser.parseOffsetAndLimit(cmd.query.page,cmd.query.size,lang)
                // 取有限记录
                if (pas.limit > 0) query = query.limit(pas.limit)
                // 有翻页
                if (pas.offset > 0) query = query.offset(pas.offset)
            }
            // 4、执行查询
            // 只用 sql 函数就可以实现的 values 查询
            if (cmd.type === 'values' && needList === false) {
                if (valuesFields.length === 0) JS.throwError('FieldsDefError',null,null,[
                    ['zh-cn', `'values' 查询类型至少要定义一个取值字段`],
                    ['en-us', `Queries of type 'values' require at least one value field`]
                ],lang)
                for (let i=0; i<valuesFields.length; i++) {
                    // 传入查询结果进行处理
                    let item = valuesFields[i]
                    let slices = item.fields.split(',')
                    if (slices.length > 1) JS.throwError('FieldsDefError',null,null,[
                        ['zh-cn', `'${item.operator}' 运算只接受一个字段`],
                        ['en-us', `Calculations of type '${item.operator}' accept only one field`]
                    ],lang)
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
            // 5、传给检验函数进行权限验证
            let authorized = true
            try {
                if (JS._.isFunction(doorman)) {
                    // 操作类提前验证权限，查询类获得结果后再验证
                    authorized = await doorman(user,cmd,result,cmd.data,lang)
                }
            }
            catch (err) {
                JS.throwError('AuthError',err,null,[
                    ['zh-cn', `不被许可执行当前指令 '${cmd.name}'`],
                    ['en-us', `No permission to handle current command '${cmd.name}'`]
                ],lang)
            }
            if (authorized === false) JS.throwError('AuthError',null,null,[
                ['zh-cn', `不被许可执行当前指令 '${cmd.name}'`],
                ['en-us', `No permission to handle current command '${cmd.name}'`]
            ],lang)
            // 6、敏感字段过滤
            // 在 values 计算前就进行过滤
            // 非引用类型才需要过滤
            if (cmd.target.indexOf('/') < 0) {
                if (JS._.isFunction(scanner)) result = await scanner(user,cmd,fields.raw,result,lang)
            }
            // 7、如果是 values 取值查询，则执行相应的数据处理
            if (cmd.type === 'values' && needList === true) {
                if (valuesFields.length === 0) JS.throwError('FieldsDefError',null,null,[
                    ['zh-cn', `'values' 查询类型至少要定义一个取值字段`],
                    ['en-us', `Queries of type 'values' require at least one value field`]
                ],lang)
                let values = {}
                for (let i=0; i<valuesFields.length; i++) {
                    // 传入查询结果进行处理
                    let item = valuesFields[i]
                    if (Object.keys(values).indexOf(item.name) >= 0) JS.throwError('FieldsDefError',null,null,[
                        ['zh-cn', `'fields' 中定义的别名有重复`],
                        ['en-us', `'fields' property contains conflict alias definition`]
                    ],lang)
                    values[item.name] = calculator.getValue(result,item,lang)
                }
                result = values
            }
            // console.log('values',values)
        }
        // 8、填充级联字段
        if (cmd.type !== 'values') {
            if (result.length > 0 && cascadedFields.length > 0) {
                for (let j=0; j<cascadedFields.length; j++) {
                    let command = cascadedFields[j]
                    let key = command.name
                    // 检查指令是否合法
                    validator.checkCommand(command,lang)
                    addLog(logs, [
                        ['zh-cn', `${prefix(level+1)}$ 开始填充级联字段 [${key}]`],
                        ['en-us', `${prefix(level+1)}$ Begin to fill cascaded field [${fields}]`]
                    ],lang)
                    for (let i=0; i<result.length; i++) {
                        // entity 只填充第一行
                        if (cmd.type === 'entity' && i > 0) break
                        let item = result[i]
                        item[key] = await handleCmd(knex,trx,doorman,scanner,dispatcher,false,command,item,root,logs,user,commands,level+1,lang)
                    }
                    addLog(logs, [
                        ['zh-cn', `${prefix(level+1)}$ 级联字段 [${key}] 填充完毕`],
                        ['en-us', `${prefix(level+1)}$ Filling cascaded field [${key}] finished`]
                    ],lang)
                }
            }
        }
        // 整理返回值
        if (cmd.type === 'entity') {
            if (JS._.isArray(result) && result.length === 0) result = null
            else if (JS._.isArray(result)) result = result[0]
            if (isTop) root[cmd.name].data = result
        }
        if (cmd.type === 'list') {
            if (JS._.isArray(result) && result.length === 0) result = null
            if (isTop) root[cmd.name].data = result
        }
        if (cmd.type === 'values') {
            if (isTop) root[cmd.name].data = result
        }
        // 返回
        return result
    }
    catch (err) {
        JS.throwError('DBQueryError',err,null,[
            ['zh-cn', `查询数据出错`],
            ['en-us', `Error occurred while querying data`]
        ],lang)
    }
}

/**
 * 执行单个操作指令
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {string} lang 提示信息所用语言
 */
async function executeCmd(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 查询类指令
    let result = null
    try {
        // console.log('executeCmd',cmd.name)
        // 判断查询类型
        if (cmd.target.indexOf('/') >= 0) JS.throwError('TargetDefError',null,null,[
            ['zh-cn', `操作类指令 'target' 不能是引用对象`],
            ['en-us', `A referred object can not be the 'target' in '${cmd.type}' commands`]
        ],lang)
        else {
            // 数据表操作开始
            // 0、检查 query 是否合法
            // 只有 create 不需要 query 查询属性
            if (cmd.type !== 'create') validator.checkQuery(cmd.query,lang)
            // 1、定位到数据表
            let query = knex(cmd.target)
            if (trx !== null) query = trx(cmd.target)
            // 2、是否有定义查询规则
            if (!JS._.isUndefined(cmd.query)) {
                // 3.1、解析 where
                let func = await getWhereFunc(cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,lang)
                if (func !== null) query = eval('query.where(' + func + ')')
                // 3.2、解析 order
                let order = parser.parseOrder(cmd.query.order,lang)
                if (order.length > 0) query = query.orderBy(order)
                // 3.3、解析 size 和 page
                let pas = parser.parseOffsetAndLimit(cmd.query.page,cmd.query.size,lang)
                // 取有限记录
                if (pas.limit > 0) query = query.limit(pas.limit)
                // 有翻页
                if (pas.offset > 0) query = query.offset(pas.offset)
            }
            // 3、检查 data 是否合法
            validator.checkData(cmd.type,cmd.data,lang)
            // 4、执行操作
            if (cmd.type === 'delete') query = query.delete()
            // increase 和 decrease 需要特殊整理 data 数据后执行
            else if (cmd.type === 'increase' || cmd.type === 'decrease') {
                if (JS._.isString(cmd.data)) cmd.data = parser.parseDataString(cmd.data,lang)
                if (cmd.type === 'increase') query = query.increment(cmd.data)
                if (cmd.type === 'decrease') query = query.decrement(cmd.data)
            }
            else {
                // 数据预处理
                if (JS._.isPlainObject(cmd.data)) cmd.data = [cmd.data]
                for (let i=0; i<cmd.data.length; i++) {
                    let item = cmd.data[i]
                    // 自动填充 createdAt 和 updatedAt
                    if (cmd.type === 'create' && !item.createdAt) item.createdAt = new Date().toISOString()
                    if (!item.updatedAt) item.updatedAt = new Date().toISOString()
                    // 执行内置函数，防 xss 处理
                    let keys = Object.keys(item)
                    for (let j=0; j<keys.length; j++) {
                        let key = keys[j]
                        if (JS._.isString(item[key])) {
                            switch (item[key]) {
                                case 'JBDAP.fn.ISODate': {
                                    item[key] = new Date().toISOString()
                                    break
                                }
                                default: {
                                    item[key] = validator.safeString(item[key])
                                }
                            }
                        }
                    }
                }
                if (cmd.type === 'create') query = query.insert(cmd.data,[JE.primaryKey])
                if (cmd.type === 'update') query = query.update(cmd.data[0],[JE.primaryKey])
            }
            console.log('sql:',query.toString())
            result = await query
            result = {
                dbServer: JE.dbServer,
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
        JS.throwError('DBExecError',err,null,[
            ['zh-cn', `操作数据出错`],
            ['en-us', `Error occurred while operating data`]
        ],lang)
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
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 * @param {string} lang 提示信息所用语言
 */
async function getWhereFunc(cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    if (JS._.isUndefined(cmd.query.where)) return null
    if (Object.prototype.toString(cmd.query.where) === '[object Object]' && Object.keys(cmd.query.where).length === 0) return null
    try {
        let where = {}
        if (Object.prototype.toString.call(cmd.query.where) === '[object Object]') where = cmd.query.where
        let func = await getSubConditionFunc(where,'and',cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang)
        // console.log(func.toString())
        return func
    }
    catch (err) {
        JS.throwError('WhereParserError',err,null,[
            ['zh-cn', `'where' 条件解析出错`],
            ['en-us', `Error occurred while parsing 'where' conditions`]
        ],lang)
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
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 * @param {string} lang 提示信息所用语言
 */
async function getSubConditionFunc(obj,type,cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    if (Object.prototype.toString.call(obj) !== '[object Object]') JS.throwError('WhereDefError',null,null,[
        ['zh-cn', `where 子查询条件不正确，'$${type}' 的值必须是 Object 类型`],
        ['en-us', `Invalid sub condition definition, value of '$${type}' must be an Object`]
    ],lang)
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
                let sub = await getSubConditionFunc(value,key.replace('$',''),cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang)
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
                let comparision = parser.parseComparision(key,value,lang)
                try {
                    if (JS._.isString(comparision.right)) {
                        comparision.right = calculator.tag2value(comparision.right,parent,root,null,lang)
                        if (validator.hasSqlInjection(comparision.right)) JS.throwError('SqlInjectionError',null,null,[
                            ['zh-cn', `'where' 条件发现 sql 注入字符`],
                            ['en-us', `Sql Injection characters found in 'where' conditions`]
                        ],lang)
                    }
                }
                catch (err) {
                    if (err.name === 'Tag2ValueError' && err.fullMessage().indexOf('[TagRefNotFilled]') > 0) {
                        // 发现尚未填充的引用对象
                        // 这里要调用填充
                        let ref = err.fullInfo().needRef
                        // console.log(err.fullInfo())
                        // 检查是否存在该 ref
                        let idx = JS._.findIndex(commands,{ name: ref })
                        if (idx >= 0) {
                            // 存在与 ref 同名的指令
                            // 执行查询
                            // console.log(commands[idx])
                            // 检查指令是否合法
                            let command = commands[idx]
                            validator.checkTopCommand(command,lang)
                            addLog(logs, [
                                ['zh-cn', `${prefix(level+1)}$ 开始执行顶层命令 /${command.name} [${command.type} 类型]`],
                                ['en-us', `${prefix(level+1)}$ Begin to handle top command /${command.name} ['${command.type}' type]`]
                            ],lang)
                            await handleCmd(knex,trx,doorman,scanner,dispatcher,isTop,commands[idx],parent,root,logs,user,commands,level+1,lang)
                            addLog(logs, [
                                ['zh-cn', `${prefix(level+1)}$ 顶层命令 /${command.name} 执行完毕`],
                                ['en-us', `${prefix(level+1)}$ Top command /${command.name} finished`]
                            ],lang)
                            // 然后重新执行 attchWhere
                            return await getSubConditionFunc(obj,type,cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang)
                        }
                        else JS.throwError('WhereDefError',null,null,[
                            ['zh-cn', `'where' 查询中的被引用对象 '/${ref}' 不存在于 commands 指令集中`],
                            ['en-us', `The referred target '/${ref}' in 'where' conditions doesn't exist in commands`]
                        ],lang)
                    }
                    else JS.throwError('WhereValueError',null,null,[
                        ['zh-cn', `'where' 条件赋值出错`],
                        ['en-us', `Error occurred while setting values for 'where' conditions`]
                    ],lang)
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
                        JS.throwError('WhereDefError',null,null,[
                            ['zh-cn', `运算符 '${operator}' 不存在`],
                            ['en-us', `Operator '${operator}' does not exist`]
                        ],lang)
                }
            }
        }
        funcDefine += ' }'
        return funcDefine
    }
    catch (err) {
        JS.throwError('SubWhereParserError',err,null,[
            ['zh-cn', `'where' 子条件解析出错`],
            ['en-us', `Error occurred while parsing 'where' sub conditions`]
        ],lang)
    }
}

/**
 * 执行单个服务端函数指令
 * @param {object} knex knex实例
 * @param {object} trx 事务对象
 * @param {function} doorman 权限控制模块
 * @param {function} scanner 字段加密模块
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {object} cmd 单个指令
 * @param {object} parent 当前指令的父对象
 * @param {object} root 数据存储根目录
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {string} lang 提示信息所用语言
 */
async function executeFunction(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    // 服务端函数指令
    try {
        let result = null
        // 判断指令类型
        if (cmd.target.indexOf('/') >= 0) JS.throwError('TargetDefError',null,null,[
            ['zh-cn', `服务端函数指令 'target' 不能是引用对象`],
            ['en-us', `A referred object can not be the 'target' in server-side function commands`]
        ],lang)
        else {
            // 调用 dispatcher 执行服务端函数
            if (JS._.isFunction(dispatcher)) {
                let data = cmd.data
                // 检查 data 类型
                if (!JS._.isPlainObject(data) && !JS._.isString(data)) JS.throwError('PropTypeError',null,null,[
                    ['zh-cn',`对于 'function' 操作，属性 'data' 必须是 String|Object 类型`],
                    ['en-us',`Property 'data' must be a String or an Object for 'function' type operations`]
                ],lang)
                try {
                    // 如果必要的话给 data 赋值
                    // string 类型
                    if (JS._.isString(data) && data !== '') {
                        cmd.data = calculator.tag2value(data,parent,root,null,lang)
                        if (validator.hasSqlInjection(cmd.data)) JS.throwError('SqlInjectionError',null,null,[
                            ['zh-cn', `发现 sql 注入字符`],
                            ['en-us', `Sql Injection characters found`]
                        ],lang)
                    }
                    if (JS._.isPlainObject(data) && Object.keys(data).length > 0) {
                        let keys = Object.keys(data)
                        for (let i=0; i<keys.length; i++) {
                            let prop = data[keys[i]]
                            if (JS._.isString(prop)) {
                                cmd.data[keys[i]] = calculator.tag2value(prop,parent,root,null,lang)
                                if (validator.hasSqlInjection(cmd.data[keys[i]])) JS.throwError('SqlInjectionError',null,null,[
                                    ['zh-cn', `发现 sql 注入字符`],
                                    ['en-us', `Sql Injection characters found`]
                                ],lang)
                            }
                        }
                    }
                    // 执行函数
                    result = await dispatcher(knex,trx,cmd.target,cmd.data,user,lang)
                    // 如果是顶级指令则保存到 root
                    if (isTop) root[cmd.name].data = result
                    // 返回结果
                    return result
                }
                catch (err) {
                    if (err.name === 'Tag2ValueError' && err.fullMessage().indexOf('[TagRefNotFilled]') > 0) {
                        // 发现尚未填充的引用对象
                        // 这里要调用填充
                        let ref = err.fullInfo().needRef
                        // console.log(err.fullInfo())
                        // 检查是否存在该 ref
                        let idx = JS._.findIndex(commands,{ name: ref })
                        if (idx >= 0) {
                            // 存在与 ref 同名的指令
                            // 执行查询
                            // console.log(commands[idx])
                            // 检查指令是否合法
                            let command = commands[idx]
                            validator.checkTopCommand(command,lang)
                            addLog(logs, [
                                ['zh-cn', `${prefix(level+1)}$ 开始执行顶层命令 /${command.name} [${command.type} 类型]`],
                                ['en-us', `${prefix(level+1)}$ Begin to handle top command /${command.name} ['${command.type}' type]`]
                            ],lang)
                            await handleCmd(knex,trx,doorman,scanner,dispatcher,isTop,commands[idx],parent,root,logs,user,commands,level+1,lang)
                            addLog(logs, [
                                ['zh-cn', `${prefix(level+1)}$ 顶层命令 /${command.name} 执行完毕`],
                                ['en-us', `${prefix(level+1)}$ Top command /${command.name} finished`]
                            ],lang)
                            // 然后重新执行
                            return await executeFunction(knex,trx,doorman,scanner,dispatcher,isTop,cmd,parent,root,logs,user,commands,lang)
                        }
                        else JS.throwError('DefError',null,null,[
                            ['zh-cn', `被引用对象 '/${ref}' 不存在于 commands 指令集中`],
                            ['en-us', `The referred target '/${ref}' doesn't exist in commands`]
                        ],lang)
                    }
                    else JS.throwError('ValueError',err,null,[
                        ['zh-cn', `'data' 赋值出错`],
                        ['en-us', `Error occurred while setting values for 'data'`]
                    ],lang)
                }
            }
            // 没有 dispatcher 函数则抛出错误
            else JS.throwError('JBDAPConfigError',null,null,[
                ['zh-cn', `服务器没有配置 dispatcher 调度器`],
                ['en-us', `No 'dispatcher' was set to server, but some server-side functions were called`]
            ],lang)
        }
    }
    catch (err) {
        JS.throwError('FunctionError',err,null,[
            ['zh-cn', `执行服务端函数 '${cmd.name}' 出错`],
            ['en-us', `Error occurred while executing server-side function '${cmd.name}'`]
        ],lang)
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
 * @param {function} dispatcher 服务端函数执行器
 * @param {boolean} isTop 是否顶层指令
 * @param {array} logs 日志
 * @param {object} user 当前用户身份信息
 * @param {array} commands 指令集
 * @param {integer} level 缩进层次
 * @param {string} lang 提示信息所用语言
 */
async function checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang) {
    if (JS._.isUndefined(lang)) lang = JE.i18nLang
    try {
        // console.log('checkOnlyIf',cmd.name)
        if (JS._.isUndefined(cmd.onlyIf)) return true
        if (Object.prototype.toString.call(cmd.onlyIf) === '[object Object]') {
            return calculator.checkCondition(cmd.onlyIf,'and',parent,root,null,lang)
        }
    }
    catch (err) {
        if (err.name === 'ConditionCalError' && err.fullMessage().indexOf('[TagRefNotFilled]') > 0) {
            // 发现尚未填充的引用对象
            // 这里要调用填充
            let ref = err.fullInfo().needRef
            // console.log(err.fullInfo())
            // 检查是否存在该 ref
            let idx = JS._.findIndex(commands,{ name: ref })
            if (idx >= 0) {
                // 存在与 ref 同名的指令
                // 检查指令是否合法
                let command = commands[idx]
                validator.checkTopCommand(command,lang)
                addLog(logs, [
                    ['zh-cn', `${prefix(level+1)}$ 开始执行顶层命令 /${command.name} [${command.type} 类型]`],
                    ['en-us', `${prefix(level+1)}$ Begin to handle top command /${command.name} ['${command.type}' type]`]
                ],lang)
                // 执行查询
                await handleCmd(knex,trx,doorman,scanner,dispatcher,isTop,commands[idx],parent,root,logs,user,commands,level+1,lang)
                addLog(logs, [
                    ['zh-cn', `${prefix(level+1)}$ 顶层命令 /${command.name} 执行完毕`],
                    ['en-us', `${prefix(level+1)}$ Top command /${command.name} finished`]
                ],lang)
                // 然后重新执行 onlyIf 并返回
                return await checkOnlyIf(cmd,parent,root,knex,trx,doorman,scanner,dispatcher,isTop,logs,user,commands,level,lang)
            }
            else JS.throwError('OnlyIfDefError',null,null,[
                ['zh-cn', `'onlyIf' 条件中的被引用对象 '/${ref}' 不存在于 commands 指令集中`],
                ['en-us', `The referred target '/${ref}' in 'onlyIf' conditions doesn't exist in commands`]
            ],lang)
        }
        else JS.throwError('OnlyIfError',err,null,[
            ['zh-cn', `'onlyIf' 条件解析出错`],
            ['en-us', `Error occurred while parsing 'onlyIf' conditions`]
        ],lang)
    }
}
