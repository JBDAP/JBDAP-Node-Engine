const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')

let json = {
    withLogs: true,
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
            ]
        }
    ]
}

JBDAP.manipulate(knex,doorman,scanner,json).then((res) => {
    console.log(JSON.stringify(res,null,4))
    process.exit()
}).catch((err) => {
    console.log(err.fullStack())
    process.exit()
})
