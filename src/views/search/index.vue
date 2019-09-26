<template>
  <div>
    <!-- 搜索框 -->
    <form action="/">
      <van-search
        v-model="searchText"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch(searchText)"
        @cancel="onCancel"
      />
    </form>
    <!-- /搜索框 -->

    <!-- 联想建议 -->
    <van-cell-group v-if="searchText">
      <van-cell icon="search" v-for="item in suggest" :key="item" @click="onSearch(item)">
        <div slot="title" v-html="highLight(item)"></div>
      </van-cell>
    </van-cell-group>
    <!-- /联想建议 -->

    <!-- 历史记录 -->
    <van-cell-group v-else>
      <van-cell title="历史记录">
        <template v-if="isDeleteShow">
          <span style="margin-right:10px;" @click="searchHistory = []">全部删除</span>
          <span @click="isDeleteShow = false">完成</span>
        </template>
        <van-icon
          v-else
          slot="right-icon"
          name="delete"
          @click="isDeleteShow = true"
          style="line-height:inherit;"
        />
      </van-cell>
      <!-- 历史记录列表 -->
      <van-cell
        :title="item"
        v-for="(item,index) in searchHistory"
        :key="item"
        @click="onSearch(item)"
      >
        <van-icon
          slot="right-icon"
          name="close"
          v-show="isDeleteShow"
          @click="searchHistory.splice(index, 1)"
          style="line-height:inherit;"
        />
      </van-cell>
    </van-cell-group>
    <!-- /历史记录 -->
  </div>
</template>

<script>
import { getSuggest } from '@/api/search'
import { getItem, setItem } from '@/utils/storage'
import { debounce } from 'lodash'

export default {
  name: 'SearchIndex',
  data () {
    return {
      searchText: '',
      suggest: [],
      searchHistory: getItem('search-histories') || [], // 存储历史记录
      isDeleteShow: false
    }
  },
  watch: {
    searchText: debounce(async function (newValue) {
      if (!newValue.trim().length) {
        return
      }
      const { data } = await getSuggest(newValue)
      this.suggest = data.data.options
    }, 1000),

    searchHistory (newValue) {
      // 当数据发生改变，重新保存到本地存储
      setItem('search-history', newValue)
    }
  },
  methods: {
    onSearch (q) {
      if (!q.trim().length) {
        return
      }
      // 记录历史记录
      const searchHistory = this.searchHistory
      const index = searchHistory.findIndex(item => {
        return item.trim().toLowerCase() === q.trim().toLowerCase()
      })
      // 如果已存在，则将其移除
      if (index !== -1) {
        searchHistory.splice(index, 1)
      }
      // 将最新搜索记录保存到最前面
      searchHistory.unshift(q)

      setItem('search-history', searchHistory)
      // this.$router.push({
      //   name: 'search-result',
      //   params: {
      //     q
      //   }
      // })
    },
    onCancel () {},
    highLight (str) {
      const searchText = this.searchText
      // 根据用户输入的内容创建一个动态的正则表达式
      const reg = new RegExp(searchText, 'gi')
      return str.replace(reg, `<span style="color: red;">${searchText}</span>`)
    }
  }
}
</script>
