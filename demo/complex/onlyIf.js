const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')


let json = {
    commands: [
        {
            return: false,
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    username: 'user100'
                }
            },
            fields: 'id'
        },
        {
            name: 'newUser',
            type: 'create',
            target: 'User',
            onlyIf: {
                '/userInfo#isNull': true
            },
            data: {
                username: 'user100',
                password: 'password111',
                gender: 'female',
                createdAt: 'JBDAP.fn.ISODate',
                updatedAt: 'JBDAP.fn.ISODate'
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
