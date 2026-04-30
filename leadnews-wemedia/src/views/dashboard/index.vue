<template>
  <div class="dashboard-page">
    <section class="hero-card">
      <div class="hero-top">
        <div class="hero-profile">
          <div class="avatar-shell">
            <img :src="headImg" alt="avatar">
          </div>
          <div class="hero-copy">
            <div class="hero-kicker">Welcome Back</div>
            <h1>{{ displayName }}</h1>
            <p>{{ welcomeText }}</p>
            <div class="hero-tags">
              <span class="hero-tag">{{ accountTypeText }}</span>
              <span class="hero-tag">{{ accountStatusText }}</span>
              <span v-if="user.location" class="hero-tag">{{ user.location }}</span>
              <span v-if="user.score !== undefined && user.score !== null" class="hero-tag">
                运营评分 {{ formatMetric(user.score) }}
              </span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <el-button size="small" type="primary" @click="goTo('/article/publish')">发布文章</el-button>
          <el-button size="small" plain @click="goTo('/article/list')">内容管理</el-button>
          <el-button size="small" plain @click="goTo('/fans/index')">粉丝分析</el-button>
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
        <section class="panel trend-panel" v-loading="trendLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">内容趋势</div>
              <div class="panel-subtitle">基于现有图文统计接口汇总最近一段时间的发文与互动表现</div>
            </div>
            <div class="panel-tools">
              <el-radio-group v-model="params.type" size="mini" @change="handleRangeChange">
                <el-radio-button label="0">今日</el-radio-button>
                <el-radio-button label="1">本周</el-radio-button>
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="metric-strip">
            <div v-for="item in contentMetrics" :key="item.key" class="metric-card">
              <div class="metric-label">{{ item.label }}</div>
              <div class="metric-value">{{ item.value }}</div>
              <div class="metric-note">{{ item.note }}</div>
            </div>
          </div>

          <line-chart class="trend-chart" ref="contentTrendChart" height="420px" />
        </section>

        <section class="panel recent-panel" v-loading="articleLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">最近内容</div>
              <div class="panel-subtitle">直接复用内容列表接口，方便从首页继续处理稿件</div>
            </div>
            <el-button type="text" @click="goTo('/article/list')">查看全部</el-button>
          </div>

          <div v-if="recentArticles.length" class="article-list">
            <article v-for="item in recentArticles" :key="item.id || item.title" class="article-card">
              <div :class="['article-cover-group', `cover-count-${getArticleCovers(item).length}`]">
                <div
                  v-for="(image, index) in getArticleCovers(item)"
                  :key="`${item.id || item.title || 'article'}-${index}`"
                  class="article-cover"
                >
                  <img :src="image" alt="cover" @error="handleArticleCoverError">
                </div>
              </div>
              <div class="article-body">
                <div class="article-title-row">
                  <h3 class="article-title" @click="editArticle(item)">{{ item.title || '未命名内容' }}</h3>
                  <div class="article-tags">
                    <el-tag size="mini" :type="statusTagType(item.status)">{{ articleStatusText(item) }}</el-tag>
                    <el-tag
                      v-if="String(item.status) === '9'"
                      size="mini"
                      :type="String(item.enable) === '1' ? 'success' : 'info'"
                    >
                      {{ String(item.enable) === '1' ? '已上架' : '已下架' }}
                    </el-tag>
                  </div>
                </div>

                <div class="article-meta">
                  <span>创建于 {{ formatDateTime(item.createdTime) }}</span>
                  <span v-if="item.publishTime">发布于 {{ formatDateTime(item.publishTime) }}</span>
                  <span v-if="item.id">ID {{ item.id }}</span>
                </div>

                <div class="article-desc">
                  <span v-if="String(item.status) === '2' && item.reason">审核原因：{{ item.reason }}</span>
                  <span v-else>{{ articleStatusHint(item) }}</span>
                </div>

                <div class="article-actions">
                  <el-button type="text" size="mini" @click="editArticle(item)">继续编辑</el-button>
                  <el-button type="text" size="mini" @click="goTo('/article/list')">前往列表</el-button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-block">
            <div class="empty-title">暂无内容</div>
            <div class="empty-text">当前接口没有返回文章列表，你可以直接从这里去发布第一篇内容。</div>
            <el-button size="small" type="primary" @click="goTo('/article/publish')">去发布</el-button>
          </div>
        </section>
      </el-col>

      <el-col :span="8">
        <section class="panel audience-panel" v-loading="audienceLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">粉丝画像</div>
              <div class="panel-subtitle">来自现有粉丝列表接口的性别与认证分布</div>
            </div>
          </div>

          <div class="audience-summary">
            <div class="audience-count">
              <div class="audience-count-label">粉丝总量</div>
              <div class="audience-count-value">{{ formatMetric(audience.total) }}</div>
            </div>
            <div class="audience-pill-list">
              <span class="audience-pill">男性 {{ formatMetric(audience.male) }}</span>
              <span class="audience-pill">女性 {{ formatMetric(audience.female) }}</span>
              <span class="audience-pill">已认证 {{ formatMetric(audience.auth) }}</span>
              <span class="audience-pill">未认证 {{ formatMetric(audience.unauth) }}</span>
            </div>
          </div>

          <div class="progress-list">
            <div class="progress-item">
              <div class="progress-label">
                <span>男性粉丝占比</span>
                <strong>{{ genderPercent }}%</strong>
              </div>
              <el-progress :percentage="genderPercent" :stroke-width="10" color="#3b82f6" />
            </div>
            <div class="progress-item">
              <div class="progress-label">
                <span>已认证粉丝占比</span>
                <strong>{{ authPercent }}%</strong>
              </div>
              <el-progress :percentage="authPercent" :stroke-width="10" color="#22c55e" />
            </div>
          </div>

          <doughnut-chart :data="audienceChartData" height="280px" />
        </section>

        <section class="panel interaction-panel" v-loading="trendLoading">
          <div class="panel-header">
            <div>
              <div class="panel-title">互动构成</div>
              <div class="panel-subtitle">直接基于图文统计接口汇总点赞、评论、收藏与转发表现</div>
            </div>
          </div>

          <div class="interaction-kpis">
            <div v-for="item in interactionMetrics" :key="item.key" class="interaction-kpi">
              <div class="interaction-kpi-label">{{ item.label }}</div>
              <div class="interaction-kpi-value">{{ item.value }}</div>
            </div>
          </div>

          <doughnut-chart :data="interactionChartData" height="260px" />
        </section>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from '@/views/content/components/LineChart.vue'
import DoughnutChart from '@/views/content/components/DoughnutChart.vue'
import { searchArticle, getNewsStatistics } from '@/api/content'
import { getFollowers } from '@/api/fans'
import { getUserInform } from '@/api/user'
import { getUser, setUser } from '@/utils/store'
import DateUtil from '@/utils/date'

const DEFAULT_AVATAR = require('@/assets/avatar.jpg')

export default {
  name: 'WemediaDashboard',
  components: {
    LineChart,
    DoughnutChart
  },
  data() {
    return {
      trendLoading: false,
      articleLoading: false,
      audienceLoading: false,
      params: {
        type: '7',
        stime: '',
        etime: ''
      },
      user: {},
      contentStats: [],
      recentArticles: [],
      articleHost: '',
      audience: {
        total: 0,
        male: 0,
        female: 0,
        auth: 0,
        unauth: 0
      },
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
      return this.user.name || this.user.nickname || '校园头条自媒体号'
    },
    headImg() {
      return this.user.image || this.user.photo || DEFAULT_AVATAR
    },
    accountTypeText() {
      const map = {
        0: '个人账号',
        1: '企业账号',
        2: '子账号'
      }
      return map[this.user.type] || '个人账号'
    },
    accountStatusText() {
      const map = {
        0: '暂时不可用',
        1: '永久不可用',
        9: '正常可用'
      }
      return map[this.user.status] || '状态未知'
    },
    welcomeText() {
      const articles = this.formatMetric(this.contentSummary.article)
      const reads = this.formatMetric(this.contentSummary.read_count)
      return `过去 ${this.rangeLabel} 内共发布 ${articles} 篇内容，累计获得 ${reads} 次阅读。`
    },
    rangeLabel() {
      const map = {
        0: '今日',
        1: '本周',
        7: '近7天',
        30: '近30天'
      }
      return map[this.params.type] || '当前周期'
    },
    heroStats() {
      return [
        {
          key: 'articles',
          label: '内容产出',
          value: this.formatMetric(this.contentSummary.article),
          note: `${this.rangeLabel} 发布文章数`
        },
        {
          key: 'reads',
          label: '累计阅读',
          value: this.formatMetric(this.contentSummary.read_count),
          note: `${this.rangeLabel} 读取自图文统计`
        },
        {
          key: 'fans',
          label: '粉丝规模',
          value: this.formatMetric(this.audience.total),
          note: '粉丝列表接口汇总'
        },
        {
          key: 'interactions',
          label: '互动总量',
          value: this.formatMetric(this.contentSummary.likes + this.contentSummary.comment + this.contentSummary.collection),
          note: '点赞 + 评论 + 收藏'
        }
      ]
    },
    contentMetrics() {
      return [
        { key: 'article', label: '发文量', value: this.formatMetric(this.contentSummary.article), note: `${this.rangeLabel} 内容发布` },
        { key: 'read_count', label: '阅读量', value: this.formatMetric(this.contentSummary.read_count), note: '内容曝光表现' },
        { key: 'likes', label: '点赞量', value: this.formatMetric(this.contentSummary.likes), note: '正向互动反馈' },
        { key: 'comment', label: '评论量', value: this.formatMetric(this.contentSummary.comment), note: '讨论活跃程度' },
        { key: 'collection', label: '收藏量', value: this.formatMetric(this.contentSummary.collection), note: '用户留存意向' },
        { key: 'follow', label: '转发量', value: this.formatMetric(this.contentSummary.follow), note: '扩散分享效果' }
      ]
    },
    interactionMetrics() {
      return [
        { key: 'likes', label: '点赞互动', value: this.formatMetric(this.contentSummary.likes) },
        { key: 'comment', label: '评论互动', value: this.formatMetric(this.contentSummary.comment) },
        { key: 'collection', label: '收藏互动', value: this.formatMetric(this.contentSummary.collection) },
        { key: 'follow', label: '转发互动', value: this.formatMetric(this.contentSummary.follow) }
      ]
    },
    interactionChartData() {
      return {
        title: '互动占比',
        legend: ['点赞', '评论', '收藏', '转发', '不喜欢'],
        data: [
          { name: '点赞', value: this.safeNumber(this.contentSummary.likes) },
          { name: '评论', value: this.safeNumber(this.contentSummary.comment) },
          { name: '收藏', value: this.safeNumber(this.contentSummary.collection) },
          { name: '转发', value: this.safeNumber(this.contentSummary.follow) },
          { name: '不喜欢', value: this.safeNumber(this.contentSummary.unlikes) }
        ]
      }
    },
    genderPercent() {
      const total = this.audience.male + this.audience.female
      if (!total) {
        return 0
      }
      return Math.round((this.audience.male / total) * 100)
    },
    authPercent() {
      const total = this.audience.auth + this.audience.unauth
      if (!total) {
        return 0
      }
      return Math.round((this.audience.auth / total) * 100)
    },
    audienceChartData() {
      return {
        title: '粉丝构成',
        legend: ['男性粉丝', '女性粉丝', '已认证', '未认证'],
        data: [
          { name: '男性粉丝', value: this.safeNumber(this.audience.male) },
          { name: '女性粉丝', value: this.safeNumber(this.audience.female) },
          { name: '已认证', value: this.safeNumber(this.audience.auth) },
          { name: '未认证', value: this.safeNumber(this.audience.unauth) }
        ]
      }
    }
  },
  mounted() {
    this.applyTimeRange(this.params.type)
    this.loadDashboard()
  },
  methods: {
    goTo(path) {
      this.$router.push({ path: path })
    },
    editArticle(item) {
      this.$router.push({ path: '/article/publish', query: { articleId: item.id } })
    },
    refreshDashboard() {
      this.loadDashboard()
    },
    loadDashboard() {
      return Promise.all([
        this.loadBaseData(),
        this.loadTrendData()
      ])
    },
    loadBaseData() {
      const currentUser = getUser() || {}
      const userId = currentUser.id || currentUser.userId || currentUser.uid
      this.user = currentUser

      this.articleLoading = true
      this.audienceLoading = true

      const tasks = [
        userId ? this.withTimeout(getUserInform(userId), null) : Promise.resolve(null),
        this.withTimeout(searchArticle({ page: 1, size: 5 }), null),
        userId ? this.withTimeout(getFollowers(userId, { page: 1, size: 1000 }), null) : Promise.resolve(null)
      ]

      return Promise.all(tasks).then((results) => {
        const userResult = results[0]
        const articleResult = results[1]
        const audienceResult = results[2]

        if (userResult && (userResult.code === 0 || userResult.code === 200 || userResult.code === undefined)) {
          const mergedUser = Object.assign({}, currentUser, userResult.data || userResult)
          this.user = mergedUser
          setUser(mergedUser)
        }

        if (articleResult) {
          this.articleHost = articleResult.host || ''
          this.recentArticles = Array.isArray(articleResult.data) ? articleResult.data : []
        } else {
          this.recentArticles = []
        }

        if (audienceResult && (audienceResult.code === 0 || audienceResult.code === 200 || audienceResult.code === undefined)) {
          this.audience = this.parseAudience(audienceResult)
        } else {
          this.audience = {
            total: 0,
            male: 0,
            female: 0,
            auth: 0,
            unauth: 0
          }
        }
      }).then(() => {
        this.articleLoading = false
        this.audienceLoading = false
      }, () => {
        this.articleLoading = false
        this.audienceLoading = false
      })
    },
    loadTrendData() {
      this.trendLoading = true
      const payload = {
        type: this.params.type,
        stime: this.params.stime,
        etime: this.params.etime
      }

      return this.withTimeout(getNewsStatistics(payload), null).then((result) => {
        this.contentStats = this.normalizeStatistics(result)
        this.contentSummary = this.summarizeMetrics(this.contentStats, ['article', 'read_count', 'likes', 'comment', 'collection', 'follow', 'unlikes'])
        this.renderContentChart()
      }).then(() => {
        this.trendLoading = false
      }, () => {
        this.trendLoading = false
      })
    },
    handleRangeChange(type) {
      this.applyTimeRange(type)
      this.loadTrendData()
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
    applyTimeRange(type) {
      if (type === '1') {
        this.params.stime = DateUtil.getWeekSTime()
        this.params.etime = DateUtil.getWeekETime()
      } else {
        this.params.etime = DateUtil.getNearTime(0)
        this.params.stime = DateUtil.getNearTime(Number(type))
      }
    },
    normalizeStatistics(result) {
      if (!result) {
        return []
      }
      const list = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : [])
      return list.map((item) => {
        return {
          article: this.safeNumber(item.article),
          read_count: this.safeNumber(item.read_count),
          likes: this.safeNumber(item.likes),
          comment: this.safeNumber(item.comment),
          collection: this.safeNumber(item.collection),
          follow: this.safeNumber(item.follow),
          unlikes: this.safeNumber(item.unlikes)
        }
      })
    },
    summarizeMetrics(list, fields) {
      const summary = {}
      fields.forEach((field) => {
        summary[field] = 0
      })
      list.forEach((item) => {
        fields.forEach((field) => {
          summary[field] += this.safeNumber(item[field])
        })
      })
      return summary
    },
    renderContentChart() {
      const metricItems = [
        { key: 'article', name: '发文量', color: '#3b82f6' },
        { key: 'read_count', name: '阅读量', color: '#14b8a6' },
        { key: 'likes', name: '点赞量', color: '#f59e0b' },
        { key: 'comment', name: '评论量', color: '#ef4444' },
        { key: 'collection', name: '收藏量', color: '#8b5cf6' },
        { key: 'follow', name: '转发量', color: '#06b6d4' }
      ]
      const chartData = metricItems.map((item) => {
        return {
          value: this.safeNumber(this.contentSummary[item.key]),
          itemStyle: {
            color: item.color
          }
        }
      })

      this.$nextTick(() => {
        if (!this.$refs.contentTrendChart) {
          return
        }
        this.$refs.contentTrendChart.setOptions({
          color: metricItems.map((item) => item.color),
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            show: false
          },
          grid: {
            left: 24,
            right: 24,
            bottom: 26,
            top: 34,
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            data: metricItems.map((item) => item.name),
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#d7deea' } },
            axisLabel: {
              interval: 0
            }
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#edf2f7' } }
          },
          series: [
            {
              name: '统计量',
              type: 'bar',
              barMaxWidth: 42,
              emphasis: {
                focus: 'series'
              },
              label: {
                show: true,
                position: 'top',
                formatter: (params) => this.formatMetric(params.value)
              },
              data: chartData
            }
          ]
        })
      })
    },
    parseAudience(result) {
      const list = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : [])
      let male = 0
      let female = 0
      let auth = 0
      let unauth = 0

      list.forEach((item) => {
        const sex = item.sex
        if (sex === 0 || sex === '0' || sex === false) {
          male += 1
        } else if (sex === 1 || sex === '1' || sex === true) {
          female += 1
        }

        const identityAuthentication = item.identityAuthentication
        if (identityAuthentication === true || identityAuthentication === 1 || identityAuthentication === '1') {
          auth += 1
        } else {
          unauth += 1
        }
      })

      return {
        total: this.safeNumber(result.total) || list.length,
        male: male,
        female: female,
        auth: auth,
        unauth: unauth
      }
    },
    getArticleCovers(item) {
      const imageList = item && item.images
        ? String(item.images).split(',').map((image) => image.trim()).filter((image) => image)
        : []
      const covers = imageList.slice(0, 3).map((image) => this.normalizeArticleImage(image))
      return covers.length ? covers : [DEFAULT_AVATAR]
    },
    normalizeArticleImage(image) {
      const url = String(image || '').trim()
      if (/^https?:\/\//.test(url)) {
        return url
      }
      if (/^\/\//.test(url)) {
        return `http:${url}`
      }
      if (this.articleHost && url.charAt(0) === '/') {
        return `${this.articleHost}${url}`
      }
      return url || DEFAULT_AVATAR
    },
    handleArticleCoverError(event) {
      event.target.src = DEFAULT_AVATAR
    },
    articleStatusText(item) {
      const statusMap = {
        0: '草稿',
        1: '待审核',
        2: '审核失败',
        3: '待人工审核',
        4: '待发布',
        8: '待发布',
        9: '已发布',
        10: '已封禁',
        100: '已删除'
      }
      return statusMap[this.safeNumber(item.status)] || '未知状态'
    },
    articleStatusHint(item) {
      const status = String(item.status)
      if (status === '9') {
        return String(item.enable) === '1' ? '内容已对外可见，可继续观察数据表现。' : '内容当前处于下架状态，可在内容管理中重新上架。'
      }
      if (status === '0') {
        return '这是一篇尚未提交的草稿，可继续补充内容后发布。'
      }
      if (status === '1' || status === '3') {
        return '内容正在审核流程中，首页会保留最近的处理入口。'
      }
      if (status === '2') {
        return '内容未通过审核，建议根据原因修改后重新提交。'
      }
      return '你可以从这里直接进入内容管理继续处理。'
    },
    statusTagType(status) {
      const currentStatus = this.safeNumber(status)
      if (currentStatus === 9) {
        return 'success'
      }
      if (currentStatus === 0 || currentStatus === 8) {
        return 'warning'
      }
      if (currentStatus === 2 || currentStatus === 10 || currentStatus === 100) {
        return 'danger'
      }
      return ''
    },
    formatDateTime(time) {
      if (!time) {
        return '--'
      }
      return DateUtil.format13HH(this.safeNumber(time))
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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-page {
  background: linear-gradient(180deg, #eef4ff 0%, #f6f8fc 180px, #f3f5f8 100%);
  min-height: calc(100vh - 70px);
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
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 26%),
    radial-gradient(circle at left center, rgba(16, 185, 129, 0.08), transparent 24%),
    #ffffff;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-profile {
  display: flex;
  align-items: center;
  min-width: 0;
}

.avatar-shell {
  width: 84px;
  height: 84px;
  border-radius: 26px;
  padding: 4px;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.22);

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

  .hero-kicker {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5b87d6;
    margin-bottom: 6px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
    color: #172033;
  }

  p {
    margin: 10px 0 0;
    color: #52607a;
    line-height: 1.7;
    max-width: 680px;
  }
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.hero-tag {
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
  padding: 18px 18px 16px;
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
    background: linear-gradient(90deg, #3b82f6, #14b8a6);
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

.dashboard-grid {
  margin-top: 0;
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
  flex-shrink: 0;
}

.metric-strip {
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

.trend-chart {
  display: block;
  min-height: 420px;
}

.article-list {
  padding: 0 22px;
}

.article-card {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #edf2f7;

  &:first-child {
    border-top: none;
    padding-top: 0;
  }
}

.article-cover-group {
  width: 132px;
  height: 92px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
}

.article-cover-group.cover-count-2 {
  width: 270px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.article-cover-group.cover-count-3 {
  width: 408px;
  max-width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.article-cover {
  min-width: 0;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.article-body {
  min-width: 280px;
  flex: 1;
}

.article-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.article-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  cursor: pointer;

  &:hover {
    color: #2563eb;
  }
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
  font-size: 12px;
  color: #8391a7;
}

.article-desc {
  margin-top: 10px;
  line-height: 1.7;
  color: #5c677a;
  font-size: 13px;
}

.article-actions {
  margin-top: 12px;
}

.empty-block {
  padding: 12px 22px 8px;
  text-align: center;
}

.empty-title {
  font-size: 18px;
  color: #1f2a44;
  margin-bottom: 8px;
}

.empty-text {
  color: #7c889c;
  line-height: 1.7;
  margin-bottom: 16px;
}

.audience-summary {
  padding: 0 22px;
}

.audience-count {
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1px solid #dbeafe;
}

.audience-count-label {
  font-size: 13px;
  color: #5f6f8b;
}

.audience-count-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #1e3a5f;
}

.audience-pill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.audience-pill {
  font-size: 12px;
  color: #46566f;
  background: #f8fafc;
  border: 1px solid #e5ebf3;
  border-radius: 999px;
  padding: 6px 12px;
}

.progress-list {
  padding: 18px 22px 0;
}

.progress-item + .progress-item {
  margin-top: 16px;
}

.progress-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #5b677b;
}

.interaction-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 0 22px 10px;
}

.interaction-kpi {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.interaction-kpi-label {
  font-size: 12px;
  color: #748197;
}

.interaction-kpi-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2a44;
}
</style>
