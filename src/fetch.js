import { fetch as fetchPolyfill } from 'whatwg-fetch'

// 如果浏览器支持fetch则使用浏览器的fetch
const fetch = fetchPolyfill

export default fetch
