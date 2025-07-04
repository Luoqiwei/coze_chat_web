import request from '@/utils/request'

export const checkSpaceList = async () => {
  try {
    const response = await request.get('/v1/workspaces')
    return response.data.data // 直接返回请求到的实际数据
  } catch (error) {
    console.error('Error fetching space list:', error)
    throw error // 抛出错误以便调用者知道发生了问题
  }
}
