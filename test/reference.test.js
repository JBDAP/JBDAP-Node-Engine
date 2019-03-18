const reference = require('../src/reference')

test('测试 getObjFromObj 方法', () => {
    let data = {}
    let fields = '*'
    expect(reference.getObjFromObj(data,fields)).toEqual({})
    data = {
        pA: 1,
        pB: true,
        pC: 'yes'
    }
    expect(reference.getObjFromObj(data,fields)).toEqual({
        pA: 1,
        pB: true,
        pC: 'yes'
    })
    fields = ['pA','pB']
    expect(reference.getObjFromObj(data,fields)).toEqual({
        pA: 1,
        pB: true
    })
    // 别名
    fields = ['pA',{bigB: 'pB'}]
    expect(reference.getObjFromObj(data,fields)).toEqual({
        pA: 1,
        bigB: true
    })
    // 不存在的字段
    try {
        fields = ['pA','pD']
        reference.getObjFromObj(data,fields)
    }
    catch (err) {
        expect(err.name).toBe('DealRefError')
        expect(err.fullMessage()).toMatch(/FieldNotExistError/)
    }
    try {
        fields = ['pA',{bigB: 'pD'}]
        reference.getObjFromObj(data,fields)
    }
    catch (err) {
        expect(err.name).toBe('DealRefError')
        expect(err.fullMessage()).toMatch(/FieldNotExistError/)
    }
})

test('测试 getObjFromList 方法', () => {
    let data = []
    let query = undefined
    let fields = '*'
    // 空列表
    expect(reference.getObjFromList(data,query,fields,null,null)).toEqual(null)
    // 有数据，无查询，则返回第一条
    data = [
        {
            pA: 1,
            pB: true,
            pC: 'yes'
        },
        {
            pA: 2,
            pB: false,
            pC: 'no'
        }    
    ]
    expect(reference.getObjFromList(data,query,fields,null,null)).toEqual({
        pA: 1,
        pB: true,
        pC: 'yes'
    })
    // 过滤部分字段返回
    fields = ['pA','pB']
    expect(reference.getObjFromList(data,query,fields,null,null)).toEqual({
        pA: 1,
        pB: true
    })
    fields = ['pA',{bigB: 'pB'}]
    expect(reference.getObjFromList(data,query,fields,null,null)).toEqual({
        pA: 1,
        bigB: true
    })
    // 加入排序
    query = {
        order: 'pA#desc'
    }
    expect(reference.getObjFromList(data,query,fields,null,null)).toEqual({
        pA: 2,
        bigB: false
    })
    // 条件筛选
    query = {
        where: {
            pA: 2,
            $or: {
                'pB#ne': false,
                'pC#contain': 'o'
            }
        }
    }
    expect(reference.getObjFromList(data,query,fields,null,null)).toEqual({
        pA: 2,
        bigB: false
    })
})

test('测试 getListFromList 方法', () => {
    let data = []
    let query = undefined
    let fields = '*'
    // 空列表
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual(null)
    // 有数据，无查询，则返回全部
    data = [
        {
            pA: 1,
            pB: true,
            pC: 'yes'
        },
        {
            pA: 2,
            pB: false,
            pC: 'no'
        },
        {
            pA: 3,
            pB: true,
            pC: 'yes'
        },
        {
            pA: 4,
            pB: false,
            pC: 'no'
        },
        {
            pA: 5,
            pB: true,
            pC: 'yes'
        }
    ]
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual(data)
    // 过滤部分字段返回
    fields = ['pA','pB']
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual([
        {
            pA: 1,
            pB: true
        },
        {
            pA: 2,
            pB: false
        },
        {
            pA: 3,
            pB: true
        },
        {
            pA: 4,
            pB: false
        },
        {
            pA: 5,
            pB: true
        }
    ])
    fields = ['pA',{bigB: 'pB'}]
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual([
        {
            pA: 1,
            bigB: true
        },
        {
            pA: 2,
            bigB: false
        },
        {
            pA: 3,
            bigB: true
        },
        {
            pA: 4,
            bigB: false
        },
        {
            pA: 5,
            bigB: true
        }
    ])
    // 加入排序
    query = {
        order: 'pA#desc'
    }
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual([
        {
            pA: 5,
            bigB: true
        },
        {
            pA: 4,
            bigB: false
        },
        {
            pA: 3,
            bigB: true
        },
        {
            pA: 2,
            bigB: false
        },
        {
            pA: 1,
            bigB: true
        }
    ])
    // 条件筛选
    query = {
        where: {
            'pA#gte': 2,
            $or: {
                'pB#ne': false,
                'pC#eq': 'yes'
            }
        }
    }
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual([
        {
            pA: 3,
            bigB: true
        },
        {
            pA: 5,
            bigB: true
        }
    ])
    // 条件 + 分页
    query = {
        where: {
            'pA#gte': 2
        },
        order: 'pA#desc',
        size: 2,
        page: 2
    }
    expect(reference.getListFromList(data,query,fields,null,null)).toEqual([
        {
            pA: 3,
            bigB: true
        },
        {
            pA: 2,
            bigB: false
        }
    ])
})

test('测试 getValueFromList 方法', () => {
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
    let fields = [
        {
            name: 'count',
            operator: 'count',
            fields: '*'
        },
        {
            name: 'sump1',
            operator: 'sum',
            fields: 'p1'
        },
        {
            name: 'sump2',
            operator: 'sum',
            fields: 'p2'
        },
        {
            name: 'avgp2',
            operator: 'avg',
            fields: 'p2'
        },
        {
            name: 'maxp2',
            operator: 'max',
            fields: 'p2'
        },
        {
            name: 'minp1',
            operator: 'min',
            fields: 'p1'
        },
        {
            name: 'firstp3',
            operator: 'first',
            fields: 'p3'
        },
        {
            name: 'pickid',
            operator: 'pick',
            fields: 'id'
        },
        {
            name: 'clonepart',
            operator: 'clone',
            fields: 'id,p1'
        }
    ]
    expect(reference.getValuesFromList(list,fields)).toEqual({
        count: 5,
        sump1: 127.5,
        sump2: 63.932,
        avgp2: 12.7864,
        maxp2: 42.3,
        minp1: 1,
        firstp3: '目标1',
        pickid: [1,2,3,4],
        clonepart: [
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
        ]
    })
    expect(reference.getValuesFromList([],fields)).toEqual({
        count: 0,
        sump1: null,
        sump2: null,
        avgp2: null,
        maxp2: null,
        minp1: null,
        firstp3: null,
        pickid: null,
        clonepart: null
    })
})