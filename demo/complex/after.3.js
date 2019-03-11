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
                    }
                }
            ],
            after: [
                {
                    name: 'updateHearts',
                    target: 'Blog',
                    type: 'increase',
                    onlyIf: {
                        '$.id#isNotNull': true
                    },
                    query: {
                        where: {
                            'userId': '$.id'
                        }
                    },
                    data: 'hearts:1'
                },
                {
                    name: 'updateViews',
                    target: 'Blog',
                    type: 'decrease',
                    onlyIf: {
                        '$.id#isNotNull': true
                    },
                    query: {
                        where: {
                            'userId': '$.id'
                        }
                    },
                    data: {
                        views: 1
                    }
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
