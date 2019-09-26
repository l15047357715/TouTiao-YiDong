<template>
  <div class="serach-result">
    <!-- 导航栏 -->
    <van-nav-bar title="xxx 的搜索结果" left-arrow fixed @click-left="$router.back()" />
    <!-- /导航栏 -->

    <!-- 文章列表 -->
    <van-list
      class="article-list"
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell v-for="article in list" :key="article.art_id.toString()" :title="article.title" />
    </van-list>
    <!-- /文章列表 -->
  </div>
</template>

<script>
import { getSearch } from '@/api/search'

export default {
  name: 'SearchResult',
  data () {
    return {
      list: [],
      loading: false,
      finished: false,
      page: 1
    }
  },

  methods: {
    async onLoad () {
      const { data } = await getSearch({
        page: this.page,
        perPage: 10,
        q: this.$route.params.q
      })
      const { results } = data.data
      this.list.push(...results)
      this.loading = false
      // 4. 判断是否已全部加载结束
      if (results.length) {
        this.page++
      } else {
        this.finished = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.serach-result {
  .article-list {
    margin-top: 46px;
  }
}
</style>
