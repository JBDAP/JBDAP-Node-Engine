const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
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
