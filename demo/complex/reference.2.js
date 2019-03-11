const knex = require('../database').conn
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../src/JBDAP')

let json = {
    commands: [
        {
            name: 'top10blogs',
            type: 'list',
            target: 'Blog',
            query: {
                order: 'id#desc',
                size: 10
            },
            fields: [
                '*',
                {
                    name: 'category',
                    type: 'entity',
                    target: 'Category',
                    query: {
                        where: {
                            id: '$.categoryId'
                        }
                    }
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
