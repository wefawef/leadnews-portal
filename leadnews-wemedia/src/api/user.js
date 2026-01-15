import Request from '@/utils/request' 
import { API_USERPROFILE , API_HEAD} from  '@/constants/api'

//获取用户个人信息
export function getUserInform (id) {
    return  Request({
        url:`http://127.0.0.1:51602/wemedia/api/v1/user/getUserInform/${id}`,
        method:'post'
    })
}

//获取用户个人信息 (Deprecated or kept for compatibility if needed, but user asked to modify the request)
export function getUserProfile () {
    return  Request({
        url:API_USERPROFILE,
        method:'get'
    })
}
//编辑用户信息
export function updateUserProfile (data) {
    return  Request({
        url:API_USERPROFILE,
        method:'patch',
        data
    })

}
//修改用户的头像
export function updateUserHead  (data) {
  return Request({
    url:'http://127.0.0.1:51602/wemedia/api/v1/user/upWmUserImage',
    method:'post',
    data
  })
}

//修改用户信息
export function updateUserInform (data) {
  return Request({
      url:'http://127.0.0.1:51602/wemedia/api/v1/user/upDateUserInform',
      method:'post',
      data
  })
}