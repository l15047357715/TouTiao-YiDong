<template>
  <div class="chat-container">
    <!-- 导航栏 -->
    <van-nav-bar title="小智同学" left-arrow @click-left="$router.back()" fixed />
    <!-- /导航栏 -->

    <!-- 消息列表 -->
    <div class="message-list" ref="message-list">
      <div
        class="message-item"
        :class="{ reverse: item.isMySelf }"
        v-for="(item, index) in messages"
        :key="index"
      >
        <van-image class="avatar" slot="icon" round width="30" height="30" :src="item.photo" />
        <div class="title">
          <span>{{ item.msg }}</span>
        </div>
      </div>
    </div>
    <!-- /消息列表 -->

    <!-- 发送消息 -->
    <van-cell-group class="send-message">
      <van-field v-model="inputMessage" center clearable>
        <van-button slot="button" size="small" type="primary" @click="onSendMessage">发送</van-button>
      </van-field>
    </van-cell-group>
    <!-- /发送消息 -->
  </div>
</template>

<script>
import io from 'socket.io-client'
import { getItem, setItem } from '@/utils/storage'

export default {
  name: 'ChatIndex',
  data () {
    return {
      inputMessage: '',
      messages: getItem('chat-messages') || [],
      socket: null
    }
  },
  computed: {
    messageList () {
      return this.$refs['message-list']
    }
  },
  watch: {
    messages () {
      setItem('chat-messages', this.messages)
      // 数组中的数据变了，列表的滚动条高度肯定也变化了
      // 所以在这里统一处理让滚动条滚动到最底部

      // 数据改变和更新视图不是立即的

      // 所以如果你有修改完数据立即操作 DOM 的需求，那就一定要把代码代码写到 $nextTick 函数中
      this.$nextTick(() => {
        // 这里的代码意味着视图也得到更新了
        this.toBottom()
      })
    }
  },
  methods: {
    // 发送消息
    onSendMessage () {
      // 非空校验
      const inputMessage = this.inputMessage.trim()
      if (!inputMessage) {
        return
      }
      // 发送消息
      const message = {
        msg: inputMessage,
        timestamp: Date.now()
      }
      this.socket.emit('message', message)
      // 存储发出去的消息
      this.messages.push({
        ...message,
        photo: 'http://toutiao.meiduo.site/Fo8cHltcuMGxqrEnq8G5tBdVzuKZ', // 用户头像
        isMySelf: true // 是否是我自己
      })
      // 清空文本框
      this.inputMessage = ''
    },
    toBottom () {
      this.messageList.scrollTop = this.messageList.scrollHeight
    }
  },
  created () {
    const socket = io('http://ttapi.research.itcast.cn')
    this.socket = socket

    socket.on('connect', () => {
      console.log('建立连接成功！')
    })
    // 接收消息
    socket.on('message', data => {
      this.messages.push({
        ...data,
        isMySelf: false,
        photo: 'https://img.yzcdn.cn/vant/cat.jpeg'
      })
    })
  },
  mounted () {
    // 初始化的时候自动滚动到底部
    this.toBottom()
  }
}
</script>

<style scoped lang='less'>
.chat-container {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 46px 0 50px 0;
  top: 0;
  left: 0;
  box-sizing: border-box;
  background: #f5f5f6;
  .message-list {
    height: 100%;
    overflow-y: scroll;
    .message-item {
      display: flex;
      align-items: center;
      padding: 10px;
      .title {
        background: #fff;
        padding: 5px;
        border-radius: 6px;
      }
      .avatar {
        margin-right: 5px;
      }
    }
    .reverse {
      flex-direction: row-reverse;
      .title {
        margin-right: 5px;
      }
    }
  }
  .send-message {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #f5f5f6 !important;
  }
}
</style>
