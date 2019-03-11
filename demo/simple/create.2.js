const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')
JBDAP.setServerName('sqlite')

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

JBDAP.manipulate(knex,doorman,scanner,json).then((res) => {
    console.log(JSON.stringify(res,null,4))
    process.exit()
}).catch((err) => {
    console.log(err.fullStack())
    process.exit()
})
