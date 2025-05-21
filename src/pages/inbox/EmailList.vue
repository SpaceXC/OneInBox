<script setup lang="ts">
import { labelDate } from '../../utils/LableDate';
import { onMounted, ref } from 'vue'
import EmailItem from './components/EmailItem.vue';
import { useEmailStore } from '../../stores/emailStore'

defineProps<{
  currentEmailId: string | undefined
}>()

const store = useEmailStore()

var currentPage = 1

const emit = defineEmits<{
  (e: 'selectEmail', id: string): void,
  (e: 'loadMore', page: number): void,
}>();

const loadingIndication = ref()

let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      currentPage += 1
      emit('loadMore', currentPage)
    }
  }, { threshold: 0.1 })
  observer.observe(loadingIndication.value)
  emit('loadMore', currentPage)
})

</script>

<template>
  <div :class="(currentEmailId ? 'w-0' : 'w-full') + ' h-full box-border flex flex-col'">
    <div class="mt-8 ms-5 mb-3">
      <p class="text-2xl font-450 m-0">收件箱</p>
      <p class="m-0 text-#787878 font-330 mt-1 mb-0" v-if="store.unreadCount">{{store.unreadCount}}封未读邮件
      </p>
    </div>

    <div :class="'flex items-center mx4 px2 py2 bg-#DAE6FF rounded-2xl'" v-if="store.emails.length == 0">
      <md-circular-progress indeterminate
        style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
        class="size-2rem m2 me-3"></md-circular-progress>
      <p class="font-305 text-1rem text-#064BDD me-3 w-full">正在同步你的邮箱</p>
    </div>

    <div class="flex overflow-y-auto overflow-x-hidden mt-0">
      <ul class="list-none p0 m0 list-none pe-3 max-w-full">
        <li v-for="group in store.emails" :key="group.date">
          <p class="m0 my-2 mx-5 font-380 text-#787878">{{ labelDate(group.date) }}</p>
        <li v-for="[id, email, read] in group.emails" :key="id" class="mb-2" @click="$emit('selectEmail', id)">
          <EmailItem :email="email" :selected="currentEmailId == id" :read="read" />
        </li>
        <div class="border-t border-t-solid border-t-#E9E9E9 m-3"></div>
        </li>
        <div ref="loadingIndication" class="flex items-center justify-center px-3">
          <md-circular-progress indeterminate
            style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
            class="size-2rem m2 me-3"></md-circular-progress>
          <p class="font-305 text-1rem text-#064BDD me-3 w-full">加载中...</p>
        </div>
        <div class="h-2"></div>
      </ul>
    </div>

  </div>
</template>