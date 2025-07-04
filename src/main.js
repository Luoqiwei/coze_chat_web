// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import request from '@/utils/request' // 引入request.js
import '@/assets/iconfont/iconfont.css'

import App from './App.vue'
import router from './router'

import InfiniteScroll from 'vue-infinite-scroll'
// 引入全局样式
import '@/assets/main.css'
const app = createApp(App)

// 将 axios 实例绑定到 Vue 实例的原型链上
app.config.globalProperties.$request = request

app.use(createPinia())
app.use(router)
app.use(InfiniteScroll)

app.mount('#app')
