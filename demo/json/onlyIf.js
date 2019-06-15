// 测试 onlyIf 条件限制
module.exports = {
    commands: [
        {
            return: false,
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    username: 'user101'
                }
            },
            fields: 'id'
        },
        {
            name: 'newUser',
            type: 'create',
            target: 'User',
            onlyIf: {
                '/userInfo#isNull': true
            },
            data: {
                username: 'user101',
                password: 'password111',
                gender: 'female',
                createdAt: 'JBDAP.fn.ISODate',
                updatedAt: 'JBDAP.fn.ISODate'
            }
        }
    ]
}