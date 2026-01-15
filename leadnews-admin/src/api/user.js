import Request from '@/utils/request' 
import { API_USERPROFILE , API_HEAD, API_USER_LIST, API_USER_UPDATE, API_WEMEDIA_USER_UPDATE, API_ADMIN_INFO, API_ADMIN_IMAGE_UPLOAD, API_ADMIN_UPDATE} from  '@/constants/api'
//获取用户个人信息
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
    url:API_HEAD,
    method:'patch',
    data
  })
}

//用户状态更新
export function updateUserStatus(data) {
  return Request({
    url: API_USER_UPDATE,
    method: 'post',
    data
  })
}

//自媒体用户状态更新
export function updateWmUserStatus(data) {
  return Request({
    url: API_WEMEDIA_USER_UPDATE,
    method: 'post',
    data
  })
}
export function authLoadList(keyWord) {
  return Request({
    url: API_USER_LIST,
    method: 'post',
    params: { keyWord }
  })
}

// 获取管理员信息
export function getAdminInfo(id) {
  return Request({
    url: API_ADMIN_INFO + "/" + id,
    method: 'get'
  })
}

export function upAdminImage(data) {
  return Request({
    url: API_ADMIN_IMAGE_UPLOAD,
    method: 'post',
    data
  })
}

export function upAdminInform(data) {
  return Request({
    url: API_ADMIN_UPDATE,
    method: 'post',
    data
  })
}
