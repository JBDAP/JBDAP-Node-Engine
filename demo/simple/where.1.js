const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')

let json = {
    commands: [
        {
            name: 'goodBlogs',
            type: 'list',
            target: 'Blog',
            query: {
                where: {
                    'views#gte': 500,
                    'hearts#gte': 50
                }
            },
            fields: 'id,title,content,views,hearts=>likes'
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
