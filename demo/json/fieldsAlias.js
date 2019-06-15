// 给返回字段重命名
module.exports = {
    commands: [
        {
            name: 'allUsers',
            type: 'list',
            target: 'User',
            fields: [
                'id',
                'username',
                'avatar',
                'updatedAt=>lastVisitedAt'
            ]
        }
    ]
}