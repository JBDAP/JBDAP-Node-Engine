// 测试查询结果引用
module.exports = {
    commands: [
        {
            return: false,
            name: 'userBlogs',
            type: 'values',
            target: 'Blog',
            query: {
                where: {
                    userId: 1
                }
            },
            fields: [
                'pick#id=>ids'
            ]
        },
        {
            name: 'top10comments',
            type: 'list',
            target: 'Comment',
            query: {
                where: {
                    'id#in': '/userBlogs.ids'
                },
                order: 'id#desc',
                size: 10
            }
        }
    ]
}