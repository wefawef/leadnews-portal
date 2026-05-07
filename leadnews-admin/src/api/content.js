import Request from '@/utils/request'
import  { API_ARTICLES_INFO,API_STATISTICS_NEWS , API_SEARCHARTICELS,API_SEARCHARTICELS_VO,API_ARTICLES_ONE_VO,API_ARTICLES_DELETE,API_ARTICLES_DOWN,API_ARTICLES_LIST_CHECK_BY_HUMAN,API_ARTICLES_CHECK_BY_HUMAN,API_HOT_ARTICLES } from  '@/constants/api'

//获取统计数据
export function getNewsStatistics(data) {
  return Request({
    url:API_STATISTICS_NEWS,
    method:'post',
    params:{},
    data:data
  })
}

//获取文章列表
export function getArticleById (articlesId) {
  return Request({
    url:API_ARTICLES_INFO,
    method:'post',
    params:{},
    data:{id:articlesId}
  })
}
export function deleteArticles (articlesId) {
  return  Request({
    url:API_ARTICLES_DELETE ,
    method:'post',
    params:{},
    data:{id:articlesId}
  })
}
//搜索文章
export function  searchArticle (data) {
  return   Request({
    url:API_SEARCHARTICELS,
    method:'post',
    data,
    params:{}
  })
}

export function searchArticleVo (data) {
  return   Request({
    url:API_SEARCHARTICELS_VO,
    method:'post',
    data,
    params:{}
  })
}

export function getArticleVoById (id) {
  return Request({
    url: API_ARTICLES_ONE_VO + '/' + id,
    method: 'get'
  })
}

export function downNews (id) {
  return Request({
    url: API_ARTICLES_DOWN + '/' + id,
    method: 'post'
  })
}

export function listCheckByHuman (params) {
  let data = params || {}
  let title = data.title || 'all'
  let url = API_ARTICLES_LIST_CHECK_BY_HUMAN
  url = url + '/' + encodeURIComponent(title)
  let requestParams = {...data}
  delete requestParams.title
  return Request({
    url,
    method: 'post',
    params: requestParams
  })
}

export function checkByHuman(id, status, reason) {
  let safeReason = reason === undefined || reason === null ? '' : String(reason).trim()
  if (!safeReason) {
    safeReason = 'null'
  }
  let url = API_ARTICLES_CHECK_BY_HUMAN + '/' + encodeURIComponent(id) + '/' + encodeURIComponent(status) + '/' + encodeURIComponent(safeReason)
  return Request({
    url,
    method: 'post'
  })
}

//获取热点文章
export function getHotArticles() {
  return Request({
    url: API_HOT_ARTICLES,
    method: 'get'
  })
}
