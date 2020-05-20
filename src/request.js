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
      'Content-Type': CONTENT_TYPES.JSON,
      'X-Requested-With': 'XMLHttpRequest',
      ...headers
    },
    method: REQUEST_METHOD_GET,
    mode: 'cors',
    credentials: 'include',
    ...otherOptions
  }

  const { body, method = REQUEST_METHOD_GET } = defaultOption

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

const _fetchQueue = []
let _fetchQueueStarting = false

function _addFetchQueue(url, option) {
  return new Promise((resolve, reject) => {
    _fetchQueue.push({
      url, option, successFun: resolve, failFun: reject
    })
    _startQueue()
  })
}

function _startQueue() {
  if (_fetchQueueStarting) {
    return
  }

  _fetchQueueStarting = true

  promiseAll(_fetchQueue, ({url, option, successFun, failFun}) => {
    return fetch(url, option).then(successFun).catch(failFun)
  }).finally(() => {
    _fetchQueueStarting = false
  })
}
/**
 * 请求接口
 * @param url 请求地址
 * @param options fetch Options {method, mode, headers, body, credentials, synchronous}
 * @param useQueue 是否使用请求队列
 * @returns {PromiseLike<T> | Promise<T>}
 */
export function request (url, options, useQueue = false) {
  const lastOption = mergeOption(options)
  const lastUrl = dealUrl(url, lastOption)

  if (useQueue) {
    return _addFetchQueue(lastUrl, lastOption).then(dealStatus)
  }else {
    return fetch(lastUrl, lastOption).then(dealStatus)
  }
}
