export default class StorageRequestEnsureToken {
  TOKEN_KEY = 'fetch-service-storage-token'
  TOKEN_KEY_TIMESTAMP = 'fetch-service-storage-token-timestamp'
  TIME_OVER_TIME = 1 * 60 * 60 * 1000

  _customGetToken = function() {
    return Promise.resolve()
  }

  _initTokening = false
  _initTokenPromise = []

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

  validTokenTimeout(token, timestamp) {
    if (!token) return false
    if (!timestamp) return false

    const time = Date.now() - timestamp

    if (time >= 0 && time <= this.TIME_OVER_TIME) {
      return true
    }

    return false
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token)
      localStorage.setItem(this.TOKEN_KEY_TIMESTAMP, `${Date.now()}`)
    }

    return token
  }

  invokeTokeingPromise(err, info) {
    for(let p of this._initTokenPromise) {
      if (err) {
        p.reject(err)
      } else {
        p.resolve(info)
      }
    }

    this._initTokenPromise = []
    this._initTokening = false
  }

  getToken(...args) {
    const token = localStorage.getItem(this.TOKEN_KEY)
    const tokenTimestamp = localStorage.getItem(this.TOKEN_KEY_TIMESTAMP)

    return new Promise((resolve, reject) => {
      if (this.validTokenTimeout(token, tokenTimestamp)) {
        resolve(token)
      } else {
        if (this._initTokening) {
          this._initTokenPromise.push({resolve, reject})
          return
        }
        this._initTokening = true

        this._customGetToken(...args).then(newToken => {
          this.setToken(newToken)
          resolve(newToken)
          this.invokeTokeingPromise(null, newToken)
        }).catch(err => {
          reject(err)
          this.invokeTokeingPromise(err)
        })
      }
    })
  }
}