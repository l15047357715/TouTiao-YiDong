import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '@/views/login'
import Tabbar from '@/views/tabbar'
import Home from '@/views/home'
import Search from '@/views/search'
import SearchResult from '@/views/search-result'

Vue.use(VueRouter)

const router = new VueRouter({
  // 配置路由表
  routes: [{
    name: 'login',
    path: '/login',
    component: Login
  }, {
    path: '/',
    component: Tabbar,
    children: [
      {
        name: 'home',
        path: '', // 默认子路由
        component: Home
      }
    ]
  }, {
    name: 'search',
    path: '/search',
    component: Search
  }, {
    name: 'search-result',
    path: '/search/:q',
    component: SearchResult
  }]
})

export default router
