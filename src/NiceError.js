/**
 * 自定义异常处理
 */
const NiceError = function(message,options) {
    this.name = (options && options.name) ? options.name : 'NiceError'
    this.message = message
    this.info = (options && options.info) ? options.info : {}
    this.cause = (options && options.cause) ? options.cause : null
    this.stack = (new Error).stack.replace('Error' + EOL, this.fullMessage() + EOL).replaceAll(process.cwd(),'').replaceAll('file://','')
}
NiceError.prototype = Object.create(Error.prototype)
NiceError.prototype.constructor = NiceError
NiceError.prototype.fullMessage = function(){
    function _getCauseMessage(ne){
        // 递归获取子错误的描述信息然后拼组起来
        let result = undefined;
        if (ne instanceof NiceError || ne instanceof Error) result = '[' + ne.name + ']：' + ne.message
        // 这一句是为了兼容那些没有继承 Error 原型的第三方封装错误
        else if (Object.prototype.toString(ne) === '[object Object]') result = ne.toString()
        if (ne.cause) result += ' <= ' + _getCauseMessage(ne.cause)
        return result
    }
    return _getCauseMessage(this)
};
NiceError.prototype.fullStack = function(){
    function _getFullStack(ne,first){
        // 递归获取子错误的stack然后倒序拼组起来
        let result = undefined
        let causedBy = ''
        if (!first) causedBy = 'Caused by '
        if (ne instanceof Error) result = causedBy + ne.stack.replaceAll(process.cwd(),'').replaceAll('file://','')
        else if (ne instanceof NiceError) result = causedBy + ne.stack
        // 这一句是为了兼容那些没有继承 Error 原型的第三方封装错误
        else if (Object.prototype.toString(ne) === '[object Object]') result = causedBy + ne.stack.replaceAll(process.cwd(),'').replaceAll('file://','')
        if (ne.cause) result += EOL + _getFullStack(ne.cause)
        return result
    }
    return _getFullStack(this,true)
};
NiceError.prototype.fullInfo = function(){
    function _getFullInfo(ne){
        // 递归获取子错误的信息然后合并
        let result = {}
        if (ne instanceof NiceError) _.assign(result, ne.info)
        if (ne.cause) _.assign(result,_getFullInfo(ne.cause))
        return result
    }
    return _getFullInfo(this)
};

module.exports = NiceError