// 测试复杂 where 语句
module.exports = {
    commands: [
        {
            name: 'someBlogs',
            type: 'list',
            target: 'Blog',
            query: {
                where: {
                    'userId': 1,
                    'views#gte': 100,
                    $or: {
                        'title#like': 'blog%',
                        $and: {
                            'content#like': '%user%',
                            'createdAt#gte': '2019-02-28T13:27:05.162Z'
                        }
                    },
                    $not: {
                        'hearts#lte': 10,
                        'views#lte': 50
                    }
                }
            },
            fields: 'id,title,content,views,hearts=>likes'
        }
    ]
}