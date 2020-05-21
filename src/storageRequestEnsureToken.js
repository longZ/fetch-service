export default class StorageRequestEnsureToken {
  TOKEN_KEY = 'fetch-service-storage-token'
  TOKEN_KEY_TIMESTAMP = 'fetch-service-storage-token-timestamp'
  TIME_OVER_TIME = 1 * 60 * 60 * 1000
  _initToking = false
  _initTokenPromise = []

  _customGetToken = function() {
    return Promise.resolve()
  }

  constructor(op = {}) {
    if (!op.customGetToken) {
      throw 'need customGetToken function return Promise'
    }

    if (op.tokenKey) {
      this.TOKEN_KEY = op.tokenKey
    }

    if (op.tokenTimestampKey) {
      this.TOKEN_KEY_TIMESTAMP = op.tokenTimestampKey
    }

    if (op.timeout) {
      this.TIME_OVER_TIME = op.timeout
    }

    this._customGetToken = op.customGetToken
  }

  __setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token)
      localStorage.setItem(this.TOKEN_KEY_TIMESTAMP, `${Date.now()}`)
    }

    return token
  }

  __invokeTokingPromise(err, info) {
    for(let p of this._initTokenPromise) {
      if (err) {
        p.reject(err)
      } else {
        p.resolve(info)
      }
    }

    this._initTokenPromise = []
    this._initToking = false
  }

  getStorageToken() {
    const token = localStorage.getItem(this.TOKEN_KEY)
    const timestamp = localStorage.getItem(this.TOKEN_KEY_TIMESTAMP)

    if (!token) return null
    if (!timestamp) return null

    const time = Date.now() - timestamp

    if (time >= 0 && time <= this.TIME_OVER_TIME) {
      return null
    }

    return token
  }

  getToken(...args) {
    const token = this.getStorageToken()

    return new Promise((resolve, reject) => {
      if (token) {
        resolve(token)
      } else {
        if (this._initToking) {
          this._initTokenPromise.push({resolve, reject})
          return
        }

        this._initToking = true

        this._customGetToken(...args).then(newToken => {
          this.__setToken(newToken)
          resolve(newToken)
          this.__invokeTokingPromise(null, newToken)
        }).catch(err => {
          reject(err)
          this.__invokeTokingPromise(err)
        })
      }
    })
  }
}