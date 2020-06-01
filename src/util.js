export function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
}

// 图片压缩
export function canvasDataURL(path, quality = 0.6){
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.src = path;

    img.onload = function(){
      // 默认按比例压缩
      var w = img.width,
          h = img.height,
          scale = w / h;
      w = Math.min(2000, w);
      h = (w / scale);
      //生成canvas
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      // 创建属性节点
      var anw = document.createAttribute("width");
      anw.nodeValue = w;
      var anh = document.createAttribute("height");
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh);
      ctx.drawImage(img, 0, 0, w, h);

      // quality值越小，所绘制出的图像越模糊
      var base64 = canvas.toDataURL('image/jpeg', quality);

      // 回调函数返回base64的值
      resolve(base64);
    }

    img.onerror = function(err) {
      reject(err)
    }
  })
}

export function setCookies(obj, cookieExpiresTime) {
  for(let key in obj) {
    const v = obj[key]
    if (obj.hasOwnProperty(key) && v) {
      setCookie(key, v, cookieExpiresTime)
    }
  }
}

export function setCookie(name, value, cookieExpiresTime = 24 * 60 * 60 * 30) {
  var exp = new Date();
  exp.setTime(Date.now() + cookieExpiresTime);
  document.cookie = name + "=" + escape(value) + ";expires="
      + exp.toGMTString();
}

export function getCookie(name) {
  let arr
  const reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)")
  if (arr = document.cookie.match(reg)) {
    return unescape(arr[2])
  }

  return null
}

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function getFileURL(file) {
  var getUrl = null;

  if (window.createObjectURL != undefined) { // basic
    getUrl = window.createObjectURL(file);
  } else if (window.URL != undefined) { // mozilla(firefox)
    getUrl = window.URL.createObjectURL(file);
  } else if (window.webkitURL != undefined) { // webkit or chrome
    getUrl = window.webkitURL.createObjectURL(file);
  }

  return getUrl;
}

// 获取对象a.b.ckey的值
export function propsMapper(props, keyStr, defaultValue = null, newKeyName) {
  const keys = keyStr.split('.')
  const keyValue = objectKeysValue(props, keys, defaultValue)
  return {
    [newKeyName || keys[keys.length - 1]]: keyValue
  }
}

// 获取对象[key]数组的值
function objectKeysValue(object, keys, defaultValue = null) {
  if (isUnValid(object)) {
    return defaultValue
  }

  if (keys.length > 1) {
    return objectKeysValue(object[keys[0]], keys.slice(1), defaultValue)
  } else if (keys.length === 1) {
    if (!object) {
      return defaultValue
    }

    const v = object[keys[0]]

    return isUnValid(v) ? defaultValue : v
  } else {
    return {}
  }
}

// 是否为无效值
export function isUnValid(value) {
  return !value && value !== false && value !== 0
}

// 定时任务返回Promise
export function timeoutPromise (fun, timeout = 1000) {
  if (!isFunction(fun)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fun())
      } catch(err) {
        reject(err)
      }
    }, timeout)
  })
}

// 解析成json
export function parseJson (text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// 解析成json
export function isFunction (fun) {
  return typeof fun === 'function'
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
      if (isFunction(operate)) {
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