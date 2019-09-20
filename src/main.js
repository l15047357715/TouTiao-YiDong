import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/styles/index.less'

import {
  ValidationProvider,
  ValidationObserver,
  extend
} from 'vee-validate'
import * as rules from 'vee-validate/dist/rules' // 加载所有的验证规则
import zhCN from 'vee-validate/dist/locale/zh_CN'

import {
  NavBar,
  Field,
  Button,
  Toast,
  Loading
} from 'vant'

Vue.use(NavBar)
  .use(Field)
  .use(Button)
  .use(Toast)
  .use(Loading)

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
