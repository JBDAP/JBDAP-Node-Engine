// 测试多层级联取值
module.exports = {
    needLogs: true,
    commands: [
        {
            name: 'newBlogs',
            type: 'values',
            target: 'Blog',
            query: {
                size: 10,
                page: 10
            },
            fields: [
                'pick#userId=>userIds',
                'clone#*=>list'
            ]
        },
        {
            name: 'newUsers',
            type: 'list',
            target: 'User',
            query: {
                where: {
                    'id#in': '/newBlogs.userIds'
                }
            }
        },
        {
            name: 'top10blogs',
            type: 'list',
            target: '/newBlogs.list',
            query: {
                where: {
                    'categoryId#gt': 2
                }
            },
            fields: [
                '*',
                {
                    name: 'user',
                    type: 'entity',
                    target: '/newUsers',
                    query: {
                        where: {
                            'id': '$.userId'
                        }
                    }
                }
            ]
        }
    ]
}