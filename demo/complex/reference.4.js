const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    needLogs: true,
    commands: [
        {
            name: 'newBlogs',
            type: 'values',
            target: 'Blog',
            query: {
                size: 10,
                page: 10
            },
            fields: [
                'pick#userId=>userIds',
                'clone#*=>list'
            ]
        },
        {
            name: 'newUsers',
            type: 'list',
            target: 'User',
            query: {
                where: {
                    'id#in': '/newBlogs.userIds'
                }
            }
        },
        {
            name: 'top10blogs',
            type: 'list',
            target: '/newBlogs.list',
            query: {
                where: {
                    'categoryId#gt': 2
                }
            },
            fields: [
                '*',
                {
                    name: 'user',
                    type: 'entity',
                    target: '/newUsers',
                    query: {
                        where: {
                            'id': '$.userId'
                        }
                    }
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
