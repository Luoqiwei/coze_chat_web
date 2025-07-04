<script setup>
import { ref } from 'vue'
import { checkSpaceList } from '@/api/space'
import { createConversation } from '@/api/LLMConversation'
import { useCounterStore } from '@/stores/counter'
import { EventBus } from '@/utils/eventBus'

const store = useCounterStore()
let activeId = ref('')

const conversationList = ref(store.conversationStorage.id)
async function addNewConversation() {
  const res = await createConversation()
  console.log('添加新会话')
  // 本地存入新会话
  store.conversationAdd(res.id) // 添加一个新 id
  console.log(store.conversationStorage.id) // 输出: ['new_id_123']
}

// 渲染对应会话详情组件------------------
function goToDetail(id) {
  console.log(id)
  EventBus.emit('conversation_id', id)
  activeId.value = id
}

// const spaceList = await checkSpaceList()
// console.log(spaceList)

// const res = await createBot({ space_id: '7444862126382546978', name: '个人空间' })
// console.log(res) // "7446717826477981731"
// const res2 = await pulishBot({ bot_id: '7446717826477981731', connector_ids: ['1024'] })
// console.log(res2)
// const botList = await checkBotList('7444862126382546978')
// console.log(botList)
</script>
<template>
  <div class="conversationList">
    <!-- 页头 -->
    <div class="listHeader">
      <p class="title">title</p>
      <p class="icon iconfont icon-tianjia" @click="addNewConversation()">
        <span class="tooltip-tianjia cusor-pass">新会话</span>
      </p>
    </div>
    <!-- 列表 -->
    <ul class="conversation_list" style="overflow: auto">
      <li
        class="conversation_item cusor-pass"
        :class="{ active: activeId === id }"
        v-for="id in conversationList"
        :key="id"
        @click="goToDetail(id)"
      >
        {{ id }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
.conversationList {
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.818);
  .listHeader {
    display: flex;
    color: #fff;
    background-color: #ffffff27;
    justify-content: space-between;
    padding: 10px;
    position: relative;
    .icon-tianjia {
      font-size: 18px;
      .tooltip-tianjia {
        display: none;
        position: absolute; /* 相对于父容器定位 */
        bottom: -40%; /* 出现在触发元素的上方 */
        left: 85%;
        transform: translateX(-50%); /* 居中对齐 */
        background-color: #ffffff7e;
        color: #000000;
        white-space: nowrap; /* 防止文本换行 */
        border-radius: 2px;
        padding: 2px;
        font-size: 16px;
        transition: 0.5s;
      }
    }
    p {
      padding: 5px;
      border-radius: 2px;
      transition: 0.5s;
      cursor: pointer;
    }
    p:hover {
      color: #000000;
      background-color: #ffffff7a;
    }
    .icon-tianjia:hover .tooltip-tianjia {
      display: block;
    }
  }
}
// 列表
.conversation_list {
  margin-top: 20px;
  text-align: center;
  .conversation_item {
    color: #fff;
    white-space: nowrap; /* 不允许文本换行 */
    overflow: hidden; /* 超出部分隐藏 */
    text-overflow: ellipsis; /* 超出部分使用省略号显示 */
    padding: 5px; /* 可选：调整内边距 */
    border-radius: 5px;
    margin: 0 10px;
  }
  .conversation_item.active {
    background-color: #ffffff40;
  }
}
</style>
