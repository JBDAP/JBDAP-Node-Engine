const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    commands: [
        {
            return: false,
            name: 'blogs',
            type: 'values',
            target: 'Blog',
            query: {
                order: 'id#desc',
                size: 10
            },
            fields: [
                'pick#categoryId=>categoryIds',
                'clone#*=>list'
            ]
        },
        {
            return: false,
            name: 'categories',
            type: 'list',
            target: 'Category',
            query: {
                where: {
                    'id#in': '/blogs.categoryIds'
                }
            }
        },
        {
            name: 'top10blogs',
            type: 'list',
            target: '/blogs.list',
            fields: [
                '*',
                {
                    name: 'category',
                    type: 'entity',
                    target: '/categories',
                    query: {
                        where: {
                            'id': '$.categoryId'
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
