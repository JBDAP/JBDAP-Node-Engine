const db = require('./database')
const JBDAP = require(process.cwd() + '/lib/JBDAP')
const readline = require('readline')

let conn = db.conn

async function recognizer(security,lang) {
    return {}
}

async function scanner(user,cmd,fields,data,lang) {
    return data
}

async function doorman(user,cmd,target,lang) {
    return true
}

async function dispatcher(knex,trx,name,data,user,lang) {
    // 执行函数，如果是写操作，需要放入到事务当中去，以确保执行完整
    console.log('server-side function name:',name)
    console.log('data:',JSON.stringify(data,null,4))
    console.log('user:',JSON.stringify(user,null,4))
    return 'ok'
}

let config = {
    recognizer,
    doorman,
    scanner,
    dispatcher,
    language: 'zh-cn'
}

// 命令行式的交互，输入 json 文件名，执行相应的任务
const read = readline.createInterface(process.stdin, process.stdout)
read.setPrompt('请输入要执行的命令 > ')
read.prompt()
read.on('line', async function(line) {
    if (line.trim() === 'exit') read.close()
    try {
        let json = require('./json/' + line.trim() + '.js')
        let res = await JBDAP.manipulate(conn,json,config)
        console.log('执行结果:')
        console.log(JSON.stringify(res,null,4))
        read.prompt()
    }
    catch (err) {
        if (err.toString().indexOf('Cannot find module') >= 0) {
            console.log('脚本名称输入错误！')
            read.prompt()
        }
    }
});

read.on('close', function() {
    process.exit()
});
