import axios from 'axios'
import JSONbig from 'json-bigint'

const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn'
})

request.defaults.transformResponse = [function (data) {
  // return data ? JSONbig.parse(data) : {}
  try {
    return JSONbig.parse(data)
  } catch (err) {
    return data
  }
}]

export default request
