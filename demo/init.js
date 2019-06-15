
const db = require('./database')
const { JS, JE } = require(process.cwd() + '/lib/global')

console.log('连接数据库')
db.init()
    .then(async () => {
        try {
            // 填充测试数据
            await db.fill()
            // 执行完毕，退出程序
            process.exit()
        }
        catch (ex) {
            JS.throwError('DBError',ex,null,[['zh-cn', '填充测试数据失败']],'zh-cn')
        }
    }).catch((err) => {
        console.log(err.fullStack())
        // console.log(err.fullMessage())
        process.exit()
    })