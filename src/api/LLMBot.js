import request from '@/utils/request'

// 查看列表
export const checkBotList = async (id) => {
  try {
    const response = await request.get('/v1/space/published_bots_list', {
      params: { space_id: id },
    })
    return response // 直接返回请求到的实际数据
  } catch (error) {
    console.error('Error fetching space list:', error)
    throw error // 抛出错误以便调用者知道发生了问题
  }
}

// 创建智能体
export const createBot = async (obj) => {
  // space_id, name
  const res = await request.post('/v1/bot/create', obj)
  return res
}
// 发布智能体
export const pulishBot = async (obj) => {
  const res = await request.post('/v1/bot/publish', obj)
  return res
}
