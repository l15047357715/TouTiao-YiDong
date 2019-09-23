import request from '@/utils/request'

export const getArticles = ({
  channelId,
  timestamp,
  withTop
}) => {
  return request({
    method: 'GET',
    url: '/app/v1_1/articles',
    params: {
      channel_id: channelId,
      timestamp, // 时间戳，请求新的推荐数据传当前的时间戳，请求历史推荐传指定的时间戳
      with_top: withTop
    }
  })
}
