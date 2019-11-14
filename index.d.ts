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
  headers?: any,
  /**
   * 是否不触发错误事件
   */
  noErrorTip?: boolean,
  /**
   * 是否使用请求队列
   */
  useQueue?: boolean,
  /**
   * 是否获取原始数据
   */
  useOriginResponseData?: boolean,
  /**
   * 请求结果处理函数
   */
  parseResponse?: any,
  /**
   * 请求参数处理函数
   */
  parseParam?: any,
}

interface PromiseFun {
  (p: any): Promise
}

export interface services {
  on(eventName: string, fun: any): void

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