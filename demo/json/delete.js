// 测试删除操作
module.exports = {
    commands: [
        {
            name: 'delBlog',
            type: 'delete',
            target: 'Blog',
            query: {
                where: {
                    id: 104
                }
            }
        }
    ]
}