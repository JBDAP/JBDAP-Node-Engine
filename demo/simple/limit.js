const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')

let json = {
    commands: [
        {
            name: 'someUsers',
            type: 'list',
            target: 'User',
            query: {
                order: 'id#desc',
                size: 2,
                page: 3
            },
            fields: 'id,username,avatar'
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
