<template>
  <div class="dashboard-page">
    <section class="hero-card" v-loading="adminLoading">
      <div class="hero-main">
        <div class="hero-user">
          <div class="hero-avatar">
            <img :src="headImg" alt="admin-avatar">
          </div>
          <div class="hero-copy">
            <div class="hero-kicker">Admin Workspace</div>
            <h1>{{ displayName }}</h1>
            <p>{{ welcomeText }}</p>
            <div class="hero-meta">
              <span class="hero-chip">{{ maskedPhone || '未绑定手机号' }}</span>
              <span class="hero-chip">{{ admin.email || '暂无邮箱' }}</span>
              <span v-if="admin.createdTime" class="hero-chip">加入于 {{ formatDateTime(admin.createdTime) }}</span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <el-button size="small" type="primary" @click="goTo('/content/index')">内容总览</el-button>
          <el-button size="small" plain @click="goTo('/content/auth_media')">人工审核</el-button>
          <el-button size="small" plain @click="goTo('/auth/index')">实名认证</el-button>
          <el-button size="small" plain @click="goTo('/users/index')">用户管理</el-button>
          <el-button size="small" plain @click="refreshDashboard">刷新概览</el-button>
        </div>
      </div>

      <div class="hero-stats">
        <div v-for="item in heroStats" :key="item.key" class="hero-stat-card">
          <div class="hero-stat-label">{{ item.label }}</div>
          <div class="hero-stat-value">{{ item.value }}</div>
          <div class="hero-stat-note">{{ item.note }}</div>
        </div>
      </div>
    </section>

    <el-row :gutter="16" class="dashboard-grid">
      <el-col :span="16">
        <section class="panel trend-panel" v-loading="contentLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">内容表现</div>
              <div class="panel-subtitle">基于当前内容样本，展示阅读、点赞、评论和收藏对比</div>
            </div>
            <div class="panel-tools">
              <el-input-number
                v-model="sampleSize"
                size="mini"
                :min="1"
                :max="50"
                :step="1"
                controls-position="right"
                @keyup.enter.native="loadArticleData"
              />
              <el-button size="mini" plain @click="loadArticleData">刷新内容样本</el-button>
            </div>
          </div>

          <div class="metric-grid">
            <div v-for="item in contentMetrics" :key="item.key" class="metric-card">
              <div class="metric-label">{{ item.label }}</div>
              <div class="metric-value">{{ item.value }}</div>
              <div class="metric-note">{{ item.note }}</div>
            </div>
          </div>

          <line-chart ref="contentTrendChart" height="360px" />
        </section>
      </el-col>

      <el-col :span="8">
        <section class="panel tasks-panel" v-loading="taskLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">待处理事项</div>
              <div class="panel-subtitle"></div>
            </div>
          </div>

          <div class="task-summary-grid">
            <div class="task-summary-card">
              <div class="task-summary-label">待实名认证</div>
              <div class="task-summary-value">{{ formatMetric(pendingAuthTotal) }}</div>
              <el-button type="text" @click="goTo('/auth/index')">去处理</el-button>
            </div>
            <div class="task-summary-card">
              <div class="task-summary-label">待人工审核</div>
              <div class="task-summary-value">{{ formatMetric(pendingMediaTotal) }}</div>
              <el-button type="text" @click="goTo('/content/auth_media')">去处理</el-button>
            </div>
          </div>

          <div class="task-section">
            <div class="task-section-head">
              <span>实名认证待审</span>
              <el-tag size="mini">{{ formatMetric(pendingAuthTotal) }}</el-tag>
            </div>
            <div v-if="pendingAuthList.length" class="task-list">
              <div v-for="item in pendingAuthList" :key="item.id || item.idno" class="task-item">
                <div class="task-title">{{ item.name || '未命名申请' }}</div>
                <div class="task-meta">
                  <span>{{ maskIdNo(item.idno) }}</span>
                  <span>{{ formatDateTime(item.submitedTime) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="task-empty">当前没有待实名认证记录。</div>
          </div>

          <div class="task-section">
            <div class="task-section-head">
              <span>人工审核待办</span>
              <el-tag size="mini" type="warning">{{ formatMetric(pendingMediaTotal) }}</el-tag>
            </div>
            <div v-if="pendingMediaList.length" class="task-list">
              <div v-for="item in pendingMediaList" :key="item.id || item.title" class="task-item">
                <div class="task-title">{{ item.title || '未命名内容' }}</div>
                <div class="task-meta">
                  <span>{{ item.authName || '未知作者' }}</span>
                  <span>{{ formatDateTime(item.submitTime || item.submitedTime || item.createTime) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="task-empty">当前没有待人工审核内容。</div>
          </div>
        </section>

        <section class="panel interaction-panel" v-loading="contentLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">互动健康度</div>
              <div class="panel-subtitle">同样只基于当前内容样本，按阅读量估算互动与负反馈比例</div>
            </div>
          </div>

          <div class="interaction-overview">
            <div class="interaction-total">
              <div class="interaction-total-label">总阅读量</div>
              <div class="interaction-total-value">{{ formatMetric(contentSummary.read_count) }}</div>
            </div>
            <div class="interaction-total alt">
              <div class="interaction-total-label">总互动量</div>
              <div class="interaction-total-value">{{ formatMetric(totalInteractions) }}</div>
            </div>
          </div>

          <div class="progress-list">
            <div v-for="item in interactionBreakdown" :key="item.key" class="progress-item">
              <div class="progress-head">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
              <el-progress
                :percentage="item.percent"
                :stroke-width="10"
                :color="item.color"
              />
            </div>
          </div>
        </section>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from '@/views/fans/components/index/LineChart.vue'
import { getAdminInfo } from '@/api/user'
import { searchArticleVo, listCheckByHuman } from '@/api/content'
import { findAuthList } from '@/api/auth'
import { getUser, setUser } from '@/utils/store'
import DateUtil from '@/utils/date'

const DEFAULT_AVATAR = require('@/assets/avatar.jpg')

export default {
  name: 'AdminDashboard',
  components: {
    LineChart
  },
  data() {
    return {
      adminLoading: false,
      taskLoading: false,
      contentLoading: false,
      admin: {},
      sampleSize: 10,
      articleSample: [],
      articleTotal: 0,
      pendingAuthList: [],
      pendingAuthTotal: 0,
      pendingMediaList: [],
      pendingMediaTotal: 0,
      contentSummary: {
        article: 0,
        read_count: 0,
        likes: 0,
        comment: 0,
        collection: 0,
        follow: 0,
        unlikes: 0
      }
    }
  },
  computed: {
    displayName() {
      return this.admin.name || this.admin.nickname || '校园头条管理员'
    },
    headImg() {
      return this.admin.image || DEFAULT_AVATAR
    },
    maskedPhone() {
      return this.maskPhone(this.admin.phone)
    },
    welcomeText() {
      return `当前后台共有 ${this.formatMetric(this.articleTotal)} 条内容记录，等待你处理 ${this.formatMetric(this.pendingAuthTotal + this.pendingMediaTotal)} 项审核任务。`
    },
    heroStats() {
      return [
        {
          key: 'articleTotal',
          label: '内容总量',
          value: this.formatMetric(this.articleTotal),
          note: '来自内容列表接口'
        },
        {
          key: 'auth',
          label: '待实名认证',
          value: this.formatMetric(this.pendingAuthTotal),
          note: '实名审核待处理记录'
        },
        {
          key: 'media',
          label: '待人工审核',
          value: this.formatMetric(this.pendingMediaTotal),
          note: '人工复审待处理记录'
        },
        {
          key: 'reads',
          label: '样本阅读',
          value: this.formatMetric(this.contentSummary.read_count),
          note: '来自当前内容样本'
        }
      ]
    },
    contentMetrics() {
      return [
        { key: 'article', label: '样本内容数', value: this.formatMetric(this.contentSummary.article), note: '当前首页拉取的内容条数' },
        { key: 'read_count', label: '阅读量', value: this.formatMetric(this.contentSummary.read_count), note: '样本整体曝光表现' },
        { key: 'likes', label: '点赞量', value: this.formatMetric(this.contentSummary.likes), note: '样本正向反馈' },
        { key: 'comment', label: '评论量', value: this.formatMetric(this.contentSummary.comment), note: '样本评论互动' },
        { key: 'collection', label: '收藏量', value: this.formatMetric(this.contentSummary.collection), note: '样本留存意向' },
        { key: 'follow', label: '转发量', value: this.formatMetric(this.contentSummary.follow), note: '样本扩散效果' }
      ]
    },
    totalInteractions() {
      return this.safeNumber(this.contentSummary.likes) +
        this.safeNumber(this.contentSummary.comment) +
        this.safeNumber(this.contentSummary.collection) +
        this.safeNumber(this.contentSummary.follow)
    },
    interactionBreakdown() {
      const readCount = this.safeNumber(this.contentSummary.read_count)
      return [
        {
          key: 'likes',
          label: '点赞占阅读比',
          value: this.formatMetric(this.contentSummary.likes),
          percent: this.calcPercent(this.contentSummary.likes, readCount),
          color: '#3b82f6'
        },
        {
          key: 'comment',
          label: '评论占阅读比',
          value: this.formatMetric(this.contentSummary.comment),
          percent: this.calcPercent(this.contentSummary.comment, readCount),
          color: '#14b8a6'
        },
        {
          key: 'collection',
          label: '收藏占阅读比',
          value: this.formatMetric(this.contentSummary.collection),
          percent: this.calcPercent(this.contentSummary.collection, readCount),
          color: '#8b5cf6'
        },
        {
          key: 'follow',
          label: '转发占阅读比',
          value: this.formatMetric(this.contentSummary.follow),
          percent: this.calcPercent(this.contentSummary.follow, readCount),
          color: '#f59e0b'
        },
        {
          key: 'unlikes',
          label: '负反馈占阅读比',
          value: this.formatMetric(this.contentSummary.unlikes),
          percent: this.calcPercent(this.contentSummary.unlikes, readCount),
          color: '#ef4444'
        }
      ]
    }
  },
  mounted() {
    this.loadDashboard()
  },
  methods: {
    goTo(path) {
      this.$router.push({ path: path })
    },
    refreshDashboard() {
      this.loadDashboard()
    },
    loadDashboard() {
      return Promise.all([
        this.loadAdminInfo(),
        this.loadTaskData(),
        this.loadArticleData()
      ])
    },
    loadAdminInfo() {
      this.adminLoading = true
      const currentUser = getUser() || {}
      const userId = currentUser.id || currentUser.userId || currentUser.uid
      this.admin = currentUser

      if (!userId) {
        this.adminLoading = false
        return Promise.resolve()
      }

      return this.withTimeout(getAdminInfo(userId), null).then((res) => {
        if (res && res.code === 200 && res.data) {
          const mergedUser = Object.assign({}, currentUser, res.data)
          if (currentUser.token) {
            mergedUser.token = currentUser.token
          }
          this.admin = mergedUser
          setUser(mergedUser)
        }
        this.adminLoading = false
      }, () => {
        this.adminLoading = false
      })
    },
    loadTaskData() {
      this.taskLoading = true
      return Promise.all([
        this.withTimeout(findAuthList({ status: 1, page: 1, size: 4 }), null),
        this.withTimeout(listCheckByHuman({ page: 1, size: 4, title: 'all' }), null)
      ]).then((results) => {
        const authRes = results[0]
        const mediaRes = results[1]

        if (authRes && authRes.code === 200) {
          this.pendingAuthList = Array.isArray(authRes.data) ? authRes.data : []
          this.pendingAuthTotal = this.safeNumber(authRes.total) || this.pendingAuthList.length
        } else {
          this.pendingAuthList = []
          this.pendingAuthTotal = 0
        }

        if (mediaRes && mediaRes.code === 200) {
          const mediaList = Array.isArray(mediaRes.data)
            ? mediaRes.data
            : (mediaRes.data && Array.isArray(mediaRes.data.data) ? mediaRes.data.data : [])
          this.pendingMediaList = mediaList
          this.pendingMediaTotal = this.safeNumber(mediaRes.total) || (mediaRes.data && this.safeNumber(mediaRes.data.total)) || mediaList.length
        } else {
          this.pendingMediaList = []
          this.pendingMediaTotal = 0
        }

        this.taskLoading = false
      }, () => {
        this.pendingAuthList = []
        this.pendingAuthTotal = 0
        this.pendingMediaList = []
        this.pendingMediaTotal = 0
        this.taskLoading = false
      })
    },
    loadArticleData() {
      this.contentLoading = true
      const size = this.normalizeSampleSize()
      return this.withTimeout(searchArticleVo({ page: 1, size: size }), null).then((res) => {
        if (res && res.code === 200) {
          this.articleSample = Array.isArray(res.data) ? res.data : []
          this.articleTotal = this.safeNumber(res.total) || this.articleSample.length
          this.contentSummary = this.summarizeArticleSample(this.articleSample)
          this.renderTrendChart()
        } else {
          this.articleSample = []
          this.articleTotal = 0
          this.contentSummary = this.summarizeArticleSample([])
          this.renderTrendChart()
        }
        this.contentLoading = false
      }, () => {
        this.articleSample = []
        this.articleTotal = 0
        this.contentSummary = this.summarizeArticleSample([])
        this.renderTrendChart()
        this.contentLoading = false
      })
    },
    normalizeSampleSize() {
      const size = parseInt(this.sampleSize, 10)
      if (isNaN(size) || size < 1) {
        this.sampleSize = 10
        return 10
      }
      if (size > 50) {
        this.sampleSize = 50
        return 50
      }
      this.sampleSize = size
      return size
    },
    summarizeArticleSample(list) {
      return list.reduce((summary, item) => {
        summary.article += 1
        summary.read_count += this.safeNumber(item.readCount)
        summary.likes += this.safeNumber(item.goodCount)
        summary.comment += this.safeNumber(item.commentCount)
        summary.collection += this.safeNumber(item.collectCount)
        summary.follow += this.safeNumber(item.forwardCount || item.follow)
        summary.unlikes += this.safeNumber(item.unlikes)
        return summary
      }, {
        article: 0,
        read_count: 0,
        likes: 0,
        comment: 0,
        collection: 0,
        follow: 0,
        unlikes: 0
      })
    },
    renderTrendChart() {
      const seriesInfo = [
        { key: 'readCount', name: '阅读量', type: 'bar', color: '#3b82f6' },
        { key: 'goodCount', name: '点赞量', type: 'line', color: '#14b8a6' },
        { key: 'commentCount', name: '评论量', type: 'line', color: '#f59e0b' },
        { key: 'collectCount', name: '收藏量', type: 'line', color: '#8b5cf6' }
      ]
      const labels = this.articleSample.map((item, index) => {
        const title = item.title || `内容${index + 1}`
        return title.length > 8 ? `${title.slice(0, 8)}...` : title
      })

      this.$nextTick(() => {
        if (!this.$refs.contentTrendChart) {
          return
        }
        this.$refs.contentTrendChart.setOptions({
          color: seriesInfo.map((item) => item.color),
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: seriesInfo.map((item) => item.name),
            top: 10
          },
          grid: {
            left: 24,
            right: 24,
            top: 56,
            bottom: 20,
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            data: labels,
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#d7deea' } },
            axisLabel: {
              interval: 0,
              rotate: 20
            }
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#edf2f7' } }
          },
          series: seriesInfo.map((series) => {
            return {
              name: series.name,
              type: series.type,
              smooth: series.type === 'line',
              barMaxWidth: 28,
              symbolSize: 6,
              areaStyle: series.type === 'line' ? { opacity: 0.08 } : null,
              data: this.articleSample.map((item) => this.safeNumber(item[series.key]))
            }
          })
        })
      })
    },
    withTimeout(promise, fallback, wait) {
      const timeout = wait || 4000
      return new Promise((resolve) => {
        let settled = false
        const timer = setTimeout(() => {
          if (settled) {
            return
          }
          settled = true
          resolve(fallback)
        }, timeout)

        Promise.resolve(promise).then((result) => {
          if (settled) {
            return
          }
          settled = true
          clearTimeout(timer)
          resolve(result)
        }, () => {
          if (settled) {
            return
          }
          settled = true
          clearTimeout(timer)
          resolve(fallback)
        })
      })
    },
    safeNumber(value) {
      const number = Number(value)
      return isNaN(number) ? 0 : number
    },
    formatMetric(value) {
      const number = this.safeNumber(value)
      if (number >= 10000) {
        const formatted = (number / 10000).toFixed(number >= 100000 ? 0 : 1)
        return `${formatted}万`
      }
      return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    formatDateTime(time) {
      if (!time) {
        return '--'
      }
      return DateUtil.format13HH(this.safeNumber(time))
    },
    maskPhone(phone) {
      if (!phone) {
        return ''
      }
      const text = String(phone)
      const matched = text.match(/^(\d{3})\d+(\d{4})$/)
      if (matched) {
        return `${matched[1]}****${matched[2]}`
      }
      return text
    },
    maskIdNo(idno) {
      if (!idno) {
        return '未填写身份证号'
      }
      const text = String(idno)
      if (text.length <= 8) {
        return text
      }
      return `${text.slice(0, 4)}********${text.slice(-4)}`
    },
    calcPercent(value, total) {
      const denominator = this.safeNumber(total)
      if (!denominator) {
        return 0
      }
      const percent = Math.round((this.safeNumber(value) / denominator) * 100)
      return percent > 100 ? 100 : percent
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-page {
  min-height: calc(100vh - 70px);
  background: linear-gradient(180deg, #eef4ff 0%, #f7f9fc 190px, #f3f5f8 100%);
}

.hero-card,
.panel {
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(31, 41, 55, 0.06);
}

.hero-card {
  padding: 24px 26px;
  margin-bottom: 16px;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.18), transparent 26%),
    radial-gradient(circle at left center, rgba(14, 165, 233, 0.08), transparent 24%),
    #ffffff;
}

.hero-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-user {
  display: flex;
  align-items: center;
  min-width: 0;
}

.hero-avatar {
  width: 84px;
  height: 84px;
  border-radius: 26px;
  padding: 4px;
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);

  img {
    width: 100%;
    height: 100%;
    border-radius: 22px;
    object-fit: cover;
    background: #ffffff;
  }
}

.hero-copy {
  margin-left: 18px;
  min-width: 0;
}

.hero-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #4d77c9;
  margin-bottom: 6px;
}

.hero-copy h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  color: #172033;
}

.hero-copy p {
  margin: 10px 0 0;
  color: #52607a;
  line-height: 1.7;
  max-width: 700px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f3f7ff;
  color: #355186;
  font-size: 12px;
  border: 1px solid #deebff;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.hero-stat-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fbfdff, #f4f7fb);
  border: 1px solid #eef3f8;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #2563eb, #0ea5e9);
  }
}

.hero-stat-label {
  color: #6b7a92;
  font-size: 13px;
}

.hero-stat-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #172033;
}

.hero-stat-note {
  margin-top: 8px;
  font-size: 12px;
  color: #8b98ad;
}

.panel {
  padding: 20px 0 16px;
}

.panel + .panel {
  margin-top: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 22px;
  margin-bottom: 18px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #1b263b;
}

.panel-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #7b8798;
}

.panel-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.panel-tools .el-input-number {
  width: 108px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 0 22px 8px;
}

.metric-card {
  padding: 16px;
  border-radius: 14px;
  background: #f7f9fc;
  border: 1px solid #edf2f7;
}

.metric-label {
  color: #748197;
  font-size: 12px;
}

.metric-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2a44;
}

.metric-note {
  margin-top: 8px;
  font-size: 12px;
  color: #98a4b5;
}

.task-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 22px;
}

.task-summary-card {
  padding: 16px;
  border-radius: 14px;
  background: #f7f9fc;
  border: 1px solid #edf2f7;
}

.task-summary-label {
  font-size: 12px;
  color: #748197;
}

.task-summary-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2a44;
}

.task-section {
  padding: 18px 22px 0;
}

.task-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #1f2a44;
}

.task-list {
  border-top: 1px solid #eef2f7;
}

.task-item {
  padding: 12px 0;
  border-bottom: 1px solid #eef2f7;
}

.task-title {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 6px;
  font-size: 12px;
  color: #8b98ad;
}

.task-empty {
  padding: 14px 0 4px;
  color: #8b98ad;
  font-size: 13px;
}

.interaction-overview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 22px;
}

.interaction-total {
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #f8fbff);
  border: 1px solid #dbeafe;
}

.interaction-total.alt {
  background: linear-gradient(135deg, #f0fdf4, #f8fffb);
  border-color: #dcfce7;
}

.interaction-total-label {
  font-size: 12px;
  color: #748197;
}

.interaction-total-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2a44;
}

.progress-list {
  padding: 18px 22px 0;
}

.progress-item + .progress-item {
  margin-top: 16px;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #5b677b;
}
</style>
