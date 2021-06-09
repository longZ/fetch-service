interface apiOption {
  /**
   * 接口地址
   */
  url: string,

  /**
   * 是否跨域
   */
  cors?: boolean

  /**
   * debug = true 的时候， 会使用mock数据
   * mock 可以是数据，也可以是function
   */
  mock?: any

  /**
   * 是否返回原始response
   */
  useOriginResponse?: boolean

  /**
   * 是否缓存结果
   */
  cache?: boolean

  /**
   * 启动debug
   */
  debug?: boolean

  /**
   * 请求接口时，是否显示loading， 需要自己在请求前后增加loading
   */
  loading?: boolean

  /**
   * method
   */
  method?: string,

  /**
   * 设置自定义header
   */
  headers?: object | HeaderFunction,

  /**
   * 是否不触发错误事件
   */
  noErrorTip?: boolean,

  /**
   * 是否使用请求队列
   */
  useQueue?: boolean,

  /**
   * 请求结果处理函数
   */
  parseResponse?: AnyFunction,

  /**
   * 请求参数处理函数
   */
  parseParam?: AnyFunction

  // 请求是否需要token
  requestNeedToken?: boolean
}

type PromiseFun = (p: any) => Promise<any>
type AnyFunction = (...args: any) => any
type HeaderFunction = (params: any, option: apiOption) => apiOption

interface StorageRequestEnsureTokenOption {
  // 自定义的获取token的函数
  customGetToken: PromiseFun

  // token存储到localStorage对应的名字
  tokenKey?: string

  // token timestamp存储到localStorage对应的名字
  tokenTimestampKey?: string

  // token 过期时间 默认 1 * 60 * 60 * 1000
  timeout?: number
}

interface FetchServiceOption {
  // 全局处理响应结果函数
  parseResponse?: AnyFunction

  // 获取token的Promise函数
  tokenFun?: PromiseFun

  // 请求是否需要token
  requestNeedToken?: boolean

  // mode
  mode?: 'cors' | 'no-cors' | 'same-origin'

  // mode
  credentials?: 'same-origin' | 'include' | 'omit'

  // 全局设置headers
  headers?: object | HeaderFunction

  // token设置的对应header名称
  tokenHeaderName?: string
}

declare class FetchService {
  constructor(option?: FetchServiceOption)

  parseOption(option: apiOption): PromiseFun

  on(eventName: string, fun: AnyFunction): void

  off(eventName: string, fun: AnyFunction): void
}

declare class StorageRequestEnsureToken {
  constructor(option?: StorageRequestEnsureTokenOption)

  /**
   * 获取本地存储的token
   * @returns {string} token
   */
  getStorageToken(): string

  /**
   * 清除存储的token
   */
  clearToken(): void

  /**
   * 获取有效的token
   * @param args
   * @returns {PromiseFun}
   */
  getToken(...args: Array<any>): PromiseFun
}

export interface util {
  /**
   * 参数是否为函数
   */
  isFunction(fun: any): boolean

  /**
   * base64字符串转换成Blob对象，一般用于上传文件
   * @param {string} dataURI base64字符串
   * @returns {Blob} Blob数据对象
   */
  dataURItoBlob(dataURI: string): Blob

  /**
   * 图片压缩
   * @param {string} path 图片url
   * @param {number} quality 压缩质量
   * @returns {Promise<string>} Promise对象
   */
  canvasDataURL(path: string, quality?: number): Promise<string>

  /**
   * 将对象key value 设置对应的cookie
   * @param {object} obj 要设置的对象
   * @param {number} cookieExpiresTime cookie过期事件 默认 24 * 60 * 60 * 30
   */
  setCookies(obj: object, cookieExpiresTime?: number): void

  /**
   * 设置浏览器cookie
   * @param {string} name 名称
   * @param {string} value 值
   * @param {number} cookieExpiresTime 过期时间 默认 24 * 60 * 60 * 30
   */
  setCookie(name: string, value: string, cookieExpiresTime?: number): void

  /**
   * 获取cookie值
   * @param {string} name 名称
   * @returns {string} cookie值
   */
  getCookie(name: string): string

  /**
   * 深度克隆对象
   * @param {object} obj 源对象
   * @returns {object} 克隆结果
   */
  deepClone(obj: any): any

  /**
   * createObjectURL polyfill
   * @param {object} obj 源对象
   * @returns {object} 克隆结果
   */
  getFileURL(file: File): string

  /**
   * 解析对象值
   * @param props 解析的对象
   * @param keyStr 解析的path a.b.c
   * @param {any} defaultValue 解析失败后的默认值
   * @param newKeyName 设置成新的key名称
   * @returns {object} 解析后的结果
   */
  propsMapper(props: object, keyStr: string, defaultValue?: any, newKeyName?: string): object

  /**
   * 是否无效值
   * @param value
   * @returns {boolean}
   */
  isUnValid(value: any): boolean


  /**
   * 定时执行任务，返回Promise对象
   * @param {Function} fun 执行的函数
   * @param {number} timeout 定时触发事件，默认 1000
   * @returns {Promise<any>}
   */
  timeoutPromise (fun: AnyFunction, timeout?: number): Promise<any>

  /**
   * 字符串解析成json对象
   * @param {string} text
   * @returns {object}
   */
  parseJson(text: string): object

  /**
   * json对象解析成key=value字符串
   * @param {object} o
   * @returns {string}
   */
  json2param(o: object): string


  /**
   * 键值对key=value解析成json对象
   * @param {string} str
   * @returns {object}
   */
  param2json (str: string): object

  /**
   * 简易模板解析函数 替换{{}} 包裹的key
   * @param template 模板
   * @param context 解析的数据
   * @returns {string}
   */
  renderTemplate (template, context): string


  /**
   * 数组异步回调
   * @param {Array} arr 数据或者Promise数组
   * @param {Function} operate 要执行的操作，返回Promise对象
   * @returns {Promise<Array>}
   */
  promiseAll (arr: Array, operate: AnyFunction): Promise<Array>
}

export interface services {
  /**
   * 监听事件
   * @param {string} eventName 事件名称
   * @param {Function} fun 事件监听函数
   */
  on(eventName: string, fun: AnyFunction): void

  /**
   * 取消监听事件
   * @param {string} eventName 事件名称
   * @param {Function} fun 事件监听函数
   */
  off(eventName: string, fun: AnyFunction): void

  /**
   * 包裹接口定义，返回接口请求
   * @param {apiOption} option
   * @returns {PromiseFun}
   */
  parseRequest(option: apiOption): PromiseFun
}

export const CONTENT_TYPES = {
  JSON: 'application/json; charset=UTF-8',
  FORM_URL: 'application/x-www-form-urlencoded',
  XML: 'text/xml',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  STREAM: 'application/octet-stream'
}

export const REQUEST_METHOD_GET = 'GET'
export const REQUEST_METHOD_POST = 'POST'
export const REQUEST_METHOD_OPTIONS = 'OPTIONS'
export const REQUEST_METHOD_DELETE = 'DELETE'
export const EVENT_ERROR = 'error'
export const EVENT_WILL_REQUEST = 'willRequest'
export const EVENT_PARSE_OPTION = 'parseOption'
export const EVENT_REQUESTED = 'requested'