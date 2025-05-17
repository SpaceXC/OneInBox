<script setup lang="ts">
import AV from 'leancloud-storage/live-query'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEmailStore } from '../../stores/emailStore'
import EmailItem from './components/EmailItem.vue';
import { labelDate } from '../../utils/LableDate';
import EmptyView from '../empty/EmptyView.vue';

const store = useEmailStore()

const router = useRouter()

const currentEmailId = ref<string | undefined>(undefined)

onMounted(() => {
  if (!store.isLoaded) {
    store.refreshEmails()
  }
})

onMounted(() => {
  const id = router.currentRoute.value.path.split('/').pop()
  if (id && id !== 'inbox') {
    currentEmailId.value = id as string
  }
  console.log("LOAD ID", id)
})

watch(
  () => router.currentRoute.value.path,
  (value) => {
    const segments = value.split('/').filter((segment) => segment !== '')
    if(segments[segments.length - 1] === 'inbox') {
      currentEmailId.value = undefined
    } else {
      currentEmailId.value = segments.pop()
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

function selectEmail(id: string) {
  router.push(`/inbox/${id}`)
}

</script>

<template>
  <div class="flex h-screen">

    <div
      :class="`lg:w-36% lg:opacity-100 h-full box-border flex flex-col transition-all duration-300 ease-in-out ${currentEmailId ? 'opacity-0 w-0' : 'opacity-100 w-full'}`">

      <div class="mt-8 ms-5 mb-3">
        <p class="text-2xl font-450 m-0">收件箱</p>
        <p class="m-0 text-#787878 font-330 mt-1 mb-0">{{store.emails.flatMap((group) => group.emails).length}}封未读邮件
        </p>
      </div>

      <div class="flex items-center mx4 px2 py2 bg-#DAE6FF rounded-2xl" v-if="store.isLoading">
        <md-circular-progress indeterminate
          style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
          class="size-2rem m2 me-3"></md-circular-progress>
        <p class="font-305 text-1rem text-#064BDD me-3 w-full">正在同步你的邮箱</p>
      </div>

      <div class="flex overflow-y-auto overflow-x-hidden mt-0">
        <ul class="list-none p0 m0 list-none pe-3 max-w-full">
          <li v-for="group in store.emails" :key="group.date">
            <p class="m0 my-2 mx-5 font-380 text-#787878">{{ labelDate(group.date) }}</p>
          <li v-for="[id, email] in group.emails" :key="id" class="mb-2" @click="selectEmail(id)">
            <EmailItem :email="email" :selected="currentEmailId == id" />
          </li>
          <div class="border-t border-t-solid border-t-#E9E9E9 m-3"></div>
          </li>
          <div class="h-2"></div>
        </ul>
      </div>

    </div>

    <div class="h-full w-0.05rem bg-#CDCDCD invisible lg:visible"></div>

    <Transition name="slide-fade" mode="out-in"
      :class="`lg:w-64% lg:opacity-100 h-full overflow-y-auto overflow-x-auto transition-all duration-300 ease-in-out ${currentEmailId ? 'opacity-100 w-full' : 'opacity-0 w-0'}`">
      <router-view v-slot="{ Component }" v-if="currentEmailId">
        <transition name="slide-fade" mode="out-in">
          <component v-if="currentEmailId" :is="Component" :key="currentEmailId" />
        </transition>
      </router-view>
      <EmptyView class="w-full" v-else></EmptyView>
    </Transition>


  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>