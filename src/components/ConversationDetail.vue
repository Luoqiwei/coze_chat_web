<script setup>
import { ref, onUnmounted, onMounted, watch, nextTick } from 'vue'
import { createMessage, listMessage } from '@/api/LLMMessage'
import {
  launchChat,
  getChatDetail,
  getChatMessageDetail,
  uploadeFile,
  retrieveFile,
} from '@/api/LLMChat'
// import { checkSpaceList } from '@/api/space'
import { marked } from 'marked'
import { EventBus } from '@/utils/eventBus'
import { useCounterStore } from '@/stores/counter'

// 消息列表------------------------------------------------------------------------------------------------
const cStore = useCounterStore()
console.log(cStore.userMessageList.value)

// 会话id------------------------------------------------
// 监听事件
const conversation_id = ref('')
onMounted(() => {
  EventBus.on('conversation_id', (id) => {
    // console.log('Event triggered with ID:', id)
    conversation_id.value = id
  })
})
// 清理事件监听
onUnmounted(() => {
  EventBus.off('conversation_id')
})
watch(
  () => conversation_id.value,
  () => {
    nextTick(() => {
      userListMessage(conversation_id.value)
    })
  },
)
// 消息详情-----------------------------------------------
let textarea = ref('')
let content_list = ref([])
let follow_up_list = ref([])

// async function userCreateMessage() {
//   // conversation_id, role, content, content_type
//   const res = await createMessage({
//     conversation_id: '7446707532091097114',
//     role: 'user',
//     content: textarea.value,
//     content_type: 'text',
//   })
//   console.log(res)
// }

// (平滑滚动）滚动到最底部------------------------------------------------------------------
const messageContainer = ref(null)
const scrollToBottom = () => {
  if (!messageContainer.value) return

  const targetScrollTop = messageContainer.value.scrollHeight // 目标位置（容器的总高度）
  const currentScrollTop = messageContainer.value.scrollTop // 当前滚动位置
  const distance = targetScrollTop - currentScrollTop // 需要滚动的距离
  const step = distance / 20 // 每次滚动的步长
  let scrollStep = 0

  const smoothScroll = () => {
    if (scrollStep < 20) {
      messageContainer.value.scrollTop += step // 逐步增加滚动
      scrollStep++
      requestAnimationFrame(smoothScroll) // 继续下一帧
    } else {
      messageContainer.value.scrollTop = targetScrollTop // 最终确保滚动到底
    }
  }

  smoothScroll() // 开始滚动
}
watch(
  () => content_list.value,
  () => {
    nextTick(() => {
      // console.log('nextTick triggered')
      scrollToBottom()
    })
  },
)
// 消息列表-----------------------------------------------------------------------------
// 查看消息列表\
// 判断字符串是否是有效的 JSON 字符串
function isJsonString(str) {
  // 简单检查：字符串是否以 "{" 或 "[" 开头，并以 "}" 或 "]" 结尾
  const pattern = /^[[{].*[\]}]$/
  return pattern.test(str)
}

async function userListMessage(id) {
  const res = await listMessage({ order: 'asc' }, id)
  content_list.value = res.data.data
  // console.log('list', res)
  for (let i = 0; i < content_list.value.length; i++) {
    const content = content_list.value[i].content
    if (isJsonString(content)) {
      // 如果是 JSON 字符串，尝试解析
      content_list.value[i].content = JSON.parse(content)
      // console.log('有效的 JSON 字符串:', content_list.value[i].content)
    } else {
      // 如果不是 JSON 字符串，跳过
      // console.log('无效的 JSON 字符串，跳过:', content)
    }
    // console.log(JSON.parse(content_list.value[i].content))
  }
  console.log('本地列表', content_list.value)
}

// 发起对话----------------------------------------------------------------------------
const content_type_obj = ref(false) //是否是多模态
async function userLaunchChat() {
  follow_up_list.value = []
  // bot_id user_id
  if (content_type_obj.value) {
    file_obj.push({ type: 'text', text: textarea.value })
    console.log('此次对话的file_obj:', file_obj)
  }
  const res = await launchChat(
    {
      bot_id: '7446717826477981731',
      user_id: 'tay',
      additional_messages: [
        {
          role: 'user',
          content: content_type_obj.value ? JSON.stringify(file_obj) : textarea.value,
          content_type: content_type_obj.value ? 'object_string' : 'text',
        },
      ],
    },
    conversation_id.value,
  )
  // 将本次问题加入本地
  console.log('此次对话的信息:', res)
  content_list.value = content_list.value.concat({
    id: res.data.data.id,
    content_type: content_type_obj.value ? 'object_string' : 'text',
    content: textarea.value,
    role: 'user',
  })
  textarea.value = ''
  file_obj = []
  // conversation_id'7446707532091097114'
  // console.log(res)
  const obj = {
    chat_id: res.data.data.id,
    conversation_id: conversation_id.value,
  }
  await pollChatDetail(obj)
  userGetChatMessageDetail(obj) //本轮回复
}

// 查看对话详情
let intervalId
let isPolling = false // 防止重复请求
function pollChatDetail(obj) {
  return new Promise((resolve) => {
    intervalId = setInterval(async () => {
      if (isPolling) return // 如果正在请求，跳过本次轮询
      isPolling = true

      const res = await getChatDetail(obj) // 异步请求数据
      // console.log(res)

      // 判断状态
      if (res.data?.data?.status === 'completed') {
        console.log('Chat detail completed!')
        clearInterval(intervalId) // 停止轮询
        resolve(res) // 轮询完成，返回结果
      }

      isPolling = false // 允许下一次轮询
    }, 1000) // 每秒轮询一次
  })
}

// 查看对话消息详情
async function userGetChatMessageDetail(obj) {
  const res = await getChatMessageDetail(obj)
  console.log('回答', res)
  // 将本次问题加入本地
  const answers = res.data.data.filter((item) => item.type === 'answer') // 筛选 type 为 'answer' 的对象
  content_list.value = content_list.value.concat(...answers) // 将筛选结果添加到 content_list 数组中
  follow_up_list.value = res.data.data.filter((item) => item.type === 'follow_up') // 筛选 type 为 'verbose' 的对象
}
// follow-up跳转-------------------------------------------------------------------------------------------------------------
function goToAsk(content) {
  textarea.value = content
  follow_up_list.value = []
  userLaunchChat()
}
// 上传文件图像------------------------------------------------------------------------------------------------------------
let file_obj = [] // 上传文件信息
let selectFiles = [] // 存储的文件

async function handleFileChange(event) {
  const isImage = ref(false) // 是否是图片
  const isDocument = ref(false) // 是否是文档
  const fileType = ref('') // 文件类型
  const newFiles = Array.from(event.target.files)
  selectFiles = [...selectFiles, ...newFiles]
  console.log('file', selectFiles)
  for (let i = 0; i < newFiles.length; i++) {
    const file = newFiles[i]
    // 获取文件扩展名和 MIME 类型
    const fileName = file.name.toLowerCase()
    const fileMime = file.type

    // 图片扩展名列表
    const imageExtensions = [
      'jpg',
      'jpeg',
      'jpg2',
      'png',
      'gif',
      'webp',
      'heic',
      'heif',
      'bmp',
      'pcd',
      'tiff',
    ]
    // 文档扩展名列表
    const documentExtensions = [
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'pdf',
      'numbers',
      'csv',
    ]

    // 根据扩展名判断
    const extension = fileName.split('.').pop() // 获取文件扩展名

    // 判断是否是图片
    isImage.value = fileMime.startsWith('image/') || imageExtensions.includes(extension)
    // 判断是否是文档
    isDocument.value =
      fileMime === 'application/pdf' ||
      fileMime.startsWith('application/vnd') ||
      fileMime.startsWith('text/csv') ||
      documentExtensions.includes(extension)

    // 输出判断结果
    if (isImage.value) {
      fileType.value = 'image'
      console.log('这是一个图片文件')
    } else if (isDocument.value) {
      fileType.value = 'file'
      console.log('这是一个文档文件')
    } else {
      fileType.value = '未知类型'
      console.log('未知文件类型, 请重新上传！！')
      return
    }

    const res = await uploadeFile(file)
    file_obj.push({ type: fileType.value, file_id: res.data.data.id })
    content_type_obj.value = true
    // console.log('文件上传', res)
    const res1 = await retrieveFile(res.data.data.id)
    // console.log('查看上传文件', res1)
  }
  console.log('查看已经上传的文件', file_obj)
}
</script>

<template>
  <div class="homeView">
    <!-- 头部 -->
    <div class="header">
      <span class="title">Bot</span>
      <button class="store cusor-pass">收藏</button>
    </div>

    <!-- 消息详情 -->
    <ul class="messageList" ref="messageContainer" style="overflow: auto" v-if="conversation_id">
      <li v-for="item in content_list" :key="item" class="messageList-item">
        <p
          class="icon iconfont icon-jiqiren1"
          style="color: #fff; font-size: 25px; width: 40px"
          v-if="item.role == 'assistant'"
        ></p>
        <!-- 聊天框 -->
        <div
          :class="{
            content_assistant: item.role === 'assistant',
            content_user: item.role === 'user',
          }"
        >
          <div v-if="Array.isArray(item.content)">
            <div v-for="(content_item, index) in item.content" :key="index">
              <span v-if="content_item.type == 'text'" v-html="marked(content_item.text)"></span>
              <img v-if="content_item.type == 'image'" :src="content_item.file_url" alt="" />
            </div>
          </div>
          <div v-else>
            <span v-html="marked(item.content)"></span>
          </div>
          <div class="operate_culumn">
            <div v-if="item.role == 'assistant'">
              <i class="icon iconfont icon-fuzhi- cusor-pass" style="margin-right: 10px"></i>
              <i class="icon iconfont icon-sync-copy cusor-pass"></i>
            </div>
            <i v-else class="icon iconfont icon-thin-_write_penc cusor-pass"></i>
          </div>
        </div>

        <p
          class="icon iconfont icon-yonghu"
          style="color: #fff; font-size: 25px; width: 40px; text-align: end"
          v-if="item.role == 'user'"
        ></p>
      </li>
      <li class="follow-up" v-for="item in follow_up_list" :key="item">
        <span class="cusor-pass" @click="goToAsk(item.content)"
          >{{ item.content }}<i class="icon iconfont icon-youjiantou"></i
        ></span>
      </li>
    </ul>

    <!-- 底部 -->
    <div class="footer" v-if="conversation_id" :class="{ help: content_list.length == 0 }">
      <!-- 预览 -->
      <div class="fileList">
        <img src="../assets/imgs/journey.png" alt="" />
      </div>
      <div class="container">
        <el-input
          v-model="textarea"
          style="width: 100%; border: none; --el-input-bg-color: transparent padding: 5px"
          :autosize="{ minRows: 1, maxRows: 2 }"
          type="textarea"
          placeholder="Please input"
          resize="none"
        />
        <div class="operateBox">
          <div class="otherType">
            <el-button class="cusor-pass" style="margin-left: 10px">文件</el-button>
            <el-button class="cusor-pass" style="margin-left: 10px">图片</el-button>

            <el-button
              class="send"
              style="margin-right: 10px"
              v-if="textarea"
              @click="userLaunchChat()"
              >发送</el-button
            >
          </div>
        </div>
        <!-- 预览 -->
        <input type="file" multiple @change="handleFileChange" />
      </div>
    </div>
    <!-- 引导 -->
    <div class="help-title" v-if="conversation_id && content_list.length == 0">
      您有什么问题想要问我?
    </div>
    <!-- 空白会话 -->
    <div class="blank-page" v-if="!conversation_id">
      <img src="..\assets\imgs\wallhaven-3zg576.jpg" alt="" />
      <p>开始一段新的旅程吧</p>
      <i class="icon iconfont icon-aislogo"></i>
    </div>
  </div>
</template>

<style scoped lang="less">
.homeView {
  background-color: rgba(0, 0, 0, 0.862);
  height: 100vh;
  position: relative; /* 让 .fixed-input 在该容器内定位 */
  .header {
    color: #fff;
    display: flex;
    width: 100%;
    height: 6%;
    padding-top: 10px;
    line-height: 100%;
    span.title {
      text-align: center;
      flex-grow: 1;
      padding-left: 55px;
    }
    .store {
      width: 50px;
      height: 50px;
      border-radius: 50px;
      margin: 10px;
    }
  }
}

// 消息详情----------------------------------------------------------------------------------------------
.messageList {
  height: 78%;
  padding: 0;
  margin-left: 30px;
  list-style: none;
}
.messageList .messageList-item {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  color: var(--el-color-primary);
}
.messageList .messageList-item + .list-item {
  margin-top: 10px;
}
// * 解除样式作用域限制，确保嵌套样式能生效 */
:deep(.messageList::-webkit-scrollbar) {
  width: 10px;
}

:deep(.messageList::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.messageList::-webkit-scrollbar-thumb) {
  background: #888;
}

:deep(.messageList::-webkit-scrollbar-thumb:hover) {
  background: #555;
}

.messageList .messageList-item .content_user {
  padding: 10px;
  width: 600px;
  text-align: end;
  margin-left: 40px;
  position: relative;
  span {
    display: inline-block;
    padding: 8px;
    color: #fff;
    background-color: #ffffff1f;
    border-radius: 8px;
    border: 0.5px solid #ffffff19;
  }
  .operate_culumn {
    display: none; /* 默认隐藏 */
    position: absolute; /* 相对父级容器定位 */
    top: 102%;
    right: 2%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.732);
    font-size: 16px;
  }
}

.messageList .messageList-item .content_assistant {
  padding: 10px;
  width: 600px;
  // background-color: pink;
  margin-right: 40px;
  position: relative;
  span {
    display: inline-block;
    padding: 8px;
    color: #fff;
    background-color: #ffffff1f;
    border-radius: 8px;
    border: 0.5px solid #ffffff19;
  }
  .operate_culumn {
    display: none; /* 默认隐藏 */
    position: absolute; /* 相对父级容器定位 */
    top: 100%;
    right: 100;
    color: rgba(255, 255, 255, 0.732);
    font-size: 16px;
  }
}

.messageList .messageList-item .content_user:hover .operate_culumn,
.messageList .messageList-item .content_assistant:hover .operate_culumn {
  display: block;
  transition: 0s; /* 进入时无延迟 */
}

.messageList .messageList-item .operate_culumn {
  transition: 1s; /* 退出时延迟0.5秒 */
}

.messageList .messageList-item .operate_culumn i {
  padding: 5px;
  border-radius: 5px;
}

.messageList .follow-up {
  display: flex;
  margin-left: 29%;
  color: #fff;
  span {
    padding: 5px;
    background-color: #ffffff1f;
    border: 0.5px solid #ffffff19;
    border-radius: 50px;
    margin-bottom: 10px;
  }
  i {
    font-size: 20px;
  }
  span:hover {
    background-color: #ffffff40;
  }
}

// 图片-------------------------------------------------------------------------------------------
.messageList .messageList-item img {
  width: 400px;
}

// 底部footer-------------------------------------------------------------------------------------
.footer {
  position: absolute; /* 绝对定位 */
  bottom: 0;
  width: 100%; /* 占满父容器的宽度 */
  padding: 10px; /* 内边距 */
  .container {
    width: 55%;
    margin: 0 auto;
    background-color: #ffffff20;
    border-radius: 10px;
    .el-textarea {
      height: 50px;
      --el-input-text-color: #fff;
    }
    .operateBox {
      display: flex;
      .el-button {
        --el-button-text-color: #fff;
        --el-button-bg-color: inherit;
        border: none;
      }
      .otherType {
        flex: 1;
      }
    }
  }
}
//预览----------------------------------------------------------------------------------------------------
.footer .fileList {
  width: 55%;
  margin: 0 auto;
  display: flex;
  justify-content: end;
  margin-bottom: 5px;
  background: pink;
  img {
    width: 100px;
  }
}

// 引导-------------------------------------------------------------------------------------------------
.footer.help {
  bottom: 40%; /* 固定在父容器的底部 */
}
.help-title {
  color: #fff;
  font-size: 40px;
  position: absolute;
  left: 34%;
  top: 30%;
}
// 空白页blank-page-------------------------------------------------------------------------------------
.blank-page {
  padding-top: 15%;
  // background-color: pink;
  text-align: center;
  position: relative;
  img {
    width: 30%;
    border-radius: 30px;
  }
  p {
    font-size: 50px;
    color: #fff;
  }
  .icon-aislogo {
    position: absolute;
    color: #fff;
    font-size: 40px;
    transition: transform 0.5s ease-in-out; /* 平滑过渡动画 */
    padding: 10px;
    border-radius: 50px;
    left: 48%;
  }
  .icon-aislogo:hover {
    animation: fade-rotate 2s linear infinite; /* 设置持续旋转动画 */
    cursor: pointer;
  }
}

/* 定义动画(旋转+背景) */
@keyframes fade-rotate {
  0% {
    transform: rotate(0deg); /* 起始位置 */
    background-color: #f6f6f600; /* 初始颜色（暗） */
  }
  50% {
    background-color: #ffffff27; /* 中间颜色（亮一点） */
  }
  100% {
    transform: rotate(360deg); /* 结束位置 */
    background-color: #ffffff00; /* 恢复初始颜色 */
  }
}
// 上传
.el-upload.el-upload--picture-card {
  position: absolute;
}
</style>
