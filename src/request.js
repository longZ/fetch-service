import fetch from './fetch'
import {
  REQUEST_METHOD_GET,
  REQUEST_METHOD_DELETE,
  CONTENT_TYPES
} from './constrants'
import {parseJson, json2param, promiseAll} from "./util";

// 获取请求选项
function mergeOption (options) {
  if (typeof options !== 'object') {
    options = {}
  }

  const { headers, ...otherOptions } = options

  // 默认选项
  const defaultOption = {
    headers: {
      // 'Content-Type': CONTENT_TYPES.JSON,
      // 'X-Requested-With': 'XMLHttpRequest',
      ...headers
    },
    method: REQUEST_METHOD_GET,
    // mode: 'cors',
    // credentials: 'include',
    ...otherOptions
  }

  const { body, method = REQUEST_METHOD_GET } = defaultOption
  
  if(typeof defaultOption.method !== 'string'
    || !ALL_METHODS.includes(defaultOption.method.toLowerCase())) {
    defaultOption.method = REQUEST_METHOD_GET
  }

  if (window && window.FormData && body instanceof window.FormData) {
    delete defaultOption.headers['Content-Type']
  } else if (typeof body === 'number') {
    defaultOption.body = `${body}`
  } else if (typeof body === 'object') {
    if (method === REQUEST_METHOD_GET
        || method === REQUEST_METHOD_DELETE
        || defaultOption.headers['Content-Type'] === CONTENT_TYPES.FORM_URL) {
      defaultOption.body = json2param(body)
    } else if (defaultOption.headers['Content-Type'] === CONTENT_TYPES.JSON) {
      defaultOption.body = JSON.stringify(body)
    }
  }

  return defaultOption
}

// 处理url
function dealUrl (url, options) {
  const { method = REQUEST_METHOD_GET, body } = options

  if ((method === REQUEST_METHOD_GET || method === REQUEST_METHOD_DELETE) && typeof body === 'string') {
    if (url.indexOf('?') < 0) {
      url += '?'
    } else if (url[url.length - 1] !== '&') {
      url += '&'
    }

    url += body
    delete options.body
  }

  return url
}

// 处理成功状态
function dealStatus (response) {
  if (response.status === 200) {
    return response.text().then(txt => {
      return parseJson(txt)
    })
  } else {
    return Promise.reject(response)
  }
}

// 缓存结果
function cacheResponse (url, useCache) {
  return json => {
    if (useCache) {
      _requestCache[url] = json
    }
    return json
  }
}

const _fetchQueue = []
let _fetchQueueStarting = false

function _addFetchQueue(url, option, useCache) {
  return new Promise((resolve, reject) => {
    _fetchQueue.push({
      url, option, successFun: resolve, failFun: reject, useCache
    })
    _startQueue()
  })
}

function _startQueue() {
  if (_fetchQueueStarting) {
    return
  }

  _fetchQueueStarting = true

  promiseAll(_fetchQueue, ({url, option, successFun, failFun, useCache}) => {
    if (useCache && _requestCache[url]) {
      return Promise.resolve(_requestCache[url])
    }

    return fetch(url, option).then(successFun).catch(failFun)
  }).finally(() => {
    _fetchQueueStarting = false
  })
}

let _requestCache = {}

/**
 * 请求接口
 * @param url 请求地址
 * @param options fetch Options {method, mode, headers, body, credentials, synchronous}
 * @param useQueue 是否使用请求队列
 * @returns {PromiseLike<T> | Promise<T>}
 */
export function request (url, options, useQueue = false, useCache = false) {
  const lastOption = mergeOption(options)
  const lastUrl = dealUrl(url, lastOption)

  if (useQueue) {
    return _addFetchQueue(lastUrl, lastOption, useCache).then(dealStatus).then(cacheResponse(lastUrl, useCache))
  }else {
    if (useCache && _requestCache[lastUrl]) {
      return Promise.resolve(_requestCache[lastUrl])
    }

    return fetch(lastUrl, lastOption).then(dealStatus).then(cacheResponse(lastUrl, useCache))
  }
}

export function clearRequestCache () {
  _requestCache = {}
}
