// 测试 where 语句
module.exports = {
    commands: [
        {
            name: 'goodBlogs',
            type: 'list',
            target: 'Blog',
            query: {
                where: {
                    'views#gte': 500,
                    'hearts#gte': 50
                }
            },
            fields: 'id,title,content,views,hearts=>likes'
        }
    ]
}