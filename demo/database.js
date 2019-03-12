/**
 * 初始化测试数据库
 */

if (!global.NiceError) require('../lib/global')

// 获得对 knex 实例的引用
const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: __dirname + '/data.sqlite'
    },
    useNullAsDefault: true,
    asyncStackTraces: true,
    debug: false
})

// 初始化数据表结构
async function checkTable(name) {
    console.log('- 检查 [' + name + '] 表是否存在')
    let exists = await knex.schema.hasTable(name)
    if (!exists) {
        try {
            console.log('- 开始创建 [' + name + '] 表结构')
            switch (name) {
                case 'User': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.increments('id').primary()
                            table.string('username', 100).notNullable().unique()
                            table.string('password', 100).notNullable()
                            table.string('avatar', 200)
                            table.string('email', 100)
                            table.string('gender', 10).defaultTo('male')
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                case 'Category': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.increments('id').primary()
                            table.integer('sequence').notNullable().defaultTo(0)
                            table.string('name', 100).notNullable().unique()
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                case 'Blog': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.increments('id').primary()
                            table.integer('userId').notNullable()
                            table.integer('categoryId').notNullable()
                            table.string('title', 100).notNullable()
                            table.string('keywords', 200)
                            table.text('content')
                            table.integer('views').notNullable().defaultTo(0)
                            table.integer('hearts').notNullable().defaultTo(0)
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')    
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                case 'Comment': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.increments('id').primary()
                            table.integer('blogId').notNullable()
                            table.integer('fromUserId').notNullable()
                            table.integer('replyTo')
                            table.text('content')
                            table.integer('hearts').notNullable().defaultTo(0)
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')    
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                case 'Subscription': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.increments('id').primary()
                            table.integer('authorId').notNullable()
                            table.integer('subscriberId').notNullable()
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')    
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                case 'JBDAP_Role': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.increments('id').primary()
                            table.string('name', 100).notNullable().unique()
                            table.string('description', 200)
                            table.text('authority').notNullable()
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                case 'JBDAP_Token': {
                    return knex.schema.createTable(name, (table) => {
                        try {
                            table.string('token', 100).notNullable().unique()
                            table.integer('userId').notNullable()
                            table.integer('roleId').notNullable()
                            table.datetime('expiresAt')
                            table.datetime('createdAt')
                            table.datetime('updatedAt')
                            console.log('- 数据表 [' + name + '] 创建成功')
                        }
                        catch (ex) {
                            $throwError('数据表结构创建失败',ex,{
                                table: name
                            },'DBSchemaError')
                        }
                    })
                }
                default: {
                    $throwError('数据表结构未定义',ex,{
                        table: name
                    },'DBSchemaError')
                }
            }
        }
        catch (err) {
            throw err
        }
    }
}

// 填充初始数据
async function fillData() {
    try {
        console.log('- 检查是否已有测试数据')
        let res = await knex('User').count('id as count')
        if (res[0].count === 0) {
            //
            console.log('- 开始填充 [User] 表')
            let users = []
            for (let i=1; i<=10; i++) {
                users.push({
                    username: 'user' + i,
                    password: 'password' + i,
                    avatar: null,
                    email: null,
                    gender: Math.round(i/2) === (i/2) ? 'male' : 'female',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
            await knex('User').insert(users)
            //
            console.log('- 开始填充 [Category] 表')
            await knex('Category').insert([
                {
                    sequence: 2,
                    name: '经济',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    sequence: 1,
                    name: '政治',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    sequence: 3,
                    name: '军事',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
            ])
            //
            console.log('- 开始填充 [Blog] 表')
            let blogs = []
            for (let i=1; i<=100; i++) {
                let rdm = Number.randomBetween(1,10)
                blogs.push({
                    userId: rdm,
                    categoryId: Number.randomBetween(1,3),
                    title: 'blog' + i,
                    keywords: null,
                    content: 'blog content ' + i + ' from user ' + rdm,
                    views: Number.randomBetween(1,1000),
                    hearts: Number.randomBetween(1,100),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
            await knex('Blog').insert(blogs)
            //
            console.log('- 开始填充 [Comment] 表')
            let comments = []
            for (let i=1; i<=1000; i++) {
                let rdm = Number.randomBetween(1,100)
                comments.push({
                    blogId: rdm,
                    fromUserId: Number.randomBetween(1,10),
                    replyTo: null,
                    content: 'comment ' + i + ' for blog ' + rdm,
                    hearts: Number.randomBetween(1,100),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
            await knex.batchInsert('Comment', comments, 100)
            //
            console.log('- 开始填充 [Subscription] 表')
            let subscriptions = []
            for (let i=1; i<=50; i++) {
                subscriptions.push({
                    authorId: Number.randomBetween(1,10),
                    subscriberId: Number.randomBetween(1,10),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
            await knex('Subscription').insert(subscriptions)
            //
            console.log('- 开始填充 [JBDAP_Role] 表')
            let roles = [
                {
                    name: 'server',
                    authority: JSON.stringify([
                        {
                            table: 'User',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Category',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Blog',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Comment',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Subscription',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        }
                    ]),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'admin',
                    authority: JSON.stringify([
                        {
                            table: 'User',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Category',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Blog',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Comment',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        },
                        {
                            table: 'Subscription',
                            read: true,
                            create: true,
                            update: true,
                            delete: true
                        }
                    ]),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'user',
                    authority: JSON.stringify([
                        {
                            table: 'User',
                            read: {
                                row: 'all',
                                col: 'except:password'
                            },
                            create: false,
                            update: { '$.id': '@id' },
                            delete: { '$.id': '@id' }
                        },
                        {
                            table: 'Category',
                            read: true,
                            create: false,
                            update: false,
                            delete: false
                        },
                        {
                            table: 'Blog',
                            read: true,
                            create: { '$.userId': '@id' },
                            update: { '$.userId': '@id' },
                            delete: { '$.userId': '@id' }
                        },
                        {
                            table: 'Comment',
                            read: true,
                            create: { '$.fromUserId': '@id' },
                            update: {
                                $or: {
                                    '$.fromUserId': '@id',
                                    '[Blog?id=$.blogId].userId': '@id'
                                }
                            },
                            delete: {
                                $or: {
                                    '$.fromUserId': '@id',
                                    '[Blog?id=$.blogId].userId': '@id'
                                }
                            }
                        },
                        {
                            table: 'Subscription',
                            read: true,
                            create: { '$.subscriberId': '@id' },
                            update: false,
                            delete: { '$.subscriberId': '@id' }
                        }
                    ]),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'default',
                    authority: JSON.stringify([
                        {
                            table: 'User',
                            read: {
                                row: 'all',
                                col: 'except:password,email'
                            },
                            create: false,
                            update: false,
                            delete: false
                        },
                        {
                            table: 'Category',
                            read: true,
                            create: false,
                            update: false,
                            delete: false
                        },
                        {
                            table: 'Blog',
                            read: true,
                            create: false,
                            update: false,
                            delete: false
                        },
                        {
                            table: 'Comment',
                            read: true,
                            create: true,
                            update: false,
                            delete: false
                        },
                        {
                            table: 'Subscription',
                            read: true,
                            create: false,
                            update: false,
                            delete: false
                        }
                    ]),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ]
            await knex('JBDAP_Role').insert(roles)
            //
            console.log('- 开始填充 [JBDAP_Token] 表')
            let tokens = []
            for (let i=0; i<10; i++) {
                tokens.push({
                    token: crypto.sha256(Math.random().toString()),
                    userId: Number.randomBetween(1,10),
                    roleId: Number.randomBetween(1,4),
                    expiresAt: new Date().addDays(365).toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
            }
            await knex('JBDAP_Token').insert(tokens)
        }
        console.log('测试数据填充成功')
    }
    catch (err) {
        $throwError('测试数据填充出错了',err,{},'DBError')
    }
}

// 初始化数据库
async function init() {
    try {
        let tables = [
            'User',
            'Category',
            'Blog',
            'Comment',
            'Subscription',
            'JBDAP_Role',
            'JBDAP_Token'
        ]
        for (let i=0; i<tables.length; i++) {
            await checkTable(tables[i])
        }
        console.log('数据库初始化成功')
    }
    catch (err) {
        $throwError('数据库初始化出错了',err,{},'DBError')
    }
}

module.exports.conn = knex
module.exports.init = init
module.exports.fill = fillData