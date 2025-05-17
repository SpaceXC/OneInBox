<script setup lang="ts">
import AV from 'leancloud-storage/live-query'
import { ref, onMounted } from 'vue'
import { type Email } from 'postal-mime'
import { useEmailStore } from '../../stores/emailStore'
import EmailItem from './components/EmailItem.vue';
import EmailDetailView from '../detail/EmailDetailView.vue';
import { labelDate } from '../../utils/LableDate';

const store = useEmailStore()

const currentEmail = ref<Email | undefined>(undefined)

onMounted(() => {
  if (!store.isLoaded) {
    store.refreshEmails()
  }
})

const query = new AV.Query("Emails");
query.subscribe().then((liveQuery) => {
  liveQuery.on("create", async (_) => {
    store.refreshEmails()
  });
  liveQuery.on("delete", (_) => {
    store.refreshEmails()
  });
});

function logout() {
  AV.User.logOut().then(() => {
    window.location.reload()
  }).catch((error) => {
    alert(error.message)
  })
}

</script>

<template>
  <div>
    <!-- 移动端显示：currentEmail 有值时仅显示详情 -->
    <div class="block sm:hidden" v-if="currentEmail">
      <div class="w-full h-full overflow-y-auto">
        <EmailDetailView :email="currentEmail" @on-back="currentEmail = undefined" />
      </div>
    </div>

    <!-- 移动端显示：无邮件选中时显示列表 -->
    <div class="block sm:hidden" v-else>
      <div class="w-full h-full box-border flex flex-col">
        <!-- 头部 -->
        <div class="mt-8 ms-5 mb-3">
          <p class="text-2xl font-450 m-0">收件箱</p>
          <p class="m-0 text-#787878 font-330 mt-1 mb-0">{{store.emails.flatMap((group) => group.emails).length}}封未读邮件
          </p>
        </div>
        <!-- 加载条 -->
        <div class="flex items-center mx4 px2 py2 bg-#DAE6FF rounded-2xl" v-if="store.isLoading">
          <md-circular-progress indeterminate
            style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
            class="size-2rem m2 me-3"></md-circular-progress>
          <p class="font-305 text-1rem text-#064BDD">正在同步你的邮箱</p>
        </div>
        <!-- 列表 -->
        <div class="flex overflow-y-auto overflow-x-hidden mt-0">
          <TransitionGroup tag="ul" class="list-none p0 m0 list-none pe-3 max-w-full">
            <li v-for="group in store.emails" :key="group.date">
              <p class="m0 my-2 mx-5 font-380 text-#787878">{{ labelDate(group.date) }}</p>
            <li v-for="([id, email], index) in group.emails" :key="id" class="mb-2 list-item" :style="`--delay: ${index * 0.1}s`" @click="currentEmail = email">
              <EmailItem :email="email" :selected="currentEmail == email" />
            </li>
            <div class="border-t border-t-solid border-t-#E9E9E9 m-3"></div>
            </li>
            <div class="h-2"></div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- 桌面端完整布局 -->
    <div class="hidden sm:flex h-screen">
      <div class="w-20% h-full p-4 pe-0 box-border">
        <div class="bg-#F2F2F2 rounded-2xl w-full h-full">
          <div class="flex items-center p4">
            <img src="/src/assets/avatar.jpeg" class="w-2.5rem aspect-ratio-1 rounded-xl">
            <div class="flex-grow"></div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ACACAC"
              class="size-1.5rem" @click="logout">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
          </div>


          <div class="h-4rem"></div>

          <div class="">
            <div class="flex items-center px-4 my-2 bg-white mx-3 shadow-#D2D2D2 shadow-md rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
              </svg>

              <div class="w-0.5rem"></div>

              <p class="font-330">收件箱</p>

              <div class="flex-1"></div>


              <p class="font-330 text-#787878">196</p>
            </div>

            <div class="flex items-center px-7">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="#787878" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>


              <div class="w-0.5rem"></div>

              <p class="font-330 text-#787878">星标邮件</p>

              <div class="flex-1"></div>


              <p class="font-330 text-#787878">34</p>
            </div>

            <div class="flex items-center px-7">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.375 9.375L14.0625 12.5L18.75 9.375" stroke="#787878" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M3.125 14.0625H5.20833" stroke="#787878" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M1.04163 10.9375H5.20829" stroke="#787878" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M5.20837 7.81242V7.29159C5.20837 6.14099 6.14111 5.20825 7.29171 5.20825H20.8334C21.984 5.20825 22.9167 6.14099 22.9167 7.29159V17.7083C22.9167 18.8589 21.984 19.7916 20.8334 19.7916H7.29171C6.14111 19.7916 5.20837 18.8589 5.20837 17.7083V17.1874"
                  stroke="#787878" stroke-width="1.5" stroke-linecap="round" />
              </svg>


              <div class="w-0.5rem"></div>

              <p class="font-330 text-#787878">已发送</p>
            </div>
          </div>

        </div>
      </div>

      <div class="w-30% h-full box-border flex flex-col">
        <div class="mt-8 ms-5 mb-3">
          <p class="text-2xl font-450 m-0">收件箱</p>
          <p class="m-0 text-#787878 font-330 mt-1 mb-0">{{store.emails.flatMap((group) => group.emails).length}}封未读邮件
          </p>
        </div>
        <div class="flex items-center mx4 px2 py2 bg-#DAE6FF rounded-2xl" v-if="store.isLoading">
          <md-circular-progress indeterminate
            style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
            class="size-2rem m2 me-3"></md-circular-progress>
          <p class="font-305 text-1rem text-#064BDD">正在同步你的邮箱</p>
        </div>
        <div class="flex overflow-y-auto overflow-x-hidden mt-0">
          <ul class="list-none p0 m0 list-none pe-3 max-w-full">
            <li v-for="group in store.emails" :key="group.date">
              <p class="m0 my-2 mx-5 font-380 text-#787878">{{ labelDate(group.date) }}</p>
            <li v-for="[id, email] in group.emails" :key="id" class="mb-2" @click="currentEmail = email">
              <EmailItem :email="email" :selected="currentEmail == email" />
            </li>
            <div class="border-t border-t-solid border-t-#E9E9E9 m-3"></div>
            </li>
            <div class="h-2"></div>
          </ul>
        </div>
      </div>

      <div class="w-47% h-full overflow-y-auto">
        <EmailDetailView :email="currentEmail" @onBack="currentEmail = undefined"
          class="border-l border-l-solid border-l-#CDCDCD"></EmailDetailView>
      </div>
    </div>
  </div>
</template>