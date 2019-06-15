// 创建多条数据
module.exports = {
    commands: [
        {
            name: 'newBlogs',
            type: 'create',
            target: 'Blog',
            data: [
                {
                    userId: 10,
                    categoryId: 1,
                    title: 'new blog 10-1'
                },
                {
                    userId: 10,
                    categoryId: 2,
                    title: 'new blog 10-2'
                }
            ]
        }
    ]
}