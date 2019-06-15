// 测试多指令
module.exports = {
    commands: [
        {
            name: 'delBlogs',
            type: 'delete',
            target: 'Blog',
            query: {
                where: {
                    userId: 17
                }
            }
        },
        {
            name: 'delUser',
            type: 'delete',
            target: 'User',
            query: {
                where: {
                    id: 17
                }
            }
        }
    ]
}