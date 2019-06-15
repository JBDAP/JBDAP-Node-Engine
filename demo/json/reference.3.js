// 测试查询结果引用
module.exports = {
    commands: [
        {
            return: false,
            name: 'blogs',
            type: 'values',
            target: 'Blog',
            query: {
                order: 'id#desc',
                size: 10
            },
            fields: [
                'pick#categoryId=>categoryIds',
                'clone#*=>list'
            ]
        },
        {
            return: false,
            name: 'categories',
            type: 'list',
            target: 'Category',
            query: {
                where: {
                    'id#in': '/blogs.categoryIds'
                }
            }
        },
        {
            name: 'top10blogs',
            type: 'list',
            target: '/blogs.list',
            fields: [
                '*',
                {
                    name: 'category',
                    type: 'entity',
                    target: '/categories',
                    query: {
                        where: {
                            'id': '$.categoryId'
                        }
                    }
                }
            ]
        }
    ]
}