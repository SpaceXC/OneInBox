<script setup lang="ts">
import AV from 'leancloud-storage/live-query'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEmailStore } from '../../stores/emailStore'
import EmptyView from '../empty/EmptyView.vue';
import EmailList from './EmailList.vue'

const store = useEmailStore()

const router = useRouter()

const currentEmailId = ref<string | undefined>(undefined)

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
    if (segments[segments.length - 1] === 'inbox') {
      currentEmailId.value = undefined
    } else {
      currentEmailId.value = segments.pop()
    }
  }
)

const query = new AV.Query("Emails");
query.subscribe().then((liveQuery) => {
  liveQuery.on("create", async (lcObject) => {
    lcObject ? store.addEmail(lcObject) : undefined

  });
  liveQuery.on("delete", (lcObject) => {
    lcObject?.id ? store.removeEmail(lcObject.id) : undefined
  });
  liveQuery.on("update", async (lcObject) => {
    lcObject ? store.updateEmail(lcObject) : undefined
    console.log("UPDATE", lcObject)
  });
});

function selectEmail(id: string) {
  router.push(`/inbox/${id}`)
}

</script>

<template>
  <div class="flex h-screen">
    <EmailList :currentEmailId="currentEmailId" :emails="store.emails" @selectEmail="(emailId) => selectEmail(emailId)" @loadMore="(page) => store.fetchEmails(false, page)" :unreadCount="store.unreadCount"
      :class="`lg:w-36% lg:opacity-100 h-full box-border flex flex-col ${currentEmailId ? 'opacity-0 w-0 hidden' : 'opacity-100 w-full'}`" />

    <div class="h-full w-0.05rem bg-#CDCDCD hidden lg:block"></div>

    <Transition name="slide-fade" mode="out-in"
      :class="`lg:w-64% lg:opacity-100 h-full overflow-y-auto overflow-x-auto z-1000 ${currentEmailId ? 'opacity-100 w-full' : 'opacity-0 w-0'}`">
      <router-view v-slot="{ Component }" v-if="currentEmailId">
        <transition name="slide-fade" mode="out-in">
          <component v-if="currentEmailId" :is="Component" :key="currentEmailId" />
        </transition>
      </router-view>
      <EmptyView v-else></EmptyView>
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