const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')
JBDAP.setServerName('sqlite')

let json = {
    commands: [
        {
            name: 'newUser',
            type: 'create',
            target: 'User',
            data: {
                username: 'just4test',
                password: 'password111',
                gender: 'female'
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
