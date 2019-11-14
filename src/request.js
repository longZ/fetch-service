import fetch from './fetch'

export const CONTENT_TYPES = {
  JSON: 'application/json; charset=UTF-8',
  FORM_URL: 'application/x-www-form-urlencoded',
  XML: 'text/xml',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  STREAM: 'application/octet-stream'
}

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
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    ...otherOptions
  }

  const { body, method = 'GET' } = defaultOption

  if (window && window.FormData && body instanceof window.FormData) {
    delete defaultOption.headers['Content-Type']
  } else if (typeof body === 'number') {
    defaultOption.body = `${body}`
  } else if (typeof body === 'object') {
    if (method === 'GET' || method === 'DELETE') {
      defaultOption.body = json2param(body)
    } else if (defaultOption.headers['Content-Type'] === CONTENT_TYPES.JSON) {
      defaultOption.body = JSON.stringify(body)
    } else if (defaultOption.headers['Content-Type'] ===
        CONTENT_TYPES.FORM_URL) {
      defaultOption.body = json2param(body)
    }
  }

  return defaultOption
}

// 处理url
function dealUrl (url, options) {
  const { method = 'GET', body } = options
  if ((method === 'GET' || method === 'DELETE') && typeof body === 'string') {
    if (url.indexOf('?') < 0) {
      url += '?'
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

// 解析成json
export function parseJson (text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
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

/**
 * 将json对象转换成键值对字符串
 * @param o json对象
 * @returns {string}
 */
export function json2param (o) {
  const p = []
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      let value = o[key]
      if (value == null || value === undefined || Number.isNaN(value) || value ===
          Infinity || value === -Infinity) {
        value = ''
      }
      p.push(`${key}=${encodeURIComponent(value)}`)
    }
  }

  return p.join('&')
}

/**
 * 将键值对字符串转换成json对象
 * @param str 键值对字符串
 * @returns {object}
 */
export function param2json (str) {
  if (typeof str !== 'string') {
    return {}
  }

  let i1 = str.indexOf('?')
  let i2 = str.indexOf('#')

  if (i2 < 0) {
    i2 = str.length
  }

  if (i2 > i1) {
    str = str.substring(i1 + 1, i2)
  }

  const reg = /([a-z0-9_]+)=([^&#]+)/ig
  let m = reg.exec(str)
  const ret = {}
  while (m) {
    ret[m[1]] = decodeURIComponent(m[2])
    m = reg.exec(str)
  }

  return ret
}

/**
 * 简单模板引擎
 * @param template 模板字符串
 * @param context 上下文数据
 * @returns {string}
 */
export function renderTemplate (template, context) {
  const reg = /\{\{(.*?)\}\}/g
  const repl = (match, key) => context[key.trim()]
  return template.replace(reg, repl)
}

/**
 * 数组异步回调
 * @param arr 包含Promise的数组或者数据，如果为数据，则必须传operate操作函数
 * @param operate 要执行的操作，返回Promise对象（主要是为了真正的同步执行数组中的Promise）
 * @returns {Promise<any>}
 */
export function promiseAll (arr, operate) {
  const resultArr = []

  function _aysncArr (cb) {
    let a = arr.shift()
    if (a) {
      let promise = a
      if (typeof operate === 'function') {
        promise = operate(a)
      }
      promise.then(r => {
        resultArr.push(r)
        _aysncArr(cb)
      }).catch(err => {
        cb(err, resultArr)
      })
    } else {
      cb(null, resultArr)
    }
  }

  return new Promise((resolve, reject) => {
    _aysncArr(function (err, res) {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}
