// 测试级联取值
module.exports = {
    needLogs: true,
    commands: [
        {
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    id: 1
                }
            },
            fields: [
                '*',
                {
                    name: 'top5blogs',
                    type: 'list',
                    target: 'Blog',
                    query: {
                        where: {
                            userId: '$.id'
                        },
                        order: 'updatedAt#desc'
                    }
                }
            ]
        }
    ]
}