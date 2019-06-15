// 测试 values 取值
module.exports = {
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
                'count#id=>totalBlogs',
                'sum#hearts=>totalHearts',
                'max#hearts=>maxViews',
                'min#hearts=>minViews',
                'avg#hearts=>avgHearts'
            ]
        }
    ]
}