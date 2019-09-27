<template>
  <div class="article-container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="文章详情"></van-nav-bar>

    <van-loading class="article-loading" v-if="loading" />

    <div class="detail" v-else-if="article.title">
      <h3 class="title">{{article.title}}</h3>

      <div class="author">
        <van-image round width="2rem" height="2rem" fit="fill" :src="article.aut_photo" />

        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate | relativeTime}}</p>
        </div>

        <van-button
          round
          size="small"
          :type="article.is_followed ? 'default' : 'info'"
          @click="onFollow"
        >{{ article.is_followed ? '已关注' : '+ 关注' }}</van-button>
      </div>

      <div class="content" v-html="article.content"></div>

      <div class="zan">
        <van-button
          round
          size="small"
          hairline
          plain
          icon="good-job-o"
          :type="article.attitude === 1 ? 'default' : 'primary'"
          @click="onLike"
        >{{ article.attitude === 1 ? '取消点赞' : '+ 点赞' }}</van-button>&nbsp;&nbsp;&nbsp;&nbsp;
        <van-button
          round
          size="small"
          hairline
          plain
          icon="delete"
          :type="article.attitude === 0 ? 'default' : 'danger'"
          @click="onDislike"
        >{{ article.attitude === 0 ? '取消不喜欢' : '不喜欢' }}</van-button>
      </div>
    </div>

    <div class="error" v-else>
      <p>
        网络超时，点击
        <a href="#" @click.prevent="loadArticle">刷新</a> 试一试。
      </p>
    </div>

    <!-- 文章评论 -->
    <article-comment :article-id="$route.params.articleId" />
    <!-- /文章评论 -->
  </div>
</template>

<script>
import ArticleComment from './components/comment'
import {
  getArticle,
  likeArticle,
  unLikeArticle,
  addDislike,
  deleteDislike
} from '@/api/article'
import { followUser, unFollowUser } from '@/api/user'
export default {
  name: 'ArticleIndex',
  components: {
    ArticleComment
  },
  data () {
    return {
      article: {},
      loading: true
    }
  },
  methods: {
    async loadArticle () {
      this.loading = true
      try {
        const { data } = await getArticle(this.$route.params.articleId)
        this.article = data.data
      } catch (err) {
        console.log(err)
      }
      this.loading = false
    },
    onFollow () {
      const { is_followed: isFollowed, aut_id: autId } = this.article
      if (isFollowed) {
        // 已关注，取消关注
        unFollowUser(autId)
      } else {
        // 没有关注，去关注
        followUser(autId)
      }
      // 修改视图数据
      this.article.is_followed = !isFollowed
    },
    onLike () {
      const { attitude } = this.article
      const articleId = this.article.art_id.toString()

      if (attitude === 1) {
        // 已点赞，取消点赞
        unLikeArticle(articleId)
        this.article.attitude = -1
      } else {
        // 没有点赞，去点赞
        likeArticle(articleId)
        this.article.attitude = 1
      }
    },
    onDislike () {
      const { attitude } = this.article
      const articleId = this.article.art_id.toString()

      if (attitude === 0) {
        // 已不喜欢，取消不喜欢
        deleteDislike(articleId)
        this.article.attitude = -1
      } else {
        // 没有不喜欢，去不喜欢
        addDislike(articleId)
        this.article.attitude = 0
      }
    }
  },
  created () {
    this.loadArticle()
  }
}
</script>

<style scoped lang='less'>
.article-container {
  position: absolute;
  left: 0;
  top: 0;
  overflow-y: scroll;
  width: 100%;
  height: 100%;
}
.article-loading {
  padding-top: 100px;
  text-align: center;
}
.error {
  padding-top: 100px;
  text-align: center;
}
.detail {
  padding: 50px 10px;
  .title {
    font-size: 16px;
  }
  .zan {
    text-align: center;
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.3;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  .content {
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img {
      max-width: 100%;
      background: #f9f9f9;
    }
  }
}
</style>
