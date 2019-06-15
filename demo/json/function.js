// 测试顶层执行服务端函数
module.exports = {
    needTrace: true,
    commands: [
        {
            name: 'updateUserStat',
            type: 'function',
            target: 'update_user_stat',
            data: {
                userId: 1
            }
        }
    ]
}