// 测试多层级联取值
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
                            'userId': '$.id'
                        },
                        order: 'id#desc',
                        size: 5
                    },
                    fields: [
                        '*',
                        {
                            name: 'top5comments',
                            type: 'list',
                            target: 'Comment',
                            query: {
                                where: {
                                    'blogId#eq': '$.id'
                                },
                                order: 'id#desc',
                                size: 5
                            },
                            fields: 'id,fromUserId,content,hearts'
                        }
                    ]
                }
            ]
        }
    ]
}