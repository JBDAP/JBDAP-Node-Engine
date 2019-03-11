const calculator = require('../src/calculator')

test('测试 calculate 方法', () => {
    // 模拟数据
    let parent = {
        pA: true,
        pB: {
            pBA: 1,
            pBB: 'yes',
            pBC: [1,2,3],
            pBD: {
                pBDA: '这是一本小说，关于爱情和面包'
            },
            pBE: undefined,
            pBF: null
        },
        pC: [
            {
                id: 1
            },
            {
                id: 2
            },
            {
                id: 3
            },
            {
                id: 4
            },
            {
                id: 5
            }
        ]
    }
    let root = {
        rA: {
            error: null,
            data: {
                pA: true,
                pB: {
                    pBA: 1,
                    pBB: 'yes',
                    pBC: [1,2,3],
                    pBD: {
                        pBDA: '这是一本小说，关于爱情和面包'
                    },
                    pBE: undefined,
                    pBF: null
                },
                pC: [
                    {
                        id: 1
                    },
                    {
                        id: 2
                    },
                    {
                        id: 3
                    },
                    {
                        id: 4
                    },
                    {
                        id: 5
                    }
                ]
            }
        }
    }
    // 简单判断
    expect(calculator.checkCondition({
        '$.pB.pBB': 'yes'   // true
    },'and',parent,root,null)).toEqual(true)
    expect(calculator.checkCondition({
        '$.pB.pBD.pBDA#contain': '黄金' // false
    },'and',parent,root,null)).toEqual(false)
    // 简单 and 运算
    expect(calculator.checkCondition({
        '$.pB.pBB': 'yes',  // true
        '$.pB.pBD.pBDA#contain': '黄金' // false
    },'and',parent,root,null)).toEqual(false)
    // 简单 or 运算
    expect(calculator.checkCondition({
        '$.pB.pBB': 'yes',  //true
        '$.pB.pBD.pBDA#contain': '黄金' // false
    },'or',parent,root,null)).toEqual(true)
    // 简单 not 运算
    expect(calculator.checkCondition({
        '$.pB.pBB': 'yes',  // true
        '$.pB.pBD.pBDA#contain': '黄金' // false
    },'not',parent,root,null)).toEqual(true)
    // 嵌套 and 和 or
    expect(calculator.checkCondition({
        '$.pB.pBB': 'yes',  // true
        '$or': {
            '/rA.pB.pBA#in': '$.pB.pBC',    // true
            '$.pB.pBD.pBDA#contain': '黄金' // false
        }
    },'and',parent,root,null)).toEqual(true)
    // 深层嵌套
    expect(calculator.checkCondition({
        '$or': {
            '/rA.pB.pBA#in': '$.pB.pBC',    // true
            '$.pB.pBD.pBDA#contain': '黄金' // false
        },
        '$.pB.pBB': 'yes',  // true
        '$not': {
            '/rA.pB.pBF#isNull': true,   // true
            '$.pB.pBE': undefined,       // true
            '$and': {
                '$.pB.pBA#in': '/rA.pC.$.id',    // true
                '/rA.pB.pBC#ne': [1,2]      // true
            }
        }
    },'and',parent,root,null)).toEqual(false)
})

test('测试 compare 方法', () => {
    let parent = {
        pA: true,
        pB: {
            pBA: 1,
            pBB: 'yes',
            pBC: [1,2,3],
            pBD: {
                pBDA: '这是一本小说，关于爱情和面包'
            },
            pBE: undefined,
            pBF: null
        },
        pC: [
            {
                id: 1
            },
            {
                id: 2
            },
            {
                id: 3
            },
            {
                id: 4
            },
            {
                id: 5
            }
        ]
    }
    let root = {
        rA: {
            error: null,
            data: {
                pA: true,
                pB: {
                    pBA: 1,
                    pBB: 'yes',
                    pBC: [1,2,3],
                    pBD: {
                        pBDA: '这是一本小说，关于爱情和面包'
                    },
                    pBE: undefined,
                    pBF: null
                },
                pC: [
                    {
                        id: 1
                    },
                    {
                        id: 2
                    },
                    {
                        id: 3
                    },
                    {
                        id: 4
                    },
                    {
                        id: 5
                    }
                ]
            }
        }
    }
    // 测试不存在的运算符
    try {
        calculator.compare({
            left: 'id',
            operator: 'yes',
            right: 1
        },parent,root,null)
    }
    catch (err) {
        expect(err.name).toBe('JBDAPCompareError')
        expect(err.fullMessage()).toMatch(/JBDAPOperatorError/)
        expect(err.fullMessage()).toMatch(/运算符 "yes" 不存在/)
    }
    // 长路径中途出现不存在的属性
    try {
        calculator.compare({
            left: '$.pD.pDD',
            operator: 'eq',
            right: 1
        },parent,root,null)
    }
    catch (err) {
        // console.log(err.fullMessage())
        expect(err.name).toBe('JBDAPCompareError')
        expect(err.fullMessage()).toMatch(/Tag2ValueError/)
        expect(err.fullMessage()).toMatch(/不存在 "pD" 属性/)
    }
    // 正常比较
    expect(calculator.compare({
        left: '$.pA',
        operator: 'eq',
        right: true
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pA',
        operator: 'ne',
        right: '/rA.pB.pBF'
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pA',
        operator: 'gte',
        right: 2
    },parent,root,null)).toEqual(false)
    expect(calculator.compare({
        left: '/rA.pB.pBA',
        operator: 'in',
        right: '$.pC.$.id'
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pB.pBD.pBDA',
        operator: 'contain',
        right: '爱情'
    },parent,root,null)).toEqual(true)
    // isUndefined 和 eq undefined 等效
    expect(calculator.compare({
        left: '$.pB.pBE',
        operator: 'isUndefined',
        right: true
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pB.pBE',
        operator: 'eq',
        right: undefined
    },parent,root,null)).toEqual(true)
    // 长路径只有最后一级不存在
    expect(calculator.compare({
        left: '$.pB.pBG',
        operator: 'notExist',
        right: true
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pB.pBD',
        operator: 'exist',
        right: true
    },parent,root,null)).toEqual(true)
    // null 值
    expect(calculator.compare({
        left: '$.pB.pBF',
        operator: 'isNull',
        right: true
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pB.pBF',
        operator: 'eq',
        right: null
    },parent,root,null)).toEqual(true)
    // empty
    expect(calculator.compare({
        left: '$.pB.pBB',
        operator: 'isEmpty',
        right: false
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pB.pBF',
        operator: 'eq',
        right: ''
    },parent,root,null)).toEqual(false)
    // match
    expect(calculator.compare({
        left: '$.pB.pBD.pBDA',
        operator: 'match',
        right: /小说.*面包/
    },parent,root,null)).toEqual(true)
    expect(calculator.compare({
        left: '$.pB.pBD.pBDA',
        operator: 'notMatch',
        right: /很好/
    },parent,root,null)).toEqual(true)
})

test('测试 tag2value 方法', () => {
    // 测试前提，参数只能是字符串，且不为空
    let parent = {
        propA: 'yes',
        propB: {
            propBA: true,
            propBB: {
                propBBA: {
                    propBBAA: ''
                }
            },
            propBC: [
                {
                    id: 1
                },
                {
                    id: 2
                },
                {
                    id: 3
                }
            ]
        }
    }
    let root = {
        rootA: {
            error: null,
            data: {
                propA: 1,
                propB: {
                    propBA: true
                },
                propC: {
                    propCA: {
                        id: 1
                    },
                    propCB: [
                        {
                            id: 1
                        },
                        {
                            id: 2
                        },
                        {
                            id: 3
                        }
                    ]
                }
            }
        },
        rootB: {
            error: null,
            data: null
        }
    }
    // 字段名
    expect(calculator.tag2value('fieldA',parent,root,null)).toEqual('fieldA')
    // 引用尚未查询
    try {
        expect(calculator.tag2value('/rootC',parent,root,null))
    }
    catch (err) {
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagRefNotFilled/)
        expect(err.fullMessage()).toMatch(/尚未执行查询/)
    }
    // 引用对象为 null 且只取引用对象本身
    expect(calculator.tag2value('/rootB',parent,root,null)).toEqual(null)
    // 引用对象为 null，要取其子属性
    try {
        expect(calculator.tag2value('/rootB.test',parent,root,null))
    }
    catch (err) {
        // console.log(err.fullStack())
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不是 Object 类型/)
    }
    // 父对象为 null
    expect(calculator.tag2value('$',null,root,null)).toEqual(null)
    // 父对象为 null，要取其子属性
    try {
        expect(calculator.tag2value('$.test',null,root,null))
    }
    catch (err) {
        // console.log(err.fullStack())
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不是 Object 类型/)
    }
    // 父对象级联取值时非最后的属性不是 object 类型
    try {
        expect(calculator.tag2value('$.propB.propBC.id',parent,root,null))
    }
    catch (err) {
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不是 Object 类型/)
    }
    // 不存在的属性(最后一级属性不存在)
    expect(calculator.tag2value('$.propB.propBB.propBBB',parent,root,null)).toEqual('{NotExist}')
    // 不存在的属性(未到最后一级属性就已经不存在)
    try {
        expect(calculator.tag2value('$.propB.propDD.propBBB',parent,root,null))
    }
    catch (err) {
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不存在 "propDD" 属性/)
    }
    // 从非数组抽取数据
    try {
        expect(calculator.tag2value('/rootA.propC.propCA.$.id',parent,root,null))
    }
    catch (err) {
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不是 Array 类型/)
    }
    // 数组抽取出的属性继续抽取
    try {
        expect(calculator.tag2value('/rootA.propC.propCB.$.id.test',parent,root,null))
    }
    catch (err) {
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不可以继续级联取值/)
    }
    // 多层子属性抽取定义
    try {
        expect(calculator.tag2value('/rootA.propC.propCB.$.id.$.test',parent,root,null))
    }
    catch (err) {
        expect(err.name).toBe('Tag2ValueError')
        expect(err.fullMessage()).toMatch(/TagDefError/)
        expect(err.fullMessage()).toMatch(/不支持多层/)
    }
    // 正常级联取值
    expect(calculator.tag2value('$.propB.propBB.propBBA.propBBAA',parent,root,null)).toEqual('')
    expect(calculator.tag2value('$.propB.propBC.$.id',parent,root,null)).toEqual([1,2,3])
    expect(calculator.tag2value('/rootA.propC.propCA.id',parent,root,null)).toEqual(1)
    expect(calculator.tag2value('/rootA.propC.propCB.$.id',parent,root,null)).toEqual([1,2,3])
    // self 取值
    let self = {
        pA: 1,
        pB: true,
        pC: 'yes'
    }
    expect(calculator.tag2value('pA',parent,root,self)).toEqual(1)
});

test('测试 getValue 方法', () => {
    let list = [
        {
            id: 1,
            p1: 1,
            p2: null,
            p3: '目标1'
        },
        {
            id: 2,
            p1: 5,
            p2: 9.332,
            p3: '目标2'
        },
        {
            id: 3,
            p1: 9,
            p3: '目标3'
        },
        {
            id: 4,
            p1: 4.5,
            p2: 12.3,
            p3: '目标4'
        },
        {
            id: 4,
            p1: 108,
            p2: 42.3,
            p3: '目标5'
        }
    ]
    // count#*
    expect(calculator.getValue(list,{
        name: '',
        operator: 'count',
        fields: '*'
    })).toEqual(5)
    // count#id
    expect(calculator.getValue(list,{
        name: '',
        operator: 'count',
        fields: 'id'
    })).toEqual(5)
    // count#p2 (不全都有的字段)
    expect(calculator.getValue(list,{
        name: '',
        operator: 'count',
        fields: 'p2'
    })).toEqual(3)
    // count#p5 (没有的字段)
    expect(calculator.getValue(list,{
        name: '',
        operator: 'count',
        fields: 'p5'
    })).toEqual(0)
    // count#id,p1（多个字段）
    try {
        calculator.getValue(list,{
            name: '',
            operator: 'count',
            fields: 'id,p1'
        })
    }
    catch (err) {
        expect(err.name).toBe('ValuesCalError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/只接受一个字段/)
    }
    // 无效运算符
    try {
        calculator.getValue(list,{
            name: '',
            operator: 'count2',
            fields: 'id,p1'
        })
    }
    catch (err) {
        expect(err.name).toBe('ValuesCalError')
        expect(err.fullMessage()).toMatch(/OperatorDefError/)
        expect(err.fullMessage()).toMatch(/无效的运算符/)
    }
    // sum#
    expect(calculator.getValue(list,{
        name: '',
        operator: 'sum',
        fields: 'p1'
    })).toEqual(127.5)
    // sum#
    expect(calculator.getValue(list,{
        name: '',
        operator: 'sum',
        fields: 'p2'
    })).toEqual(63.932)
    // avg#
    expect(calculator.getValue(list,{
        name: '',
        operator: 'avg',
        fields: 'p2'
    })).toEqual(12.7864)
    // max#
    expect(calculator.getValue(list,{
        name: '',
        operator: 'max',
        fields: 'p2'
    })).toEqual(42.3)
    // min#
    expect(calculator.getValue(list,{
        name: '',
        operator: 'min',
        fields: 'p1'
    })).toEqual(1)
    // first#
    expect(calculator.getValue(list,{
        name: '',
        operator: 'first',
        fields: 'p3'
    })).toEqual('目标1')
    // first# 字段不存在
    try {
        calculator.getValue(list,{
            name: '',
            operator: 'first',
            fields: 'p5'
        })
    }
    catch (err) {
        expect(err.name).toBe('ValuesCalError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/字段不存在于第一条记录/)
    }
    // pick#id,p1（多个字段）
    try {
        calculator.getValue(list,{
            name: '',
            operator: 'pick',
            fields: 'id,p1'
        })
    }
    catch (err) {
        expect(err.name).toBe('ValuesCalError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/只接受一个字段/)
    }
    // pick#id
    expect(calculator.getValue(list,{
        name: '',
        operator: 'pick',
        fields: 'id'
    })).toEqual([1,2,3,4])
    // clone#*
    expect(calculator.getValue(list,{
        name: '',
        operator: 'clone',
        fields: '*'
    })).toEqual(list)
    // clone#*
    expect(calculator.getValue(list,{
        name: '',
        operator: 'clone',
        fields: 'id,p1'
    })).toEqual([
        {
            id: 1,
            p1: 1
        },
        {
            id: 2,
            p1: 5
        },
        {
            id: 3,
            p1: 9
        },
        {
            id: 4,
            p1: 4.5
        },
        {
            id: 4,
            p1: 108
        }
    ])
    // 下面开始测试空数组返回值
    // count#*
    expect(calculator.getValue([],{
        name: '',
        operator: 'count',
        fields: '*'
    })).toEqual(0)
    // sum#
    expect(calculator.getValue([],{
        name: '',
        operator: 'sum',
        fields: 'p1'
    })).toEqual(null)
    // avg#
    expect(calculator.getValue([],{
        name: '',
        operator: 'avg',
        fields: 'p2'
    })).toEqual(null)
    // max#
    expect(calculator.getValue([],{
        name: '',
        operator: 'max',
        fields: 'p2'
    })).toEqual(null)
    // min#
    expect(calculator.getValue([],{
        name: '',
        operator: 'min',
        fields: 'p1'
    })).toEqual(null)
    // pick#id
    expect(calculator.getValue([],{
        name: '',
        operator: 'pick',
        fields: 'id'
    })).toEqual(null)
    // first#* 从空数组
    expect(calculator.getValue([],{
        name: '',
        operator: 'first',
        fields: 'id'
    })).toEqual(null)
    // clone#* 从空数组
    expect(calculator.getValue([],{
        name: '',
        operator: 'clone',
        fields: '*'
    })).toEqual(null)
    
})