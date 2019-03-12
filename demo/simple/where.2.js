const knex = require('../database').conn
const recognizer = require('../recognizer')
const doorman = require('../doorman')
const scanner = require('../scanner')
const JBDAP = require('../../lib/JBDAP')

let json = {
    commands: [
        {
            name: 'someBlogs',
            type: 'list',
            target: 'Blog',
            query: {
                where: {
                    'userId': 1,
                    'views#gte': 100,
                    $or: {
                        'title#like': 'blog%',
                        $and: {
                            'content#like': '%user%',
                            'createdAt#gte': '2019-02-28T13:27:05.162Z'
                        }
                    },
                    $not: {
                        'hearts#lte': 10,
                        'views#lte': 50
                    }
                }
            },
            fields: 'id,title,content,views,hearts=>likes'
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
