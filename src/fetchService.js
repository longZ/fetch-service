import EventEmitter from 'eventemitter3'
import {renderTemplate, timeoutPromise} from "./util";
import {request} from "./request";
import {EVENT_ERROR, EVENT_REQUESTED, EVENT_WILL_REQUEST} from "./constrants";

class FetchService {
  _eventer = new EventEmitter()
  _globalParseResponse = null
  _tokenFun = null
  _requestNeedToken = false
  _requestHeaderTokenName = 'fetch-service-auth-token'

  constructor(op = {}) {
    this._globalParseResponse = op.parseResponse

    this._tokenFun = op.tokenFun

    if (op.requestNeedToken) {
      this._requestNeedToken = true
    }

    if (op.headers) {
      this._globalHeader = op.headers
    }

    if (op.tokenHeaderName) {
      this._requestHeaderTokenName = op.tokenHeaderName
    }
  }

  __parseResponse(apiOption, data) {

    let resolveData = data

    if (typeof this._globalParseResponse === 'function') {
      resolveData = this._globalParseResponse(resolveData, apiOption)
    }

    if (typeof apiOption.parseResponse === 'function') {
      resolveData = apiOption.parseResponse(resolveData)
    }

    return resolveData
  }

  __parseParam(p, apiOption) {
    if (typeof apiOption.parseParam === 'function') {
      return apiOption.parseParam(p)
    }

    return p
  }

  __parseOption(apiOption, param) {
    const {
      headers,
      method,
      mode,
      credentials,
      cache
    } = apiOption

    let newHeaders = this._globalHeader || {}

    if (typeof headers === 'function') {
      Object.assign(newHeaders, headers(param, apiOption))
    } else if (typeof headers === 'object') {
      Object.assign(newHeaders, headers)
    }

    return p => ({
      body: p,
      headers: newHeaders,
      method,
      mode,
      credentials,
      cache
    })
  }

  __request(apiOption, p) {
    return op => {
      const url = renderTemplate(apiOption.url, p)

      this._eventer.emit(EVENT_WILL_REQUEST, apiOption, op, p)

      if (apiOption.debug && apiOption.mock) {
        // debug模式下， 使用mock数据模拟数据
        let resolveData = apiOption.mock

        if (typeof resolveData === 'function') {
          resolveData = resolveData(p)
        }

        return timeoutPromise(() => resolveData, 1000)
      }

      return request(url, op, apiOption.useQueue)
    }
  }

  __response(apiOption) {
    return res => this.__parseResponse(apiOption, res)
  }

  __handleError(apiOption) {
    return err => !apiOption.noErrorTip && this._eventer.emit(EVENT_ERROR, err, apiOption)
  }

  __ensureToken(apiOption, p) {
    return op => {
      if (this._requestNeedToken && typeof this._tokenFun === 'function') {
        return this._tokenFun(apiOption, p).then(token => {
          if (!op.headers) {
            op.headers = {}
          }

          op.headers[this._requestHeaderTokenName] = token
          return op
        })
      }

      return op
    }
  }

  parseOption(apiOption) {
    return p => {
      // 解析传参
      const promise =  Promise.resolve(this.__parseParam(p, apiOption))

      // 解析选项
      .then(this.__parseOption(apiOption, p))

      // 开始发送请求
      .then(this.__ensureToken(apiOption, p))

      // 开始发送请求
      .then(this.__request(apiOption, p))

      // 响应请求
      .then(this.__response(apiOption))

      // 请求出错
      promise.catch(this.__handleError(apiOption))

      // 请求结束
      .finally(() => this._eventer.emit(EVENT_REQUESTED, apiOption))

      return promise
    }
  }

  on(eventName, fun) {
    if (typeof fun === 'function') {
      this._eventer.on(eventName, fun)
    }
  }

  off(eventName, fun) {
    if (typeof fun === 'function') {
      this._eventer.off(eventName, fun)
    }
  }
}

export default FetchService