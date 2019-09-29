import request from '@/utils/request'

export const login = ({ mobile, code }) => {
  return request({
    method: 'post',
    url: '/app/v1_0/authorizations',
    data: {
      mobile,
      code
    }
  })
}

export const followUser = userId => {
  return request({
    method: 'POST',
    url: '/app/v1_0/user/followings',
    data: {
      target: userId
    }
  })
}

/**
 * 取消关注用户
 */
export const unFollowUser = userId => {
  return request({
    method: 'DELETE',
    url: `/app/v1_0/user/followings/${userId}`
  })
}

/**
 * 获取用户自己信息
 */
export const getSelf = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/user'
  })
}

/**
 * 获取用户个人资料
 */
export const getProfile = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/user/profile'
  })
}

/**
 * 更新用户头像
 */
export const updateUserPhoto = file => {
  const formData = new FormData()
  formData.append('photo', file)
  // 请求头中的 Content-Type
  //    application/json  axios会自动设置，传递普通 JavaScript 对象即可
  //    multipart/form-data 传递 FormData，axios 也会自动设置
  return request({
    method: 'PATCH',
    url: '/app/v1_0/user/photo',
    // application/json
    // data: {}

    // multipart/form-data
    // 注意：一般上传文件的接口都会要求请求头的 Content-Type 是 multipart/form-data
    data: formData
  })
}
export const updateUserProfile = ({
  name,
  gender,
  birthday
}) => {
  return request({
    method: 'PATCH',
    url: '/app/v1_0/user/profile',
    data: {
      name, // 昵称
      gender, // 性别
      birthday // 生日
    }
  })
}
