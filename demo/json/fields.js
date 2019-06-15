// 返回指定字段
module.exports = {
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
            fields: 'id,username,avatar,email,gender'
        }
    ]
}