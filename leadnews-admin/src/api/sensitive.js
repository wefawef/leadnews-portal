import Request from '@/utils/request'
import { API_SENSITIVE_LIST, API_SENSITIVE_SAVE, API_SENSITIVE_UPDATE, API_SENSITIVE_DELETE } from '@/constants/api'

// 列表查询：接收 { page, size, name }，当 name==='all' 时查全部
export function listSensitive(params) {
  const { page, size, name } = params || {}
  return new Request({
    url: API_SENSITIVE_LIST,
    method: 'post',
    data: { page, size, name: name || 'all' }
  })
}

// 新增：实体参数，仅需 { sensitives }
export function saveSensitive(entity) {
  const { id = null, sensitives, createdTime = null } = entity || {}
  return new Request({
    url: API_SENSITIVE_SAVE,
    method: 'post',
    data: { id, sensitives, createdTime }
  })
}

// 修改：实体参数，需 { id, sensitives }
export function updateSensitive(entity) {
  const { id, sensitives, createdTime = null } = entity || {}
  return new Request({
    url: API_SENSITIVE_UPDATE,
    method: 'post',
    data: { id, sensitives, createdTime }
  })
}

// 删除：路径参数 /del/{id}
export function deleteSensitive(id) {
  return new Request({
    url: `${API_SENSITIVE_DELETE}/${id}`,
    method: 'delete'
  })
}