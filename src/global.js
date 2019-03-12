/**
 * 对 global 进行丰富
 */

// 换行符
import { EOL } from 'os'
global.EOL = EOL

// 丰富原生 js
import './makeup'

/**
 * 基于NiceError的一系列错误处理策略
 * 定义一个错误
 * 抛出一个错误
 * 处理一个错误
 */
import NiceError from './NiceError'
global.NiceError = NiceError
// 返回一个NiceError对象
global.$newError = function(message,cause,info,name){
    return new NiceError(
        message,
        {
            cause: cause,
            info: info,
            name: name
        }
    );
}
// 创建NiceError对象并抛出
global.$throwError = function(message,cause,info,name){
    throw new NiceError(
        message,
        {
            cause: cause,
            info: info,
            name: name
        }
    );
};

// 用于封装 Promise 的返回结果
// 成功的话 error 为 null
// 失败时 error 就是捕捉到的错误
global.$exec = (promise) => {
    return promise
        .then((data) => {
            return {
                error: null,
                data: data
            }
        })
        .catch((err) => {
            return {
                error: err,
                data: null
            }
        })
}

// 全局挂载 lodash
import _ from 'lodash'
global._ = _

// 全局挂载 crypto
import crypto from './crypto'
global.crypto = crypto