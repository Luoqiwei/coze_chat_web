import request from '@/utils/request'

export const createConversation = async () => {
  try {
    const response = await request.post('/v1/conversation/create', {
      metadata: {},
      messages: [],
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching space list:', error)
    throw error // 抛出错误以便调用者知道发生了问题
  }
}
