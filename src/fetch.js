import { fetch as fetchPolyfill } from 'whatwg-fetch'
import {isFunction} from "./util";

// 如果浏览器支持fetch则使用浏览器的fetch
const fetch = isFunction(window.fetch) ? window.fetch : fetchPolyfill

export default fetch
