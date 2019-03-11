const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')
JBDAP.setServerName('sqlite')

let json = {
    commands: [
        {
            name: 'delBlog',
            type: 'delete',
            target: 'Blog',
            query: {
                where: {
                    id: 104
                }
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
