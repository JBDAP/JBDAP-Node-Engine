// 测试查询结果引用
module.exports = {
    commands: [
        {
            name: 'top10blogs',
            type: 'list',
            target: 'Blog',
            query: {
                order: 'id#desc',
                size: 10
            },
            fields: [
                '*',
                {
                    name: 'category',
                    type: 'entity',
                    target: 'Category',
                    query: {
                        where: {
                            id: '$.categoryId'
                        }
                    }
                }
            ]
        }
    ]
}