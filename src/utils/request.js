import axios from 'axios'
import { createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const pinia = createPinia()
const counterStore = useCounterStore(pinia) // 手动传入 pinia 实例
// 如果在非组件的地方使用 Pinia store，则需要手动创建 Pinia 实例，并将其传递给 useCounterStore
const service = axios.create({
  baseURL: 'https://api.coze.cn', // 为所有请求加上统一的前缀
  timeout: 5000,
})

// 请求拦截器
service.interceptors.request.use(
  function (config) {
    // 在发送请求前检查并添加 Authorization
    const token = counterStore.getToken() // 获取访问令牌
    if (token) {
      // 添加 Authorization 请求头
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  function (error) {
    // 请求错误
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    // 响应数据错误
    return Promise.reject(error)
  },
)

export default service // 直接返回service
