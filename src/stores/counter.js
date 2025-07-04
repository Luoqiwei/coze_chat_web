import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function getToken() {
    // pat_zM2sReB774YXepTMyj8Q1fm0BPhQZjWTxsxAVHYTuYjfsep0WGc7BFn9zVS0mY13
    return 'pat_4SfMOPB2ls4L3N9H7PL1qEmHylBylc2aF5UXf5EocQbtRpi68HrDm5vQrgKYBtwj'
  }
  const conversationStorage = ref(
    JSON.parse(localStorage.getItem('LLMConversationList')) || { id: [] },
  )
  function conversationAdd(newId) {
    conversationStorage.value.id.unshift(newId) // 将新 id 添加到数组第一位
    // 更新 localStorage
    localStorage.setItem('LLMConversationList', JSON.stringify(conversationStorage.value))
  }

  // 各个会话的消息列表
  const userMessageList = ref({})

  function messageListAdd(conversation_id) {
    userMessageList.value[conversation_id] = [] //id: [ {} {} ]
  }

  function messageListChange(conversation_id, obj) {
    userMessageList.value[conversation_id].push(obj)
  }

  return {
    count,
    doubleCount,
    getToken,
    conversationStorage,
    conversationAdd,
    userMessageList,
    messageListAdd,
    messageListChange,
  }
})
