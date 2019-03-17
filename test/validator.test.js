const validator = require('../src/validator')

global.$i18nLanguage = 'zh-cn'

test('测试 checkJson 方法', () => {
    // 整个参数不对
    let json = []
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/传入的 JSON 必须是 Object 类型/)
    }
    // 缺 commands
    json = {}
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/commands/)
    }
    // commands 数据类型不对
    json = {
        commands: ""
    }
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/commands/)
    }
    // commands 数组不能为空
    json = {
        commands: []
    }
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/commands/)
    }
    // security 类型不对
    json = {
        security: 123
    }
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/security/)
    }
    // needLogs 类型不对
    json = {
        needLogs: "true"
    }
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/needLogs/)
    }
    // isTransaction 类型不对
    json = {
        isTransaction: 1
    }
    try {
        validator.checkJson(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/isTransaction/)
    }
    // 完全正常
    json = {
        needLogs: false,
        isTransaction: false,
        commands: [
            {}
        ]
    }
    expect(validator.checkJson(json)).toBe(true)
    json = {
        securit: {},
        needLogs: false,
        isTransaction: false,
        commands: [
            {}
        ]
    }
    expect(validator.checkJson(json)).toBe(true)
});

test('测试 checkCommand 方法', () => {
    // 整个参数不对
    let json = []
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/传入的 'command' 参数必须是 Object 类型/)
    }
    // 缺 name
    json = {}
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/name/)
    }
    // name 不能为空
    json = {
        name: ""
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/name/)
    }
    // 缺 type
    json = {
        name: "test"
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/type/)
    }
    // type 类型不对
    json = {
        name: "test",
        type: "value"
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropValueInvalidError')
        expect(err.fullMessage()).toMatch(/type/)
    }
    // 缺 target
    json = {
        name: "test",
        type: "entity"
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/target/)
    }
    // target 类型不对
    json = {
        name: "test",
        type: "list",
        target: 1
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/target/)
    }
    // onlyIf 类型不对
    json = {
        name: "test",
        type: "list",
        target: "User",
        onlyIf: []
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/onlyIf/)
    }
    // after 类型不对
    json = {
        name: "test",
        type: "list",
        target: "User",
        onlyIf: {},
        after: null
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/after/)
    }
    // query 类型不对
    json = {
        name: "test",
        type: "list",
        target: "User",
        query: []
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/query/)
    }
    // fields 类型不对
    json = {
        name: "test",
        type: "list",
        target: "User",
        query: {},
        fields: {}
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/fields/)
    }
    // fields 是 String 时不能为空
    json = {
        name: "test",
        type: "list",
        target: "User",
        query: {},
        fields: "",
        data: {}
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/fields/)
    }
    // fields 是 Array 时不能为空
    json = {
        name: "test",
        type: "list",
        target: "User",
        query: {},
        fields: [],
        data: {}
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/fields/)
    }
    // data 多余
    json = {
        name: "test",
        type: "list",
        target: "User",
        query: {},
        fields: "*",
        data: {}
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropSpilthError')
        expect(err.fullMessage()).toMatch(/data/)
    }
    // fields 多余
    json = {
        name: "test",
        type: "create",
        target: "User",
        query: {},
        fields: [],
        data: {}
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropSpilthError')
        expect(err.fullMessage()).toMatch(/fields/)
    }
    // query 不应该出现在 create 中
    json = {
        name: "test",
        type: "create",
        target: "User",
        return: true,
        query: {},
        data: {}
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropSpilthError')
        expect(err.fullMessage()).toMatch(/query/)
    }
    // 缺 data
    json = {
        name: "test",
        type: "create",
        target: "User"
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/data/)
    }
    // data 为数组时不能为空
    json = {
        name: "test",
        type: "create",
        target: "User",
        data: []
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/data/)
    }
    // data 类型不对
    json = {
        name: "test",
        type: "create",
        target: "User",
        data: null
    }
    try {
        validator.checkCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/data/)
    }
    // 正常的 list 查询
    json = {
        name: "test",
        type: "list",
        target: "User",
        query: {},
        fields: "*"
    }
    expect(validator.checkCommand(json)).toBe(true)
    // 正常的 values 查询
    json = {
        name: "test",
        type: "values",
        target: "User",
        query: {},
        fields: [
            "*"
        ]
    }
    expect(validator.checkCommand(json)).toBe(true)
    // 正常的 create
    json = {
        name: "test",
        type: "create",
        target: "User",
        data: {
            v1: "",
            v2: ""
        }
    }
    expect(validator.checkCommand(json)).toBe(true)
    // 正常的 delete
    json = {
        name: "test",
        type: "delete",
        target: "User",
        query: {
            where: {}
        }
    }
    expect(validator.checkCommand(json)).toBe(true)
});

test('测试 checkTopCommand 方法', () => {
    // 整个参数不对
    let json = []
    try {
        validator.checkTopCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/传入的 'command' 参数必须是 Object 类型/)
    }
    // return 类型不对
    json = {
        name: "test",
        type: "create",
        target: "User",
        return: 1,
        data: {}
    }
    try {
        validator.checkTopCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/return/)
    }
    // 正常的 topCommand
    json = {
        name: "test",
        type: "create",
        target: "User",
        return: false,
        data: {}
    }
    try {
        validator.checkTopCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/return/)
    }
    json = {
        name: "test",
        type: "create",
        target: "User",
        data: {}
    }
    try {
        validator.checkTopCommand(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/return/)
    }
})

test('测试 checkQuery 方法', () => {
    // 传入 undefined
    expect(validator.checkQuery(undefined)).toEqual(true)
    // 整个参数不对
    let json = []
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/传入的 'query' 参数必须是 Object 类型/)
    }
    // where 类型不对
    json = {
        where: null
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/where/)
        expect(err.fullMessage()).toMatch(/必须是 Object 类型/)
    }
    // order 类型不对
    json = {
        where: {},
        order: null
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/order/)
    }
    // order 不能为空
    json = {
        where: {},
        order: ""
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/order/)
    }
    // group 类型不对
    json = {
        where: {},
        order: [],
        group: null
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/group/)
    }
    // group 不能为空
    json = {
        where: {},
        order: [],
        group: ""
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/group/)
    }
    // size 类型错误
    json = {
        where: {},
        order: [],
        group: [],
        size: ''
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/size/)
    }
    // size 不能小于 0
    json = {
        where: {},
        order: [],
        group: [],
        size: -1
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropValueInvalidError')
        expect(err.fullMessage()).toMatch(/size/)
    }
    // page 类型错误
    json = {
        where: {},
        order: [],
        group: [],
        size: 10,
        page: '1'
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/page/)
    }
    // page 不能小于等于 0
    json = {
        where: {},
        order: [],
        group: [],
        size: 10,
        page: 0
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropValueInvalidError')
        expect(err.fullMessage()).toMatch(/page/)
    }
    // page 存在则 size 必须也在
    json = {
        where: {},
        order: [],
        group: [],
        page: 1
    }
    try {
        validator.checkQuery(json)
    }
    catch (err) {
        expect(err.name).toBe('PropMissingError')
        expect(err.fullMessage()).toMatch(/page/)
        expect(err.fullMessage()).toMatch(/size/)
    }
    // 正常的 query
    json = {
        where: {},
        order: [],
        group: [],
        size: 10,
        page: 2
    }
    expect(validator.checkQuery(json)).toEqual(true)
})

test('测试 checkAfter 方法', () => {
    // 传入 undefined
    expect(validator.checkAfter(undefined)).toEqual(true)
    // 整个参数不对
    let json = []
    try {
        validator.checkAfter(json)
    }
    catch (err) {
        expect(err.name).toBe('ParamTypeError')
        expect(err.fullMessage()).toMatch(/属性 'after' 必须是 Object 或者 Array 类型/)
    }
    // 传入 undefined
    expect(validator.checkAfter({})).toEqual(true)
})

test('测试 checkData 方法', () => {
    // 传入 undefined
    try {
        validator.checkData('update',undefined)
    }
    catch (err) {
        expect(err.name).toBe('ParamMissingError')
        expect(err.fullMessage()).toMatch(/属性 'data' 必须要定义/)
    }
    // 类型不对
    let json = 123
    try {
        validator.checkData('create',json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/属性 'data' 必须是 Object 或者 Array 类型/)
    }
    // create 指令
    // 空对象
    json = {}
    try {
        validator.checkData('create',json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/属性 'data' 不能为空对象/)
    }
    json = []
    try {
        validator.checkData('create',json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/属性 'data' 不能为空数组/)
    }
    try {
        validator.checkData('update',json)
    }
    catch (err) {
        expect(err.name).toBe('PropTypeError')
        expect(err.fullMessage()).toMatch(/属性 'data' 必须是 Object 类型/)
    }
    json = ''
    try {
        validator.checkData('increase',json)
    }
    catch (err) {
        expect(err.name).toBe('PropEmptyError')
        expect(err.fullMessage()).toMatch(/属性 'data' 不能为空字符串/)
    }
    // delete 不能有 data
    json = {
        title: '123'
    }
    try {
        validator.checkData('delete',json)
    }
    catch (err) {
        expect(err.name).toBe('PropSpilthError')
        expect(err.fullMessage()).toMatch(/属性 'data' 不应该出现/)
    }
    json = {
        title: '123'
    }
    expect(validator.checkData('create',json)).toEqual(true)
    json = [{
        title: '123'
    }]
    expect(validator.checkData('create',json)).toEqual(true)
})