const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')


let json = {
    commands: [
        {
            name: 'blogInfo',
            type: 'entity',
            target: 'Blog',
            query: {
                where: {
                    id: 1
                }
            },
            after: {
                name: 'updateViews',
                type: 'increase',
                target: 'Blog',
                query: {
                    where: {
                        id: 1
                    }
                },
                data: 'views:1'
            }
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
