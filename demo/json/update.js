// 测试更新数据
module.exports = {
    commands: [
        {
            name: 'updateBlogs',
            type: 'update',
            target: 'Blog',
            query: {
                where: {
                    userId: 10,
                    'title#like': 'new blog 10-%'
                }
            },
            data: {
                content: 'new blog content for user 10',
                views: 100,
                hearts: 10
            }
        }
    ]
}