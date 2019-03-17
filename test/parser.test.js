const parser = require('../src/parser')

global.$i18nLanguage = 'zh-cn'

test('测试 parseFields 方法', () => {
    // 测试前提，fields 字段已经通过类型验证，不是字符串就是 object ，且不为空
    // 传入 undefined
    expect(parser.parseFields(undefined)).toEqual({
        raw: '*',
        values: [],
        cascaded: []
    })
    // 传入 * 字符串
    let json = "*"
    expect(parser.parseFields(json).raw).toEqual('*')
    // 传入单字段
    json = "id"
    expect(parser.parseFields(json).raw).toEqual(['id'])
    // 传入多字段
    json = "id,name,password,"
    expect(parser.parseFields(json).raw).toEqual(['id','name','password'])
    // 数组形式
    json = ['*']
    expect(parser.parseFields(json).raw).toEqual('*')
    json = ['id','createdAt','*']
    try {
        parser.parseFields(json)
    }
    catch (err) {
        expect(err.name).toBe('FieldsPaserError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/检查 'fields' 定义/)
    }
    json = ['*','id','createdAt']
    try {
        parser.parseFields(json)
    }
    catch (err) {
        expect(err.name).toBe('FieldsPaserError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/不能再定义其它字段名/)
    }
    // 别名
    json = [
        'id',
        'createdAt=>ctime'
    ]
    expect(parser.parseFields(json).raw).toEqual(['id', { ctime: 'createdAt' }])
    // 别名定义有误
    json = [
        'id',
        'createdAt=>'
    ]
    try {
        parser.parseFields(json)
    }
    catch (err) {
        expect(err.name).toBe('FieldsPaserError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/'createdAt=>'/)
    }
    // 别名定义有误
    json = [
        'id',
        'createdAt=>ct=>'
    ]
    try {
        parser.parseFields(json)
    }
    catch (err) {
        expect(err.name).toBe('FieldsPaserError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/有多于1个 '=>' 符号/)
    }
    // 数组元素有误
    json = [
        'id',
        'createdAt',
        []
    ]
    try {
        parser.parseFields(json)
    }
    catch (err) {
        expect(err.name).toBe('FieldsPaserError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/必须是 String 或者 Object/)
    }
    // 复杂情况
    json = [
        '*',
        'createdAt=>ctime',
        {}
    ]
    try {
        parser.parseFields(json)
    }
    catch (err) {
        expect(err.name).toBe('FieldsPaserError')
        expect(err.fullMessage()).toMatch(/FieldsDefError/)
        expect(err.fullMessage()).toMatch(/不能再定义其它字段名/)
    }
    json = [
        '*',
        {}
    ]
    expect(parser.parseFields(json).raw).toEqual('*')
    expect(parser.parseFields(json).cascaded).toEqual([{}])
    // values 查询
    json = [
        'count#id=>totalNumber'
    ]
    expect(parser.parseFields(json).values).toEqual([{
        name: 'totalNumber',
        operator: 'count',
        fields: 'id'
    }])
    json = [
        'clone#id,name,pass,createdAt=>UsersList'
    ]
    expect(parser.parseFields(json).values).toEqual([{
        name: 'UsersList',
        operator: 'clone',
        fields: 'id,name,pass,createdAt'
    }])
});

test('测试 parseDataString 方法', () => {
    // 测试前提，传入参数已经通过类型验证，只能是非空字符串
    // 缺少:
    let input = 'id'
    try {
        parser.parseDataString(input)
    }
    catch (err) {
        expect(err.name).toBe('DataPaserError')
        expect(err.fullMessage()).toMatch(/DataDefError/)
        expect(err.fullMessage()).toMatch(/必须且只能有一个 ':' 字符/)
        expect(err.fullMessage()).toMatch(/定义有误/)
    }
    // 多:
    input = 'id:123:12'
    try {
        parser.parseDataString(input)
    }
    catch (err) {
        expect(err.name).toBe('DataPaserError')
        expect(err.fullMessage()).toMatch(/DataDefError/)
        expect(err.fullMessage()).toMatch(/必须且只能有一个 ':' 字符/)
        expect(err.fullMessage()).toMatch(/定义有误/)
    }
    // :两边有空白
    input = 'id:'
    try {
        parser.parseDataString(input)
    }
    catch (err) {
        expect(err.name).toBe('DataPaserError')
        expect(err.fullMessage()).toMatch(/DataDefError/)
        expect(err.fullMessage()).toMatch(/定义有误/)
        expect(err.fullMessage()).toMatch(/':' 两侧都不能是空字符串/)
    }
    // 不能有空格
    input = 'id :123'
    try {
        parser.parseDataString(input)
    }
    catch (err) {
        expect(err.name).toBe('DataPaserError')
        expect(err.fullMessage()).toMatch(/DataDefError/)
        expect(err.fullMessage()).toMatch(/不能含有空格/)
    }
    // 比较对象是字符串
    input = 'id:1'
    expect(parser.parseDataString(input)).toEqual({id: 1})
    // 字符串转数字失败
    input = 'id:*1o'
    try {
        parser.parseDataString(input)
    }
    catch (err) {
        expect(err.name).toBe('DataPaserError')
        expect(err.fullMessage()).toMatch(/DataValueInvalidError/)
        expect(err.fullMessage()).toMatch(/不是有效数字/)
    }
    // 数字小于0
    input = 'id:-2'
    try {
        parser.parseDataString(input)
    }
    catch (err) {
        expect(err.name).toBe('DataPaserError')
        expect(err.fullMessage()).toMatch(/DataValueInvalidError/)
        expect(err.fullMessage()).toMatch(/不能小于等于 0/)
    }
});

test('测试 parseOrder 方法', () => {
    // 测试前提，order 字段已经通过类型验证，不是字符串就是 array ，且不为空
    // 传入 undefined
    expect(parser.parseOrder(undefined)).toEqual([])
    // 传入字符串
    expect(parser.parseOrder('id')).toEqual([{column:'id',order:'asc'}])
    expect(parser.parseOrder('id#desc')).toEqual([{column:'id',order:'desc'}])
    // 传入字符串带有 # 但是前后有空
    try {
        parser.parseOrder('id#')
    }
    catch(err) {
        expect(err.name).toBe('OrderPaserError')
        expect(err.fullMessage()).toMatch(/OrderDefError/)
        expect(err.fullMessage()).toMatch(/定义有误/)
    }
    // 传入字符串有多个 #    
    try {
        parser.parseOrder('id#asc#')
    }
    catch(err) {
        expect(err.name).toBe('OrderPaserError')
        expect(err.fullMessage()).toMatch(/OrderDefError/)
        expect(err.fullMessage()).toMatch(/有多于1个/)
    }
    // 传入空数组
    expect(parser.parseOrder([])).toEqual([])
    // 传入数组中有非 String
    try {
        parser.parseOrder([1,2])
    }
    catch(err) {
        expect(err.name).toBe('OrderPaserError')
        expect(err.fullMessage()).toMatch(/OrderDefError/)
        expect(err.fullMessage()).toMatch(/元素不是 String 类型/)
    }
    // 传入数组中的 String 元素有问题
    try {
        parser.parseOrder(['id#'])
    }
    catch(err) {
        expect(err.name).toBe('OrderPaserError')
        expect(err.fullMessage()).toMatch(/OrderDefError/)
        expect(err.fullMessage()).toMatch(/定义有误/)
    }
    // 传入数组中的 String 元素有多个 #    
    try {
        parser.parseOrder(['id#asc#'])
    }
    catch(err) {
        expect(err.name).toBe('OrderPaserError')
        expect(err.fullMessage()).toMatch(/OrderDefError/)
        expect(err.fullMessage()).toMatch(/有多于1个/)
    }
})

test('测试 parseOffsetAndLimit 方法', () => {
    // 测试前提，page 和 size 两个参数已经经过检验，只要存在就是 integer 类型且合法
    // 传入 undefined
    expect(parser.parseOffsetAndLimit(undefined,undefined)).toEqual({
        offset: 0,
        limit: 0
    })
    // 只定义了 size 未定义 page
    expect(parser.parseOffsetAndLimit(undefined,10)).toEqual({
        offset: 0,
        limit: 10
    })
    // 只定义了 page 未定义 size
    // 传入字符串带有 # 但是前后有空
    try {
        parser.parseOffsetAndLimit(1,undefined)
    }
    catch(err) {
        expect(err.name).toBe('QueryPaserError')
        expect(err.fullMessage()).toMatch(/SizeDefError/)
        expect(err.fullMessage()).toMatch(/也必须定义 'size'/)
    }
    // 两个都定义
    expect(parser.parseOffsetAndLimit(2,10)).toEqual({
        offset: 10,
        limit: 10
    })
})

test('测试 parseComparision 方法', () => {
    // 测试前提，传入参数已经通过类型验证，且不为空
    // key 错误
    try {
        parser.parseComparision('id#',1)
    }
    catch (err) {
        expect(err.name).toBe('ComparisionParserError')
        expect(err.fullMessage()).toMatch(/OpDefError/)
        expect(err.fullMessage()).toMatch(/运算条件/)
        expect(err.fullMessage()).toMatch(/定义有误/)
    }
    try {
        parser.parseComparision('id#eq#',1)
    }
    catch (err) {
        expect(err.name).toBe('ComparisionParserError')
        expect(err.fullMessage()).toMatch(/OpDefError/)
        expect(err.fullMessage()).toMatch(/id#eq#/)
        expect(err.fullMessage()).toMatch(/定义有误/)
    }
    // 正确输出
    expect(parser.parseComparision('id',1)).toEqual({
        left: 'id',
        operator: 'eq',
        right: 1
    })
    expect(parser.parseComparision('views#gte',100)).toEqual({
        left: 'views',
        operator: 'gte',
        right: 100
    })
    expect(parser.parseComparision('content#like','%政治')).toEqual({
        left: 'content',
        operator: 'like',
        right: '%政治'
    })
    expect(parser.parseComparision('id#in',[1,2,4,6,7,8])).toEqual({
        left: 'id',
        operator: 'in',
        right: [1,2,4,6,7,8]
    })
});
