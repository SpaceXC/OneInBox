<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AV from 'leancloud-storage/live-query';
import NavItem from './components/NavItem.vue';

const router = useRouter();
const route = useRoute();

const currentPath = ref("");

function logout() {
  AV.User.logOut().then(() => {
    router.push('/auth');
  }).catch((error) => {
    alert(error.message)
  })
}

watch(() => route.path, (path) => {
  currentPath.value = path.split('/')[1];
});
</script>

<template>
  <div class="flex h-screen">

    <div class="lg:w-17% h-full lg:p-4 lg:pe-0 box-border invisible w-0 lg:visible transition-all duration-300 ease-in-out" v-if="route.path !== '/auth'">
      <div class="bg-#F2F2F2 rounded-2xl w-full h-full">
        <div class="flex items-center p4">
          <img src="/src/assets/avatar.jpeg" class="w-2.5rem aspect-ratio-1 rounded-xl">
          <div class="flex-grow"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ACACAC"
            class="size-1.5rem" @click="logout()">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
        </div>


        <div class="h-4rem"></div>

        <div class="">

          <NavItem name="收件箱" number="196" :is-selected="currentPath === 'inbox'" destinationPath="/inbox">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
            </svg>
          </NavItem>

          <NavItem name="发邮件" number="" :is-selected="currentPath === 'compose'" destinationPath="/compose">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.5646 3.67397L17.3219 1.91564C17.6882 1.54931 18.1851 1.34351 18.7031 1.34351C19.2212 1.34351 19.718 1.54931 20.0844 1.91564C20.4507 2.28197 20.6565 2.77882 20.6565 3.29689C20.6565 3.81496 20.4507 4.31181 20.0844 4.67814L9.02292 15.7396C8.47221 16.29 7.79309 16.6945 7.04688 16.9167L4.25 17.75L5.08333 14.9531C5.3055 14.2069 5.71004 13.5278 6.26042 12.9771L15.5646 3.67397ZM15.5646 3.67397L18.3125 6.42189M16.75 13.5833V18.5313C16.75 19.1529 16.5031 19.749 16.0635 20.1885C15.624 20.6281 15.0279 20.875 14.4062 20.875H3.46875C2.84715 20.875 2.25101 20.6281 1.81147 20.1885C1.37193 19.749 1.125 19.1529 1.125 18.5313V7.59376C1.125 6.97216 1.37193 6.37602 1.81147 5.93648C2.25101 5.49694 2.84715 5.25001 3.46875 5.25001H8.41667"
                stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </NavItem>

        </div>

      </div>
    </div>

    <router-view v-slot="{ Component }" :class="'transition-all duration-300 ease-in-out' + route.path !== '/auth' ? 'lg:w-83% w-full' : 'w-full'">
      <transition name="slide-fade" mode="out-in">
        <component :is="Component"/>
      </transition>
    </router-view>
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