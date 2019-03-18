# JBDAP-Node-Engine 概览

<div style="width:100%;height:20px;border:none;"></div>

## 一、这到底是个啥？

**JBDAP-Node-Engine** 是 **JBDAP** 的 nodejs 版官方实现，简单来说就是一个关系型数据库访问组件，帮助开发人员快速实现数据库相关应用的搭建，数据处理模块代码量有望减少 **70%** 以上。

<div style="width:100%;height:20px;border:none;"></div>

## 二、它跟 ORM 框架有什么不同？

ORM 的主要目的是将数据操作代码 **对象化、语义化、简洁化**，ORM 很棒，它工作在 **“术”** 的层面，让我们的数据处理模块变得清晰易懂，不再杂乱无章。ORM 改变的是具体编码模式和质量，但是我们依然要为每个数据表去编写对应的数据模型类和数据实体类，里面充斥着大量雷同的模板化代码。

JBDAP 的设计则定位在 **“道”** 的层面，目的是将数据处理整个这一层的开发工作大限度 **自动化、标准化、配置化**，换言之，我们希望改变的是开发模式，以尽可能的砍掉那些雷同的数据对象处理类。

### JBDAP 设计指导思想如下：

- 用 JSON 操作数据，一切基于配置，让开发人员跟 SQL 和数据实体类说再见
- 反对数据表与 API 生硬对应的 **“Restful 式不负责任的懒汉数据接口设计”**，提供简洁又极致自由的强大 API 模型
- 支持在保证数据安全的前提下将数据操作权限开放给前端开发者

<div style="width:100%;height:20px;border:none;"></div>

## 三、它跟 GraphQL 有什么区别？

首先请允许我向 GraphQL 致敬！因为 GraphQL 是一个了不起的创举，它承载了优秀的、突破性的思维模式。与技术本身相比，思想才是解决方案的灵魂！

然后必须承认，JBDAP 的设计借鉴了 GraphQL 的思想，想要解决的问题也非常类似。然而两者的侧重点又有不同，想要达到的目标也不尽相同。我的主要出发点是让这种优秀的思想在实现上变得更加友好一些。下面是根据个人粗浅理解所列出的一些区别：

- 主要目的：
   - GraphQL 主要是为了解决前端与后端（或者叫消费端与服务端）的沟通成本和灵活性问题，让前端在请求和获取数据的时候有更大的自主性
   - JBDAP 的设计初衷包含了 GraphQL 的诉求，与此同时还提出一个更诱人的目标 —— 后端编程自动化，一举实现绝大多数场景下后端对数据的访问和处理，成为一个对开发者来说 coding-free、开箱即用的框架
- 学习曲线：
   - GraphQL 定义了一种新的查询语言规范，简洁、优雅、强大都可以用来形容它，然而毕竟是一种新语言，也并不简单，对它的学习和掌握需要一个过程
   - JBDAP 依然使用开发者已经非常熟悉和亲切的 JSON 来描述一切，我们没有新的规范，只去遵从开发者的现有习惯，努力用最好的语义化定义一套 “接头明语”，尽量拉平开发者的学习曲线
- 限制强度：
   - GraphQL 用一套 Schema 系统去约束和限制数据的消费者和供应者两方，好处当然是显而易见的，然而也导致了开发者在前后两端的开发模式和编码习惯上都要去适配它
   - JBDAP 并没有类似的 Schema 系统，消费端只需要知道数据库结构即可任意构建自己的数据查询和操作指令，如果定义出错，服务端会给出友好而清晰的错误提示。与此同时，应用 JBDAP 对服务端也没有任何硬性要求
- 使用难度：
   - GraphQL 已经有了成熟的社区支持，无论是服务端还是客户端都有各种语言的支持库，尤其是客户端，鉴于它是一套新的规范，所以需要一层封装才能暴露给开发者使用
   - JBDAP 是无侵入式的，尤其对客户端没有任何新要求，它只是通过约定传输数据的格式来形成一个 JSON，你仍然像过去做的那样用原有方式把 JSON 数据丢给服务端即可

作为一个曾经学习过 GraphQL 的懒人，在对它的思想赞叹之余，对其实现方式上是有些不同观点的，可以看到认为 GraphQL 学起来费劲的人也有很多，这恰恰指向其在“语义化”方面的欠缺，注意“语义化”是为了让人可以“望文生义”，不用费尽心思去揣摩和记忆就能理解和应用，我认为如果能够降低使用者的心智成本，牺牲一些所谓的简洁度或者浪费一点字符空间是完全可以接受的。

总结一句：不敢说比 GraphQL 更优秀，但是更好用是一定的。

<div style="width:100%;height:20px;border:none;"></div>

## 四、JBDAP 的主要功能及特色：

- 支持大多数主流关系型数据库，如 Postgres, MSSQL, MySQL, MariaDB, SQLite3, Oracle, 甚至包含 Amazon Redshift，当然这是仅针对官方版的 JBDAP-Node-Engine 而言，事实上你完全可以开发出基于 NoSQL 或者 NewSQL 数据库引擎的 JBDAP 实现
- 高度语义化的 JSON 配置，上手简单、易学难忘，两小时会用无压力
- 功能强大、可编程、支持复杂逻辑操作、支持事务
- 对原有开发模式无侵入、热插拔
- 数据结构可以任意改变，基础 API 稳如泰山，减少需求变动带来的系统频繁更新发布
- 减轻沟通负担，只需数据库词典在手，从此告别 API 文档
- 暴爽的开发速度，一天搞定一个数据访问 API 应用开发

<div style="width:100%;height:20px;border:none;"></div>

## 五、JBDAP 可以用在哪些开发场景：

- 网络应用的 **WebAPI 开发**，如 APP 后端接口，最少一个 url 就可以支持整库所有表的操作
- 三层架构 WEB 应用开发中的 **DAO 层开发**，或者任何其它开发模型的数据访问层开发
- 本地应用（如 Electron 应用）开发中的 **数据库交互**

<div style="width:100%;height:20px;border:none;"></div>

## 六、直接上代码体验一下吧

<div style="width:100%;height:5px;border:none;"></div>

### **例1：查询一个列表 - list 查询**
Request:
~~~
{
    commands: [
        {
            name: 'allUsers',
            type: 'list',       // list 代表要获取数据列表
            target: 'User'      // 数据表名
        }
    ]
}
~~~

等效 SQL:
~~~
select * from `User`
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "allUsers": [
            {
                "id": 1,
                "username": "user1",
                "password": "password1",
                "avatar": null,
                "email": null,
                "gender": "female",
                "createdAt": "2019-02-28T13:27:05.150Z",
                "updatedAt": "2019-02-28T13:27:05.150Z"
            },
            ... // 更多数据省略
        ]
    }
}
/**
 * 说明：
 * 如果没有符合条件的记录，data.allUsers 为 null
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例2：查询单条数据 - entity 查询**

Request:
~~~
{
    commands: [
        {
            name: 'userInfo',
            type: 'entity',     // entity 代表要获取单个数据
            target: 'User',
            query: {
                where: {
                    id: 1
                }
            }
        }
    ]
}
~~~

等效 SQL:
~~~
select * from `User` where (`id` = 1)
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "userInfo": {
            "id": 1,
            "username": "user1",
            "password": "password1",
            "avatar": null,
            "email": null,
            "gender": "female",
            "createdAt": "2019-02-28T13:27:05.150Z",
            "updatedAt": "2019-02-28T13:27:05.150Z"
        }
    }
}
/**
 * 说明：
 * 1、如果符合查询条件的结果有多个，那么只返回第一个
 * 2、如果没有符合条件的，则 data.userInfo 为 null
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例3：限制字段、别名返回**

Request:
~~~
{
    commands: [
        {
            name: 'allUsers',
            type: 'list',
            target: 'User',
            fields: [
                'id',
                'username',
                'avatar',
                'updatedAt=>lastVisitedAt'      // 别名返回
            ]
        }
    ]
}
/**
 * 说明：
 * 1、list 查询和 entity 查询指定字段的方式完全一致
 * 2、允许返回数据字段别名返回，如上面 'updatedAt=>lastVisitedAt'
 *    将会把 updatedAt 改名为 lastVisitedAt 返回
 */
~~~

等效 SQL:
~~~
select `id`, `username`, `avatar`, `updatedAt` as `lastVisitedAt` 
from `User`
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "allUsers": [
            {
                "id": 1,
                "username": "user1",
                "avatar": null,
                "lastVisitedAt": "2019-02-28T13:27:05.150Z"   // 已经改名
            },
            ...     // 更多数据省略
        ]
    }
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例4：where 条件查询**

Request:
~~~
{
    commands: [
        {
            name: 'goodBlogs',
            type: 'list',
            target: 'Blog',
            query: {
                where: {            // 这里是一个非常复杂的查询条件
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
            fields: 'id,title,content,views,hearts=>likes'   // 别名返回
        }
    ]
}
/**
 * 说明：
 * 1、属性的 key 用 # 隔开了 field 名称与运算符，支持的运算符有：
 *    值比较：eq, ne, lte, lt, gte, gt
 *    包含判断：in, notIn
 *    字符串匹配：like, notLike
 *    区域判断：between, notBetween
 *    Null 值判断：isNull, isNotNull
 *    分组运算符: and, or, not
 * 2、组合使用可以实现任何多层级的复杂查询
 */
~~~

等效 SQL:
~~~
select `id`, `title`, `content`, `views`, `hearts` as `likes` 
from `Blog` 
where (
    `userId` = 1 
    and `views` >= 100 
    and (
        `title` like 'blog%' 
        or (
            `content` like '%user%' 
            and `createdAt` >= '2019-02-28T13:27:05.162Z'
        )
    ) 
    and (
        not `hearts` <= 10 and not `views` <= 50
    )
)
/**
 * WOW，看这个 SQL 语句，很牛逼的样子
 * 我打赌你一般用不到这么复杂的查询，但是 JBDAP-Node-Engine 确实允许你无限写下去
 */
~~~

Response:
~~~
略
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例5：order 以及分页**

Request:
~~~
{
    commands: [
        {
            name: 'someUsers',
            type: 'list',
            target: 'User',
            query: {
                order: 'id#desc',
                size: 2,            // 每页条数
                page: 3             // 返回第几页
            },
            fields: 'id,username,avatar'
        }
    ]
}
/**
 * 说明：
 * query.page 为 3 意味着返回第 3 页，每页 query.size 条
 */
~~~

等效 SQL:
~~~
select `id`, `username`, `avatar` from `User` 
order by `id` desc 
limit 2 offset 4
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "someUsers": [
            {
                "id": 8,
                "username": "user8",
                "avatar": null
            },
            {
                "id": 7,
                "username": "user7",
                "avatar": null
            }
        ]
    }
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例6：数学计算及取值查询 - values 查询**

Request:
~~~
{
    commands: [
        {
            name: 'blogStat',
            type: 'values',         // 这里指明是 values 查询
            target: 'Blog',
            query: {
                where: {
                    userId: 1
                },
                order: 'id#desc'
            },
            fields: [
                'count#id=>totalBlogs',                 // 计数
                'sum#hearts=>totalHearts',              // 求和
                'max#hearts=>maxViews',                 // 求最大
                'avg#hearts=>avgHearts',                // 求均值
                'first#title=>latestTitle',             // 第一条记录的指定字段
                'pick#id=>blogIds',                     // 拣取指定字段拼为数组
                'clone#id,title,content,hearts=>List'   // 克隆每行数据的指定字段
            ]
        }
    ]
}
/**
 * 说明：
 * 1、请注意 fields 的定义，count, sum, max, min, avg 的用法无需多言
 * 2、最后三个比较特殊：
 *    first - 取第一条记录的单个指定字段，比如可以用来取当前最大 id
 *    pick - 将指定字段取出放入一个数组，比如可以取出 id 的数组用于 where 中的 in 查询
 *    clone - 克隆每条记录的指定字段，比如获得一个小的简略数据列表
 * 3、对于后三个运算，建议不要在大量数据场景下使用
 */
~~~

等效 SQL:
~~~
select * from `Blog` where (`userId` = 1) order by `id` desc
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "blogStat": {
            "totalBlogs": 5,                // 总共 5 篇博客
            "totalHearts": 414,             // 总计点赞 414
            "maxViews": 122,                // 单篇最大浏览量 122
            "avgHearts": 82.8,              // 平均点赞 82.8
            "latestTitle": "blog99",        // 最新一篇标题
            "blogIds": [                    // 所有博客 id 组成的数组
                99,
                98,
                68,
                66,
                2
            ],
            "List": [                       // 克隆出原始数据的字段子集
                {
                    "id": 99,
                    "title": "blog99",
                    "content": "blog content 99 from user 1",
                    "hearts": 122
                },
                {
                    "id": 98,
                    "title": "blog98",
                    "content": "blog content 98 from user 1",
                    "hearts": 49
                },
                ...     // 更多数据省略
            ]
        }
    }
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例7：创建数据记录 - create 操作**

Request:
~~~
{
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
                    createdAt: 'JBDAP.fn.ISODate',      // 服务器函数
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
/**
 * 说明：
 * 1、给 data 传入一个数组可以批量创建数据
 *    考虑到网络传输压力和服务器性能，不建议一次批量插入超过 500 条数据
 *    且强烈建议使用事务（如何使用事务，这是后话）
 * 2、这个例子我们使用了一个名为 JBDAP.fn.ISODate 的服务端函数
 *    执行时会被替换成服务器时间的 ISO 格式，如 '2019-02-28T13:27:05.162Z'
 *    这是目前唯一一个服务端函数
 */
~~~

等效 SQL:
~~~
insert into `Blog` 
    (`categoryId`, `createdAt`, `title`, `updatedAt`, `userId`) 
    select 
        1 as `categoryId`, 
        '2019-03-11T02:26:53.366Z' as `createdAt`, 
        'new blog 17-1' as `title`, 
        '2019-03-11T02:26:53.366Z' as `updatedAt`, 
        17 as `userId` 
    union all 
    select 
        1 as `categoryId`, 
        '2019-03-11T02:26:53.366Z' as `createdAt`, 
        'new blog 17-2' as `title`, 
        '2019-03-11T02:26:53.366Z' as `updatedAt`, 
        17 as `userId`
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "newBlogs": {
            "dbServer": "sqlite",
            "return": [
                104
            ]
        }
    }
}
/**
 * 说明：
 * return 是插入的最后一条记录 id 值
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例8：更新数据 - update 操作**

Request:
~~~
{
    commands: [
        {
            name: 'updateBlogs',
            type: 'update',         // 指明是 update 操作
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
/**
 * 这里我们将刚才插入的两条博文进行了更新
 * data 里有的字段才会被更新
 */
~~~

等效 SQL:
~~~
update `Blog` 
set 
    `content` = 'new blog content for user i7', 
    `views` = 100, 
    `hearts` = 10 
where 
    (`userId` = 17 and `title` like 'new blog 17-%')
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "updateBlogs": {
            "dbServer": "sqlite",
            "return": 2
        }
    }
}
/**
 * 说明：
 * 此处 return 值为受影响数据条数
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例9：删除数据 - delete 操作**

Request:
~~~
{
    commands: [
        {
            name: 'delBlog',
            type: 'delete',         // 指明是 delete 操作
            target: 'Blog',
            query: {
                where: {
                    id: 104
                }
            }
        }
    ]
}
/**
 * 这里我们将刚才插入的两条博文之一进行了删除
 */
~~~

等效 SQL:
~~~
delete from `Blog` where (`id` = 104)
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "delBlog": {
            "dbServer": "sqlite",
            "return": 1
        }
    }
}
/**
 * 说明：
 * 此处 return 值为受影响数据条数
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例10：数据自增减 - increase/decrease 操作**

Request:
~~~
{
    commands: [
        {
            name: 'fakeNumbers',
            type: 'increase',       // 指明是 increase 原子自增操作
            target: 'Blog',
            query: {
                where: {
                    userId: 17,
                }
            },
            data: {
                hearts: 10,
                views: 100
            }
        }
    ]
}
/**
 * 可以同时更新多个值，注意增加数字不能为负数
 */
~~~

等效 SQL:
~~~
update `Blog` 
set 
    `hearts` = `hearts` + 10, 
    `views` = `views` + 100 
where 
    (`userId` = 17)
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "fakeNumbers": {
            "dbServer": "sqlite",
            "return": 5
        }
    }
}
/**
 * 说明：
 * 此处 return 值为受影响数据条数
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例11：多指令任务**

Request:
~~~
{
    commands: [
        {
            name: 'delBlogs',
            type: 'delete',
            target: 'Blog',
            query: {
                where: {
                    userId: 17
                }
            }
        },
        {
            name: 'delUser',
            type: 'delete',
            target: 'User',
            query: {
                where: {
                    id: 17
                }
            }
        }
    ]
}
/**
 * 执行多条指令的时候，会按照指令在 commands 数组中出现的先后顺序执行
 */
~~~

等效 SQL:
~~~
delete from `Blog` where (`userId` = 17)
delete from `User` where (`id` = 17)
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "delBlogs": {
            "dbServer": "sqlite",
            "return": 5
        },
        "delUser": {
            "dbServer": "sqlite",
            "return": 1
        }
    }
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例12：级联字段填充**

Request:
~~~
{
    commands: [
        {
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    id: 1
                }
            },
            fields: [       // 对字段做一些精简
                'id',
                'username',
                'avatar',
                'updatedAt=>lastVisitedAt',
                {
                    name: 'top5blogs',
                    type: 'list',
                    target: 'Blog',
                    query: {
                        where: {
                            userId: '$.id'      // 这里 $ 指 userInfo
                        },
                        order: 'updatedAt#desc'
                    },
                    fields: [
                        'id',
                        'categoryId',
                        'title',
                        'content',
                        'views',
                        'hearts',
                        {
                            name: 'category',
                            type: 'entity',
                            target: 'Category',
                            query: {
                                where: {
                                    id: '$.categoryId'  // 这里 $ 指单个 blog
                                }
                            },
                            fields: 'id,name'
                        },
                        {
                            name: 'top5comments',
                            type: 'list',
                            target: 'Comment',
                            query: {
                                where: {
                                    blogId: '$.id'  // 这里 $ 指单个 blog
                                },
                                order: 'id#desc',
                                size: 5
                            },
                            fields: 'id,content,hearts'
                        }
                    ]
                }
            ]
        }
    ]
}
/**
 * 多层的级联填充，原理都是一样的，难度在于你要理解表达式中的 '$' 代表的是什么
 */
~~~

等效 SQL:
~~~
select `id`, `username`, `avatar`, `updatedAt` as `lastVisitedAt` 
from `User` 
where (`id` = 1)

select `id`, `categoryId`, `title`, `content`, `views`, `hearts` 
from `Blog` 
where (`userId` = 1) 
order by `updatedAt` desc

select `id`, `name` 
from `Category` 
where (`id` = 2)
select `id`, `content`, `hearts` 
from `Comment` 
where (`blogId` = 2) 
order by `id` desc 
limit 5
...
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "userInfo": {
            "id": 1,
            "username": "user1",
            "avatar": null,
            "lastVisitedAt": "2019-02-28T13:27:05.150Z",
            "top5blogs": [
                {
                    "id": 2,
                    "categoryId": 2,
                    "title": "blog2",
                    "content": "blog content 2 from user 1",
                    "views": 953,
                    "hearts": 94,
                    "category": {
                        "id": 2,
                        "name": "政治"
                    },
                    "top5comments": [
                        {
                            "id": 914,
                            "content": "comment 914 for blog 2",
                            "hearts": 27
                        },
                        {
                            "id": 888,
                            "content": "comment 888 for blog 2",
                            "hearts": 83
                        },
                        ...     // 省略 3 条 Comment 数据
                    ]
                },
                ...     // 省略 4 条 Blog 数据
            ]
        }
    }
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例13：查询结果的引用**

Request:
~~~
{
    commands: [
        {
            name: 'userBlogs',      // 这个指令的查询结果将被引用
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
                    'id#in': '/userBlogs.ids'   // 引用 userBlogs 查询结果中的 ids 属性作为条件进行查询
                },
                order: 'id#desc',       // 倒序取最新
                size: 10                // 取前 10 条
            }
        }
    ]
}
/**
 * 说明：
 * 我们通过多指令的方式来实现将被引用的 userBlogs 指令查询
 * 然后在 top10comments 的查询条件中通过 /userBlogs.ids 的方式获得对该数值的引用以实现查询
 */
~~~

等效 SQL:
~~~
select * from `Blog` where (`userId` = 1)

select * 
from `Comment` 
where 
    (`id` in (2, 66, 68, 98, 99)) 
order by `id` desc 
limit 10
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "userBlogs": {
            "ids": [
                2,
                66,
                68,
                98,
                99
            ]
        },
        "top10comments": [
            {
                "id": 99,
                "blogId": 45,
                "fromUserId": 2,
                "replyTo": null,
                "content": "comment 99 for blog 45",
                "hearts": 66,
                "createdAt": "2019-02-28T13:27:05.174Z",
                "updatedAt": "2019-02-28T13:27:05.174Z"
            },
            ...     // 其余数据省略
        ]
    }
}
/**
 * 结果与预期完全一致
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例14：返回结果的控制**

Request:
~~~
{
    commands: [
        {
            return: false,          // renturn 设为 false，此查询结果将不返回
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
        ...
    ]
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例15：指令的前置条件**

Request:
~~~
{
    commands: [
        {
            return: false,                  // 无需返回
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    username: 'user100'     // 用户名查重
                }
            },
            fields: 'id'
        },
        {
            name: 'newUser',
            type: 'create',
            target: 'User',
            onlyIf: {
                '/userInfo#isNull': true    // 以 userInfo 查询结果是 null 为前提
            },
            data: {
                username: 'user100',
                password: 'password111',
                gender: 'female',
                createdAt: 'JBDAP.fn.ISODate',
                updatedAt: 'JBDAP.fn.ISODate'
            }
        }
    ]
}
/**
 * 说明：
 * onlyIf 与 where 的定义方式和运算规则基本一致，支持分组运算，但是也有小的区别如下：
 * 1、where 其下每一个键值对叫做一个查询条件，其键名中 # 的左边只能是 field 名称
 * 2、onlyIf 其下的每一个键值对则叫做一个比较表达式，其键名中 # 的左边是可以进行赋值的表达式
 * 3、两者运算符也有不同
 *    没有 like 和 notLike
 *    没有 between 和 notBetween
 *    新增 match 和 notMatch
 *    新增 exist 和 notExist
 *    新增 isUndefined 和 isNotUndefined
 *    新增 isEmpty 和 isNotEmpty
 */
~~~

等效 SQL:
~~~
select `id` from `User` where (`username` = 'user100')
insert into `User` 
    (`createdAt`, `gender`, `password`, `updatedAt`, `username`) 
values 
    ('2019-03-11T13:31:25.194Z', 'female', 'password111', '2019-03-11T13:31:25.195Z', 'user100')
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "newUser": {
            "dbServer": "sqlite",
            "return": [
                18
            ]
        }
    }
}
/**
 * 注意：
 * 这是没有用户名冲突执行成功的结果，如果存在冲突的话，返回值 newUser 将会是 null
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例16：指令的后置操作**

Request:
~~~
{
    commands: [
        {
            name: 'blogInfo',
            type: 'entity',
            target: 'Blog',
            query: {
                where: {
                    id: 1
                }
            },
            after: {
                name: 'updateViews',
                type: 'increase',
                target: 'Blog',
                query: {
                    where: {
                        id: 1
                    }
                },
                data: 'views:1'
            }
        }
    ]
}
/**
 * 查询 blog 详情的时候，顺道就把访问量加 1 的工作给做了。
 * 注意：after 可以接受数组参数，也就是说主指令执行完成后可以执行一系列指令
 * 与此同时，在 after 指令里面，继续使用 onlyIf 判断可以进一步加强对数据操作流程的掌控
 */
~~~

等效 SQL:
~~~
select * from `Blog` where (`id` = 1)
update `Blog` set `views` = `views` + 1 where (`id` = 1)
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "blogInfo": {
            "id": 1,
            "userId": 4,
            "categoryId": 1,
            "title": "blog1",
            "keywords": null,
            "content": "blog content 1 from user 4",
            "views": 753,
            "hearts": 55,
            "createdAt": "2019-02-28T13:27:05.162Z",
            "updatedAt": "2019-02-28T13:27:05.162Z"
        }
    }
}
/**
 * 我们关注的重心依然是 blog 详情本身
 */
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例17：事务支持**

Request
~~~
{
    isTransaction: true,        // 没错，你只要把 isTransaction 配置为 true 就可以了
    commands: [
        {
            name: 'delBlogs',
            type: 'delete',
            target: 'Blog',
            query: {
                where: {
                    userId: 17
                }
            }
        },
        {
            name: 'delUser',
            type: 'delete',
            target: 'User',
            query: {
                where: {
                    id: 17
                }
            }
        }
    ]
}
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例18：内置错误信息**

Request:
~~~
{
    "code": 0,
    "message": "[CmdExecError]：解析或执行指令失败 <= [JBDAPCommandError]：处理指令 \"newUser\" 出错 <= [DBExecError]：操作数据出错 <= [Error]：insert into `User` (`gender`, `password`, `username`) values ('female', 'password111', 'just4test') - SQLITE_CONSTRAINT: UNIQUE constraint failed: User.username",
    "data": null
}
~~~

把 message 单独拿出来整理一下格式是这样的

~~~
[CmdExecError]：解析或执行指令失败 
    <= [JBDAPCommandError]：处理指令 \"newUser\" 出错 
    <= [DBExecError]：操作数据出错 
    <= [Error]：
        insert into `User` 
            (`gender`, `password`, `username`) 
        values 
            ('female', 'password111', 'just4test') 
        - SQLITE_CONSTRAINT: UNIQUE constraint failed: User.username
~~~

<div style="width:100%;height:5px;border:none;"></div>

### **例19：服务端日志回传**

Request:
~~~
{
    needLogs: true,     // 告知服务器需要返回执行日志
    commands: [
        {
            name: 'userInfo',
            type: 'entity',
            target: 'User',
            query: {
                where: {
                    id: 1
                }
            },
            fields: [
                '*',
                {
                    name: 'top5blogs',
                    type: 'list',
                    target: 'Blog',
                    query: {
                        where: {
                            userId: '$.id'
                        },
                        order: 'updatedAt#desc'
                    }
                }
            ]
        }
    ]
}
~~~

Response:
~~~
{
    "code": 200,
    "message": "ok",
    "data": {
        "userInfo": {
            ...     // 省略
        }
    },
    "logs": [
        "- 开启 JBDAP 任务",
        "- 检查接收到的 JSON 是否合法",
        "* 用户身份校验",
        "- 开始处理接收到的指令",
        "- 非事务方式执行",
        "$ 开始执行顶层指令 /userInfo - entity 类型",
        "  @ 开始执行级联指令 [top5blogs] - list 类型",
        "  @ 级联指令 [top5blogs] 执行完毕",
        "$ 顶层指令 /userInfo 执行完毕",
        "- 全部指令处理完成",
        "- JBDAP 任务成功"
    ]
}
~~~

## *(未完待续)*