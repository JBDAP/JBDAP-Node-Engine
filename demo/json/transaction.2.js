// 测试事务
module.exports = {
    i18nLang: 'zh-cn',
    isTransaction: true,
    needLogs: true,
    commands: [
        {
            name: 'userBlogs',
            type: 'values',
            target: 'Blog',
            query: {
                where: {
                    'userId': 1
                }
            },
            fields: [
                'pick#id=>ids'
            ]
        },
        {
            name: 'increaseHearts',
            type: 'increase',
            target: 'Blog',
            query: {
                where: {
                    'userId': 1
                }
            },
            data: {
                hearts: 1
            }
        },
        {
            name: 'insertUser2',
            type: 'create',
            target: 'User',
            data: {
                username: 'user11',
                password: 'password2',
                createdAt: 'JBDAP.fn.ISODate',
                updatedAt: 'JBDAP.fn.ISODate',
            }
        }
    ]
}