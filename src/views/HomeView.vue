<script setup>
// import { ref } from 'vue'
// import { checkSpaceList } from '@/api/space'
import ConversationList from '@/components/ConversationList.vue'
import ConversationDetail from '@/components/ConversationDetail.vue'
</script>
<template>
  <div class="wrapper">
    <div class="conversation_list">
      <ConversationList />
    </div>
    <div class="conversation_detail">
      <ConversationDetail />
    </div>
  </div>
</template>

<style scoped lang="less">
.wrapper {
  display: flex;
  flex-direction: row; /* 子元素水平排列 */
  align-items: stretch; /* 子元素高度拉伸以填充父容器 */
  flex-grow: 1; /* 确保wrapper填满父容器 */
  height: 100vh; /* 占满整个视口高度 */
  .conversation_list {
    width: 15%;
  }
  .conversation_detail {
    width: 85%;
  }
}
</style>
