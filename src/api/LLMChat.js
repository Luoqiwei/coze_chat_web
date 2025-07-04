import request from '@/utils/request'

// conversation_id, role, content, content_type
export const launchChat = async (obj, id) => {
  try {
    // bot_id user_id
    const response = await request.post(
      '/v3/chat',
      { ...obj, stream: false, auto_save_history: true },
      {
        params: { conversation_id: id }, // Query 参数通过 params 传递
      },
    )
    return response
  } catch (error) {
    console.error('Error fetching space list:', error)
    throw error // 抛出错误以便调用者知道发生了问题
  }
}

// 查看对话详情(为了确认本轮对话已结束)
export const getChatDetail = async (obj) => {
  const res = await request.get('/v3/chat/retrieve', {
    params: obj,
  })
  return res
}

// 结束后查看本轮对话的模型回复
export const getChatMessageDetail = async (obj) => {
  const res = await request.get('/v3/chat/message/list', {
    params: obj,
  })
  return res
}

// 上传文件
export const uploadeFile = async (obj) => {
  // 创建 FormData 对象，构造 multipart/form-data 数据
  const formData = new FormData()
  formData.append('file', obj)
  const res = await request.post('/v1/files/upload', formData)
  return res
}
// 查看文件
export const retrieveFile = async (file_id) => {
  const res = await request.get('/v1/files/retrieve', {
    params: {
      file_id,
    },
  })
  return res
}
