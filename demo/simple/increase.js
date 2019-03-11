const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')
JBDAP.setServerName('sqlite')

let json = {
    commands: [
        {
            name: 'fakeNumbers',
            type: 'increase',
            target: 'Blog',
            query: {
                where: {
                    userId: 17,
                }
            },
            data: {
                hearts: 10,
                views: 100
            }
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
