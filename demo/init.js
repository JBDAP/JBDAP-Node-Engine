
const db = require('./database')

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
            $throwError('DBError',ex,{},[['zh-cn', '测试失败']])
        }
    }).catch((err) => {
        console.log(err.fullStack())
        // console.log(err.fullMessage())
        process.exit()
    })