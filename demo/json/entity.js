// 测试获取单个用户
module.exports = {
    commands: [
        {
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    id: 1
                }
            }
        }
    ]
}