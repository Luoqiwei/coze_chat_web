import request from '@/utils/request'

// conversation_id, role, content, content_type
export const createMessage = async (obj) => {
  try {
    const response = await request.post('/v1/conversation/message/create', obj)
    return response
  } catch (error) {
    console.error('Error fetching space list:', error)
    throw error // 抛出错误以便调用者知道发生了问题
  }
}

// 消息详情
export const listMessage = async (obj, conversation_id) => {
  const res = await request.post('/v1/conversation/message/list', obj, {
    params: { conversation_id },
  })
  return res
}
