import request from '@/utils/request'

export const login = ({ mobile, code }) => {
  return request({
    method: 'post',
    url: '/app/v1_0/authorizations',
    ata: {
      mobile,
      code
    }
  })
}
