import Request from '@/utils/request'
import { API_CHANNEL_LIST_ALL, API_CHANNEL_LIST, API_CHANNEL_SAVE, API_CHANNEL_UPDATE, API_CHANNEL_DELETE } from '@/constants/api'

export function getAllChannels() {
  return new Request({
    url: API_CHANNEL_LIST_ALL,
    method: 'get',
    data: {}
  })
}

export function listChannels(params) {
  const { page, size, name } = params || {}
  return new Request({
    url: API_CHANNEL_LIST,
    method: 'post',
    data: { page, size, name }
  })
}

export function saveChannel(entity) {
  return new Request({
    url: API_CHANNEL_SAVE,
    method: 'post',
    data: entity
  })
}

export function updateChannel(entity) {
  return new Request({
    url: API_CHANNEL_UPDATE,
    method: 'post',
    data: entity
  })
}

export function deleteChannel(id) {
  return new Request({
    url: `${API_CHANNEL_DELETE}/${id}`,
    method: 'get'
  })
}
