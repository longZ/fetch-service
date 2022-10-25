export default class RequestNeedTokenQueue {
  loginTestFetchingQueue = []
  fetchingLoginTest = false
  _ensureAuthFn = () => Promise.reject()
  _errorCatchFn = () => { }

  constructor(ensureAuthFn, errorCatchFn) {
    this._ensureAuthFn = ensureAuthFn
    this._errorCatchFn = errorCatchFn
  }

  goonNext() {
    const onePromise = this.loginTestFetchingQueue.shift();

    if (onePromise) {
      onePromise.resolve();
      this.goonNext();
    } else {
      this.fetchingLoginTest = false;
    }
  }

  startLoginTest() {
    if (this.fetchingLoginTest) {
      return;
    }

    this.fetchingLoginTest = true;

    this._ensureAuthFn().then((res) => {
      this.goonNext();
    }).catch((err) => {
      this._errorCatchFn(err)
    });
  }

  ensure(...args) {
    return new Promise((resolve, reject) => {
      const onePromise = {
        resolve,
        reject,
        args,
      };
      this.loginTestFetchingQueue.push(onePromise);
      this.startLoginTest();
    })
  }
}