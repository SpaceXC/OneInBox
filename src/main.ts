import { createApp } from 'vue'
import './style.css'
import 'virtual:uno.css'
import App from './pages/main/App.vue'
import AV from 'leancloud-storage/live-query'
import { createRouter, createWebHistory } from 'vue-router'

import EmailDetailView from './pages/detail/EmailDetailView.vue'
import ComposeEmailView from './pages/compose/ComposeEmailView.vue'
import { createPinia } from 'pinia'
import LoginView from './pages/login/LoginView.vue'
import InboxView from './pages/inbox/InboxView.vue'
import EmptyView from './pages/empty/EmptyView.vue'

const routes = [
  { path: '/', redirect: '/inbox' },
  {
    path: '/inbox', component: InboxView, name: 'inbox', children: [
      { path: '/', component: EmptyView },
      { path: ':id', component: EmailDetailView }
    ]
  },
  { path: '/auth', component: LoginView },
  { path: '/compose', component: ComposeEmailView, name: 'compose' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _) => {
  console.log('beforeEach', AV.User.current())
  if (
    // 检查用户是否已登录
    AV.User.current() === null &&
    // ❗️ 避免无限重定向
    to.path !== '/auth'
  ) {
    // 将用户重定向到登录页面
    return '/auth?redirect=' + encodeURI(to.path)
  }
})

const pinia = createPinia()

AV.init({
  appId: "8KvOk8Iol7VUoQcUplm4O15r-gzGzoHsz",
  appKey: "Dwf5Vm6ewO3wqC8VkajOiI2g",
  serverURL: "https://8kvok8io.lc-cn-n1-shared.com"
})

createApp(App).use(pinia).use(router).mount('#app')
