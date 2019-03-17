const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    // needLogs: true,
    commands: [
        {
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    id: 1
                }
            },
            fields: [       // 对字段做一些精简
                'id',
                'username',
                'avatar',
                'updatedAt=>lastVisitedAt',
                {
                    name: 'top5blogs',
                    type: 'list',
                    target: 'Blog',
                    query: {
                        where: {
                            userId: '$.id'      // 这里 $ 指的是 userInfo
                        },
                        order: 'updatedAt#desc'
                    },
                    fields: [
                        'id',
                        'categoryId',
                        'title',
                        'content',
                        'views',
                        'hearts',
                        {
                            name: 'category',
                            type: 'entity',
                            target: 'Category',
                            query: {
                                where: {
                                    id: '$.categoryId'  // 这里的 $ 指的是单个 blog
                                }
                            },
                            fields: 'id,name'
                        },
                        {
                            name: 'top5comments',
                            type: 'list',
                            target: 'Comment',
                            query: {
                                where: {
                                    blogId: '$.id'  // 这里的 $ 指的还是单个 blog
                                },
                                order: 'id#desc',
                                size: 5
                            },
                            fields: 'id,content,hearts'
                        }
                    ]
                }
            ]
        }
    ]
}

let config = {
    serverName: 'sqlite',
    language: 'zh-cn',
    recognizer: recognizer,
    doorman: doorman,
    scanner: scanner
}

JBDAP.manipulate(knex,json,config).then((res) => {
    console.log(JSON.stringify(res,null,4))
    process.exit()
}).catch((err) => {
    console.log(err.fullStack())
    process.exit()
})
