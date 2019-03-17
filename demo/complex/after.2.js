const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    needLogs: true,
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
            fields: [
                '*',
                {
                    name: 'top5blogs',
                    type: 'list',
                    target: 'Blog',
                    query: {
                        where: {
                            'userId': '$.id'
                        },
                        order: 'id#desc',
                        size: 5
                    },
                    fields: [
                        '*',
                        {
                            name: 'top5comments',
                            type: 'list',
                            target: 'Comment',
                            query: {
                                where: {
                                    'blogId#eq': '$.id'
                                },
                                order: 'id#desc',
                                size: 5
                            },
                            fields: 'id,fromUserId,content,hearts'
                        }
                    ]
                }
            ],
            after: [
                {
                    name: 'getNumOfBlogs',
                    target: 'Blog',
                    type: 'values',
                    onlyIf: {
                        '$.id#isNotNull': true
                    },
                    query: {
                        where: {
                            'userId': '$.id'
                        }
                    },
                    fields: 'count#id=>numOfBlogs'
                },
                {
                    name: 'getHeartsOfBlogs',
                    target: 'Blog',
                    type: 'values',
                    onlyIf: {
                        '$.id#isNotNull': true
                    },
                    query: {
                        where: {
                            'userId': '$.id'
                        }
                    },
                    fields: 'sum#hearts=>numOfHearts'
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