import FetchService from "./fetchService";

const _service = new FetchService()

export const parseRequest = _service.parseOption
export const on = _service.on
export const off = _service.off