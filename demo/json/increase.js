// 测试原子加法运算
module.exports = {
    commands: [
        {
            name: 'fakeNumbers',
            type: 'increase',
            target: 'Blog',
            query: {
                where: {
                    userId: 11,
                }
            },
            data: {
                hearts: 10,
                views: 100
            }
        }
    ]
}