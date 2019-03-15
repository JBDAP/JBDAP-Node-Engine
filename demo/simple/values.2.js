const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    commands: [
        {
            name: 'blogStat',
            type: 'values',
            target: 'Blog',
            query: {
                where: {
                    userId: 1
                },
                order: 'id#desc'
            },
            fields: [
                'first#title=>latestTitle',
                'pick#id=>blogIds',
                'clone#id,title,content,hearts=>List'
            ]
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
