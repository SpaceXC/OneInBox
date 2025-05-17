import { createApp } from 'vue'
import './style.css'
import 'virtual:uno.css'
import App from './App.vue'
import AV from 'leancloud-storage/live-query'
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './pages/home/HomeView.vue'
import EmailDetailView from './pages/detail/EmailDetailView.vue'
import ComposeEmailView from './pages/compose/ComposeEmailView.vue'
import { createPinia } from 'pinia'

const routes = [
  { path: '/', component: HomeView },
  { path: '/email/:id', component: EmailDetailView },
  { path: '/compose', component: ComposeEmailView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia()

AV.init({
  appId: "8KvOk8Iol7VUoQcUplm4O15r-gzGzoHsz",
  appKey: "Dwf5Vm6ewO3wqC8VkajOiI2g",
  serverURL: "https://8kvok8io.lc-cn-n1-shared.com"
})

createApp(App).use(pinia).use(router).mount('#app')
