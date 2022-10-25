import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueAMap from 'vue-amap'
import Element from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(Element, { size: 'small', zIndex: 3000 });

Vue.use(VueAMap)
import EasyGantt from 'easygantt'
import 'easygantt/dist/easyGantt.css'


Vue.use(EasyGantt)

import vueHashCalendar from 'vue-hash-calendar'
// 引入组件CSS样式
import 'vue-hash-calendar/lib/vue-hash-calendar.css'
// 注册组件库
Vue.use(vueHashCalendar)
// 初始化vue-amap
VueAMap.initAMapApiLoader({
  // 高德的key
  key: '28966b6be8e4fa0e4c4f4c9b4bf8d3ce',
  // 插件集合
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.Geolocation',
    'AMap.Geocoder',
    'AMap.DistrictSearch',
    'AMap.MarkerClusterer'
  ],
  v: '2.0'
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
