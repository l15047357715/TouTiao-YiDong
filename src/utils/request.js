import axios from 'axios'
import JSONbig from 'json-bigint'
import store from '@/store'

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

request.interceptors.request.use(function (config) {
  const { user } = store.state
  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

request.interceptors.response.use(function (response) {
  return response
}, function (error) {
  return Promise.reject(error)
})

export default request
