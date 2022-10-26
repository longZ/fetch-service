import EventEmitter from 'eventemitter3'
import { deepClone, isFunction, renderTemplate, timeoutPromise } from "./util";
import { request } from "./request";
import {
  EVENT_ERROR, EVENT_PARSE_OPTION, EVENT_REQUESTED,
  EVENT_WILL_REQUEST, REQUEST_METHOD_GET
} from "./constrants";
const Promise = require('es6-promise').Promise;

class FetchService {
  _eventer = new EventEmitter()
  _globalParseResponse = null
  _tokenFun = null
  _requestNeedToken = false
  _requestHeaderTokenName = 'fetch-service-auth-token'
  _customParseResponse

  constructor(op = {}) {
    this._globalParseResponse = op.parseResponse

    this._tokenFun = op.tokenFun

    if (op.customParseResponse) {
      this._customParseResponse = op.customParseResponse
    }

    if (op.requestNeedToken) {
      this._requestNeedToken = true
    }

    if (op.headers) {
      this._globalHeader = op.headers
    }

    if (op.mode) {
      this._mode = op.mode
    }

    if (op.credentials) {
      this._credentials = op.credentials
    }

    if (op.tokenHeaderName) {
      this._requestHeaderTokenName = op.tokenHeaderName
    }
  }

  __parseResponse(apiOption, data) {

    let resolveData = data

    if (isFunction(this._globalParseResponse)) {
      resolveData = this._globalParseResponse(resolveData, apiOption)
    }

    if (isFunction(apiOption.parseResponse)) {
      resolveData = apiOption.parseResponse(resolveData)
    }

    return resolveData
  }

  __parseParam(p, apiOption) {
    if (isFunction(apiOption.parseParam)) {
      return apiOption.parseParam(p)
    }

    return p
  }

  __parseOption(apiOption, param) {
    const {
      headers = {},
      method = REQUEST_METHOD_GET,
      mode = this._mode,
      credentials = this._credentials
    } = apiOption

    let _globalHeaders = this._globalHeader
    let _localHeaders = headers

    if (isFunction(this._globalHeader)) {
      _globalHeaders = this._globalHeader(param, apiOption)
    }

    if (isFunction(headers)) {
      _localHeaders = headers(param, apiOption)
    }

    let newHeaders = deepClone(Object.assign({}, _globalHeaders, _localHeaders))

    return p => {
      this._eventer.emit(EVENT_PARSE_OPTION, apiOption, p, newHeaders)

      const ret = {
        body: p,
        headers: newHeaders,
        method
      }

      if (mode) {
        ret.mode = mode
      }

      if (credentials) {
        ret.credentials = credentials
      }

      return ret
    }
  }

  __request(apiOption, p) {
    return op => {
      this._eventer.emit(EVENT_WILL_REQUEST, apiOption, op, p)

      const url = renderTemplate(apiOption.url, p)

      if (apiOption.debug && apiOption.mock) {
        // debug模式下， 使用mock数据模拟数据
        let resolveData = apiOption.mock

        if (isFunction(resolveData)) {
          resolveData = resolveData(p)
        }

        return timeoutPromise(() => resolveData, 1000)
      }

      const useOriginResponse = apiOption.useOriginResponse || !!this._customParseResponse

      return request(url, op, apiOption.useQueue, apiOption.cache, useOriginResponse).then(res => {
        if (this._customParseResponse) {
          return this._customParseResponse(res, url, op, apiOption)
        }

        return res
      })
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
      if (this._requestNeedToken
        && apiOption.requestNeedToken !== false
        && isFunction(this._tokenFun)) {
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
      const promise = Promise.resolve(this.__parseParam(p, apiOption))

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
    if (isFunction(fun)) {
      this._eventer.on(eventName, fun)
    }
  }

  off(eventName, fun) {
    this._eventer.off(eventName, fun)
  }
}

export default FetchService