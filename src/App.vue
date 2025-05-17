<script setup lang="ts">
import { ref } from 'vue';
import AV from 'leancloud-storage/live-query';
import LoginView from './pages/login/LoginView.vue';

const authed = ref(false);

function getIsAuthed() {
  if(AV.User.current()) {
    authed.value = true
  } else {
    authed.value = false
  }
}

getIsAuthed();
</script>

<template>
  <router-view v-slot="{ Component }" v-if="authed">
    <transition name='fade'>
      <component :is="Component"/>
    </transition>
  </router-view>
  <LoginView v-else></LoginView>
</template>