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
                'count#id=>totalBlogs',
                'sum#hearts=>totalHearts',
                'max#hearts=>maxViews',
                'min#hearts=>minViews',
                'avg#hearts=>avgHearts'
            ]
        }
    ]
}

let config = {
    serverName: 'sqlite',
    language: 'zh-cn',
    recognizer: recognizer,
    doorman: doorman,
    scanner: scanner
}

JBDAP.manipulate(knex,json,config).then((res) => {
    console.log(JSON.stringify(res,null,4))
    process.exit()
}).catch((err) => {
    console.log(err.fullStack())
    process.exit()
})
