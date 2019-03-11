const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')

let json = {
    commands: [
        {
            return: false,
            name: 'userBlogs',
            type: 'values',
            target: 'Blog',
            query: {
                where: {
                    userId: 1
                }
            },
            fields: [
                'pick#id=>ids'
            ]
        },
        {
            name: 'top10comments',
            type: 'list',
            target: 'Comment',
            query: {
                where: {
                    'id#in': '/userBlogs.ids'
                },
                order: 'id#desc',
                size: 10
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
