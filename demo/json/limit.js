// 测试 top N 查询，返回指定字段
module.exports = {
    commands: [
        {
            name: 'someUsers',
            type: 'list',
            target: 'User',
            query: {
                order: 'id#desc',
                size: 2,
                page: 3
            },
            fields: 'id,username,avatar'
        }
    ]
}