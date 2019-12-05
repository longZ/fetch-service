# fetch-service-parser
fetch-service-parser

# 说明
fetch-service-parser 是一个接口请求的工具，帮助快速定义接口，使用fetch请求规范，polyfill使用whatwg-fetch

# 使用

## 请求Table 列表
```javascript
// api.js 定义接口
import { services } from 'fetch-service-parser'
const {parseRequest} = services

// 请求列表
export const List = parseRequest({
  url: "/api/list"
})

// 删除数据
export const Delete = parseRequest({
  url: "/api/delete/{{id}}",
  method: 'DELETE'
})


// React 使用
import React from 'react'
import {Table} from 'antd'
import {List, Delete} from './api.js'

export class IndexPage extends React.Component {
  state = {
    items: [
        {id: 1, name: '张三'}
    ]
  }
  
  componentDidMount () {
    List({
      pageIndex: 1,
      pageSize: 10
    }).then((items) => {
      this.setState({items})
    })
  }
  
  onDeleteRow = row => {
    Delete({id: row.id}).then(res => {
      alert('删除成功')
    })
  }
  
  renderOperation = row => {
    return <a onClick={e => this.onDeleteRow(row)}>删除</a>
  }
  
  render () {
    const {items} = this.state
    const columns = [
        {dataIndex: 'name', title: '姓名'},
        {title: '操作', render: this.renderOperation},
    ]
    return <Table rowKey={'id'} columns={columns} dataSource={list} />
  }
}
```

## 上传文件
```javascript
// api.js 定义接口
import { services } from 'fetch-service-parser'
const {parseRequest} = services

export const Upload = parseRequest({
  url: "/api/upload",
  method: 'POST'
})


// React 使用
import React from 'react'
import {Upload} from './api.js'

export class IndexPage extends React.Component {  
  onFileChange = e => {
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)
    Upload(formData).then(res => {
      alert('上传成功!')
    })
  }
  
  render () {
    return <input type='file' onChange={this.onFileChange} />
  }
}
```

## 默认使用 Content-Type: application/json; charset=UTF-8, 修改headers
```javascript
import {services, CONTENT_TYPES} from 'fetch-service-parser'
const {parseRequest} = services

export const Create = parseRequest({
  url: "/api/create",
  method: 'POST',
  headers: {
    'Content-Type': CONTENT_TYPES.FORM_URL
  },
})
```

## 默认使用 Content-Type: application/json; charset=UTF-8, 修改headers
```javascript
import {services, CONTENT_TYPES} from 'fetch-service-parser'
const {parseRequest} = services

export const Create = parseRequest({
  url: "/api/create",
  method: 'POST',
  headers: {
    'Content-Type': CONTENT_TYPES.FORM_URL
  },
})
```

## 配置说明
```typescript
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
   * 在无接口的情况下，可以使用mock来伪造数据
   * 例如： mock: [{id: 1, name: '张三'}]
   *        或者使用函数
   *        mock: () =>  [{id: 1, name: '张三'}]
   */
  mock?: any

  /**
   * 启动debug, 为true时， 会使用mock的数据
   */
  debug?: boolean

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
   * 是否使用请求队列， useQueue 设置为true后，该请求会进入到队列中，顺次请求
   */
  useQueue?: boolean,

  /**
   * 请求结果处理函数, 接口请求成功后，如果有该函数，会进入该函数处理结束后，返回值为接口请求拿到的值
   * 例如： parseResponse = res => {
   *        if (res.success) {
   *          return res.body  
   *        } else {
   *           throw res.message
   *        }
   *   }
   */
  parseResponse?: any,

  /**
   * 请求参数处理函数, 接口请求前，对参数进行处理
   * 例如：校验参数
   * parseParam: params => {
   *  if (!params.name) {
   *      throw '姓名不能为空'
   *  }
   *  
   *  return params
   * }
   */
  parseParam?: any,
}
```


## 事件说明
```javascript
import {services} from 'fetch-service-parser'

  services.on('error', (err) => {
    // 捕获 !== 200 状态的响应
    // 捕获 parseResponse 中的 throw
    // 捕获 parseParam 中的 throw
    // 设置 noErrorTip = true 后不会触发该事件
  })

  services.on('willRequest', (apiOption) => {
    // 请求前的处理， 能拿到接口的定义
    // 通常用于全局loading显示
    // 比如
    if (apiOption.loading) {
      Loading.show()
    }
  })

  services.on('requested', (apiOption) => {
    // 请求后的处理，不管是成功或者失败都会触发，能拿到接口的定义
    // 通常用于全局loading的隐藏
    if (apiOption.loading) {
      Loading.hide()
    }
  })
```