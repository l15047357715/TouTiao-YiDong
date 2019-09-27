<template>
  <div class="home">
    <van-nav-bar fixed>
      <van-button
        class="search-btn"
        slot="title"
        round
        type="info"
        size="small"
        @click="$router.push('/search')"
      >搜索</van-button>
    </van-nav-bar>

    <van-tabs v-model="active" swipeable animated>
      <van-tab :title="channel.name" v-for="channel in myChannels" :key="channel.id">
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
              @click="$router.push({
                name: 'article',
                params: {
                  articleId: article.art_id.toString()
                }
              })"
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
    <van-popup v-model="isChannelEditShow" position="bottom" :style="{ height: '90%' }" round>
      <div>
        <van-cell title="我的频道">
          <van-button type="danger" size="mini" @click="isEdit = !isEdit">{{ isEdit ? '完成' : '编辑' }}</van-button>
        </van-cell>
        <van-grid :gutter="10">
          <van-grid-item
            v-for="(channel,index) in myChannels"
            :key="channel.id"
            :text="channel.name"
            @click="onEditDel(channel.id, index)"
          >
            <van-icon v-show="isEdit" class="icon-close" slot="icon" name="close" />
          </van-grid-item>
        </van-grid>
      </div>

      <div>
        <van-cell title="频道推荐"></van-cell>
        <van-grid :gutter="10">
          <van-grid-item
            v-for="channel in remainingChannels"
            :key="channel.id"
            :text="channel.name"
            @click="onAddChannel(channel)"
          />
        </van-grid>
      </div>
    </van-popup>
  </div>
</template>

<script>
import {
  getUserOrDefaultChannels,
  getAllChannels,
  resetUserChannels,
  deleteUserChannel
} from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import { getItem, setItem } from '@/utils/storage'
export default {
  name: 'HomeIndex',
  data () {
    return {
      active: 0,
      myChannels: [], // 我的频道
      allChannels: [], // 所有频道
      isChannelEditShow: false,
      isEdit: false
    }
  },
  computed: {
    ...mapState(['user']),
    currentChannel () {
      return this.myChannels[this.active]
    },
    remainingChannels () {
      const remain = []
      this.allChannels.forEach(all => {
        const index = this.myChannels.findIndex(my => my.id === all.id)
        if (index === -1) {
          remain.push(all)
        }
      })
      return remain
    }
  },
  methods: {
    // 我的频道
    async loadUserOrDefaultChannels () {
      let extend = []
      // 1. 如果用户已登录，则请求获取后端存储的用户频道列表
      if (this.user) {
        const { data } = await getUserOrDefaultChannels()
        // console.log(data)
        extend = data.data.channels
      } else {
        // 2. 如果用户没有登录，则查看本地存储是否有频道列表
        const localChannels = getItem('channels')
        // 2.1 如果本地存储有，则获取使用
        if (localChannels) {
          extend = localChannels
        } else {
          // 2.2 如果本地存储没有，则请求获取默认推荐的频道列表
          const { data } = await getUserOrDefaultChannels()
          // console.log(data)
          extend = data.data.channels
        }
      }
      extend.forEach(one => {
        const extendData = this.extendChannelData()
        // 把 extendData 合并到 channel 中
        Object.assign(one, extendData)
      })
      this.myChannels = extend
    },
    // 所有频道
    async loadAllChannels () {
      const { data } = await getAllChannels()
      const extend = data.data.channels

      extend.forEach(one => {
        const extendData = this.extendChannelData()
        // 把 extendData 合并到 one 中
        Object.assign(one, extendData)
      })
      this.allChannels = extend
    },
    // 初始化调用,加载更多调用，获取文章
    async onLoad () {
      const currentChannel = this.currentChannel
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })
      // console.log(data)
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
    },

    async onAddChannel (one) {
      // 添加到我的频道
      this.myChannels.push(one)
      // 持久化
      if (this.user) {
        // 已登录：请求保存到后端
        const channels = []
        // 处理提取要重置的频道列表
        // this.myChannels.slice(1) 不包括第1个频道（推荐）
        this.myChannels.slice(1).forEach((item, index) => {
          channels.push({
            id: item.id,
            seq: index + 2
          })
        })
        // 请求重置
        await resetUserChannels(channels)
      } else {
        setItem('channels', this.myChannels)
      }
    },
    async onEditDel (id, index) {
      // 如果是编辑状态，删除频道
      if (this.isEdit) {
        // 删除频道
        this.myChannels.splice(index, 1) // 将数据从视图中移除
        // 持久化
        if (this.user) {
          // 已登录，请求删除
          await deleteUserChannel(id)
        } else {
          // 未登录，删除本地存储
          // 注意：本地存储中的数据无法像操作 js 数据成员一样来修改
          //      如果想要修改，则重新存储实现修改
          setItem('channels', this.myChannels)
        }
      } else {
        // 如果是非编辑状态，则切换频道
        this.active = index
        this.isChannelEditShow = false
      }
    },

    extendChannelData () {
      return {
        articles: [],
        loading: false,
        finished: false,
        timestamp: null,
        pullDownLoading: false
      }
    }
  },
  created () {
    this.loadUserOrDefaultChannels()
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

  .icon-close {
    position: absolute;
    top: -5px;
    right: -5px;
  }
}
.search-btn {
  width: 100%;
  background: #5babfb;
}
</style>
