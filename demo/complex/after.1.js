const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')
JBDAP.setServerName('sqlite')

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

JBDAP.manipulate(knex,doorman,scanner,json).then((res) => {
    console.log(JSON.stringify(res,null,4))
    process.exit()
}).catch((err) => {
    console.log(err.fullStack())
    process.exit()
})
