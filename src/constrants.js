export const REQUEST_METHOD_GET = 'GET'
export const REQUEST_METHOD_POST = 'POST'
export const REQUEST_METHOD_OPTIONS = 'OPTIONS'
export const REQUEST_METHOD_DELETE = 'DELETE'

export const CONTENT_TYPES = {
  JSON: 'application/json; charset=UTF-8',
  FORM_URL: 'application/x-www-form-urlencoded',
  XML: 'text/xml',
  FORM_DATA: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  STREAM: 'application/octet-stream'
}

export const EVENT_ERROR = 'error'
export const EVENT_WILL_REQUEST = 'willRequest'
export const EVENT_PARSE_OPTION = 'parseOption'
export const EVENT_REQUESTED = 'requested'