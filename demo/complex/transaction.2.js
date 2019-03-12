const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    isTransaction: true,
    needLogs: true,
    commands: [
        {
            name: 'userBlogs',
            type: 'values',
            target: 'Blog',
            query: {
                where: {
                    'userId': 1
                }
            },
            fields: [
                'pick#id=>ids'
            ]
        },
        {
            name: 'increaseHearts',
            type: 'increase',
            target: 'Blog',
            query: {
                where: {
                    'userId': 1
                }
            },
            data: {
                hearts: 1
            }
        },
        {
            name: 'insertUser2',
            type: 'create',
            target: 'User',
            data: {
                username: 'user11',
                password: 'password2',
                createdAt: 'JBDAP.fn.ISODate',
                updatedAt: 'JBDAP.fn.ISODate',
            }
        }
    ]
}

JBDAP.manipulate(knex,recognizer,doorman,scanner,json).then((res) => {
    console.log(JSON.stringify(res,null,4))
    process.exit()
}).catch((err) => {
    console.log(err.fullStack())
    process.exit()
})
