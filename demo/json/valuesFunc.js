// 测试 values 取值函数
module.exports = {
    needLogs: true,
    commands: [
        {
            name: 'blogStat',
            type: 'values',
            target: 'Blog',
            query: {
                where: {
                    userId: 1
                },
                order: 'id#desc'
            },
            fields: [
                'first#title=>latestTitle',
                'pick#id=>blogIds',
                'clone#id,title,content,hearts=>List'
            ]
        }
    ]
}