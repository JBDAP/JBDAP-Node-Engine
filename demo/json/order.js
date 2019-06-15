// 测试查询后排序
module.exports = {
    commands: [
        {
            name: 'someBlogs',
            type: 'list',
            target: 'Blog',
            query: {
                order: 'categoryId#asc,userId#desc',
                size: 10
            }
        }
    ]
}