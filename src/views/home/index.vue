<template>
  <div class="home">
    <van-nav-bar title="首页" fixed />

    <van-tabs v-model="active" swipeable animated>
      <van-tab :title="channel.name" v-for="channel in channels" :key="channel.id">
        <van-pull-refresh v-model="channel.pullDownLoading" @refresh="onRefresh">
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
            >
              <div slot="label">
                <van-grid :column-num="3">
                  <van-grid-item v-for="(img, index) in article.cover.images" :key="index">
                    <van-image height="80" :src="img" lazy-load />
                  </van-grid-item>
                </van-grid>
                <div class="article-info">
                  <div class="meta">
                    <span>{{ article.aut_name }}</span>
                    <span>{{ article.comm_count }}评论</span>
                    <span>{{ article.pubdate | relativeTime }}</span>
                  </div>
                  <van-icon name="close" />
                </div>
              </div>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <div slot="nav-right" class="wap-nav" @click="isChannelEditShow = true">
        <van-icon name="wap-nav" size="24" />
      </div>
    </van-tabs>
    <van-popup
      v-model="isChannelEditShow"
      position="bottom"
      :style="{ height: '90%' }"
      closeable
      round
    />
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
      channels: [],
      isChannelEditShow: false
    }
  },
  computed: {
    currentChannel () {
      return this.channels[this.active]
    }
  },
  methods: {
    async loadAllChannels () {
      const { data } = await getAllChannels()
      console.log(data)
      data.data.channels.forEach(channel => {
        channel.articles = []
        channel.loading = false
        channel.finished = false
        channel.timestamp = null
        channel.pullDownLoading = false
      })
      this.channels = data.data.channels
    },
    async onLoad () {
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })
      console.log(data)

      const { pre_timestamp: preTimestamp, results } = data.data
      currentChannel.articles.push(...results)

      if (!preTimestamp) {
        currentChannel.finished = true
      } else {
        currentChannel.timestamp = preTimestamp
      }
      currentChannel.loading = false
    },
    async onRefresh () {
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: Date.now(),
        withTop: 1
      })
      currentChannel.articles.unshift(...data.data.results)
      currentChannel.pullDownLoading = false
      this.$toast('刷新成功')
    }
  },
  created () {
    this.loadAllChannels()
  }
}
</script>

<style lang="less" scoped>
.home {
  .article-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .meta span {
      margin-right: 10px;
    }
  }
  .van-tabs {
    /deep/ .van-tabs__wrap {
      position: fixed;
      top: 46px;
      z-index: 2;
      left: 0;
      right: 0;
    }
    /deep/ .van-tabs__content {
      margin-bottom: 50px;
      margin-top: 90px;
    }
  }
  .wap-nav {
    position: sticky;
    right: 0;
    display: flex;
    align-items: center;
    background-color: #fff;
  }
}
</style>
