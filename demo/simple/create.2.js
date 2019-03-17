const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')


let json = {
    commands: [
        {
            name: 'newBlogs',
            type: 'create',
            target: 'Blog',
            data: [
                {
                    userId: 17,
                    categoryId: 1,
                    title: 'new blog 17-1',
                    createdAt: 'JBDAP.fn.ISODate',
                    updatedAt: 'JBDAP.fn.ISODate'
                },
                {
                    userId: 17,
                    categoryId: 1,
                    title: 'new blog 17-2',
                    createdAt: 'JBDAP.fn.ISODate',
                    updatedAt: 'JBDAP.fn.ISODate'
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
