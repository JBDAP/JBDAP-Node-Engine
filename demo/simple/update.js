const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

JBDAP.setServerName('sqlite')

let json = {
    commands: [
        {
            name: 'updateBlogs',
            type: 'update',
            target: 'Blog',
            query: {
                where: {
                    userId: 17,
                    'title#like': 'new blog 17-%'
                }
            },
            data: {
                content: 'new blog content for user i7',
                views: 100,
                hearts: 10
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
