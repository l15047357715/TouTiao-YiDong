import axios from 'axios'
import JSONbig from 'json-bigint'
import store from '@/store'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn'
})

const refreshTokenReq = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/'
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
  // console.log(router) // 这个对象和组件中的 $route 是一个东西
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
}, async error => {
  const { user } = store.state
  if (error.response && error.response.status === 401) {
    // 判断是否有 refresh_token

    // 如果没有 refresh_token，直接跳转登录页
    if (!user || !user.refresh_token) {
      // 跳转到登录页
      router.push({
        name: 'login',
        // 可选的，就使用 query
        // /login /login?foo=bar
        // 这个参数不用修改路由之前的路径，仅此而已
        // 传递这样穿，获取的时候使用 $route.query.xxx 来获取
        query: {
          redirect: router.currentRoute.fullPath
        }
      })
      return
    }
    // 如果有，就请求获取新的 token
    //    把新的 token 更新到容器中
    //    原来过期的请求重新发出去
    try {
      // 这里务必单独创建一个请求对象来请求刷新 token
      // 不要使用 request 请求对象，因为拦截器里面的代码不一样
      const { data } = await refreshTokenReq({
        method: 'PUT',
        url: '/app/v1_0/authorizations',
        headers: {
          Authorization: `Bearer ${user.refresh_token}`
        }
      })

      // 刷新 token 成功，将 token 重新存储
      store.commit('setUser', {
        token: data.data.token, // 重新获取的最新 token
        refresh_token: user.refresh_token // 还是原来的
      })

      // 把之前失败的请求重新发出去
      return request(error.config)
    } catch (err) {
      // 刷新 token 都失败了，甭想了 ，直接跳转到登录页
      router.push({
        name: 'login',
        query: {
          redirect: router.currentRoute.fullPath
        }
      })
    }
  }
  return Promise.reject(error)
})

export default request
