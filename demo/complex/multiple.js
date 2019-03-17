const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')


let json = {
    commands: [
        {
            name: 'delBlogs',
            type: 'delete',
            target: 'Blog',
            query: {
                where: {
                    userId: 17
                }
            }
        },
        {
            name: 'delUser',
            type: 'delete',
            target: 'User',
            query: {
                where: {
                    id: 17
                }
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
