<template>
  <div class="home">
    <van-nav-bar title="首页" />

    <van-tabs v-model="active">
      <van-tab :title="channel.name" v-for="channel in channels" :key="channel.id">
        <van-list
          v-model="channel.loading"
          :finished="channel.finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="article in channel.articles"
            :key="article.art_id.toString()"
            :title="article.title"
          />
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { getAllChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 0,
      channels: []
    }
  },
  computed: {
    currentChannel () {
      // active 是动态的，active 改变也就意味着 currentChannel 也改变了

      return this.channels[this.active]
    }
  },
  methods: {
    async loadAllChannels () {
      const { data } = await getAllChannels()
      console.log(data)
      // 为每一个频道初始化一个成员 articles 用来存储该频道的文章列表
      data.data.channels.forEach(channel => {
        channel.articles = [] // 频道的文章列表
        channel.loading = false // 频道的上拉加载更多的 loading 状态
        channel.finished = false // 频道的加载结束的状态
        channel.timestamp = null // 用于获取下一页数据的时间戳（页码）
      })
      this.channels = data.data.channels
    },
    async onLoad () {
      // 1. 请求加载文章列表
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        // 第1页数据传递当前最新时间戳
        // 下一页数据传递上一页返回数据结果中的 pre_timestamp
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })
      console.log(data)
      // 2. 将得到的文章列表添加到当前频道.articles 中
      const { pre_timestamp: preTimestamp, results } = data.data
      currentChannel.articles.push(...results)

      // 3. 本次 onLoad 数据加载完毕，将 loading 设置为 false
      currentChannel.loading = false

      // 4. 判断是否还有下一页数据
      if (!preTimestamp) {
        currentChannel.finished = true
      } else {
        // 还有数据，将本次得到的 preTimestamp 存储到当前频道，用于加载下一页数据
        currentChannel.timestamp = preTimestamp
      }
    }
  },
  created () {
    this.loadAllChannels()
  }
}
</script>

<style lang="less" scoped>
</style>
