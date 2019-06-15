// 测试创建单条数据
module.exports = {
    commands: [
        {
            name: 'newUser',
            type: 'create',
            target: 'User',
            data: {
                username: 'just4test',
                password: 'password111',
                gender: 'female'
            }
        }
    ]
}