<script setup lang="ts">
import AV from 'leancloud-storage/live-query'
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { type Email } from 'postal-mime'
import { useEmailStore } from '../../stores/emailStore'
import EmailItem from './components/EmailItem.vue';
import { labelDate } from '../../utils/LableDate';
import EmptyView from '../empty/EmptyView.vue'

const store = useEmailStore()

const router = useRouter()

const currentEmail = ref<Email | undefined>(undefined)

onMounted(() => {
  if (!store.isLoaded) {
    store.refreshEmails()
  }
})

watch(
  () => router.currentRoute.value.path,
  (value) => {
    console.log('Route changed:', value)
    if(value === '/inbox') {
      currentEmail.value = undefined
    }
  }
)

const query = new AV.Query("Emails");
query.subscribe().then((liveQuery) => {
  liveQuery.on("create", async (_) => {
    store.refreshEmails()
  });
  liveQuery.on("delete", (_) => {
    store.refreshEmails()
  });
});

function selectEmail(email: Email, id: string) {
  currentEmail.value = email
  router.push(`/inbox/${id}`)
}

</script>

<template>
  <div>
    <div class="flex h-screen">
      <div class="w-33% h-full box-border flex flex-col">

        <div class="mt-8 ms-5 mb-3">
          <p class="text-2xl font-450 m-0">收件箱</p>
          <p class="m-0 text-#787878 font-330 mt-1 mb-0">{{store.emails.flatMap((group) => group.emails).length}}封未读邮件
          </p>
        </div>

        <div class="flex items-center mx4 px2 py2 bg-#DAE6FF rounded-2xl" v-if="store.isLoading">
          <md-circular-progress indeterminate
            style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
            class="size-2rem m2 me-3"></md-circular-progress>
          <p class="font-305 text-1rem text-#064BDD me-3">正在同步你的邮箱</p>
        </div>

        <div class="flex overflow-y-auto overflow-x-hidden mt-0">
          <ul class="list-none p0 m0 list-none pe-3 max-w-full">
            <li v-for="group in store.emails" :key="group.date">
              <p class="m0 my-2 mx-5 font-380 text-#787878">{{ labelDate(group.date) }}</p>
            <li v-for="[id, email] in group.emails" :key="id" class="mb-2" @click="selectEmail(email, id)">
              <EmailItem :email="email" :selected="currentEmail == email" />
            </li>
            <div class="border-t border-t-solid border-t-#E9E9E9 m-3"></div>
            </li>
            <div class="h-2"></div>
          </ul>
        </div>

      </div>

      <div class="h-full w-0.05rem bg-#CDCDCD"></div>

      <router-view class="w-67% h-full overflow-y-auto overflow-x-auto" v-if="currentEmail"></router-view>
      <EmptyView class="w-67%" v-else></EmptyView>
    </div>
  </div>
</template>