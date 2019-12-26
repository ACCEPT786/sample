// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import elementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import vueResource from 'vue-resource'
import Validator from 'vue-validator'
import '../static/css/flex.css'
import '../static/css/reset.css'
import VCharts from "v-charts";
import echarts from "echarts";
import dateFormat from "dateformat";

Vue.config.productionTip = false
Vue.use(elementUI)
Vue.use(vueResource)
Vue.use(Validator)
Vue.use(VCharts)
Vue.use(echarts)

let adminMap = ["/navMenu", "/privilege", "/channel", "/data460", "/data999", "/changePassword"]
let userMap = ["/navMenu", "/panel", "/newlyTable", "/changePassword"]

router.beforeEach((to, from, next) => {
  const username = window.sessionStorage.getItem('username');
  const level = window.sessionStorage.getItem('level');
  console.log(username)
  if (!username && to.path !== '/login' && to.path !== '/adminLogin') {
    window.sessionStorage.clear()
    next({ path: '/login' });
  } else if (to.path !== '/login' && to.path !== '/adminLogin') {
    if ("1" == level && !adminMap.includes(to.path)) {
      window.sessionStorage.clear()
      next({ path: '/adminLogin' });
    }
    if ("2" == level && !userMap.includes(to.path)) {
      window.sessionStorage.clear()
      next({ path: '/admin' });
    }
    next();
  } else {
    next();
  }
  next();
});

Vue.prototype.$EventBus = new Vue();
/* eslint-disable no-new */
Vue.prototype.$DateFormat = dateFormat;
const resourceApp = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
