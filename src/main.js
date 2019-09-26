import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/styles/index.less'

import {
  ValidationProvider, // 包裹多个 ValidationObserver 验证组件
  ValidationObserver, // 包裹要验证的表单元素
  extend // 扩展自定义验证规则
} from 'vee-validate'
import * as rules from 'vee-validate/dist/rules' // 加载所有的验证规则
import zhCN from 'vee-validate/dist/locale/zh_CN'

import {
  NavBar,
  Field,
  Button,
  Toast,
  Loading,
  Tabbar,
  TabbarItem,
  Tab,
  Tabs,
  List,
  Cell,
  CellGroup,
  PullRefresh,
  Grid,
  GridItem,
  Image,
  Icon,
  Lazyload,
  Popup,
  Search
} from 'vant'

import { relativeTime } from './utils/date'
Vue.filter('relativeTime', relativeTime)

Vue.use(NavBar)
  .use(Field)
  .use(Button)
  .use(Toast)
  .use(Loading)
  .use(Tabbar)
  .use(TabbarItem)
  .use(Tab)
  .use(Tabs)
  .use(List)
  .use(Cell)
  .use(CellGroup)
  .use(PullRefresh)
  .use(Grid)
  .use(GridItem)
  .use(Image)
  .use(Icon)
  .use(Lazyload)
  .use(Popup)
  .use(Search)

for (let rule in rules) {
  extend(rule, {
    ...rules[rule], // add the rule
    message: zhCN.messages[rule] // add its message
  })
}
extend('phone', {
  validate (value) {
    return /^1\d{10}$/.test(value)
  },
  message: '必须是手机号'
})

Vue.component('ValidationProvider', ValidationProvider)
Vue.component('ValidationObserver', ValidationObserver)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
