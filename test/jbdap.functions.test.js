const JBDAP = require('../src/JBDAP')
const knex = require('../demo/database').conn

test('测试 getCurrentUser 方法', async () => {
    expect.assertions(4);
    let userInfo = await JBDAP.getCurrentUser(knex)
    expect(userInfo.id).toEqual(0)
    expect(userInfo.role).toEqual('default')
    userInfo = await JBDAP.getCurrentUser(knex,'')
    expect(userInfo.id).toEqual(0)
    expect(userInfo.role).toEqual('default')
})
