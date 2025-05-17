<script setup lang="ts">
import { ref, watch } from 'vue';
import AV from 'leancloud-storage/live-query';

const username = ref("")
const password = ref("")

const errorUsername = ref(false)
const errorPassword = ref(false)

watch(username, () => { errorUsername.value = false })
watch(password, () => { errorPassword.value = false })

function login() {
    console.log("登录")
    if (username.value === "") {
        errorUsername.value = true
    }
    if(password.value === "") {
        errorPassword.value = true
    }
    if(username.value === "" || password.value === "") {
        return
    }
    AV.User.logIn(username.value, password.value).then(() => {
        window.location.reload()
    }).catch((error) => {
        errorUsername.value = true
        errorPassword.value = true
        console.log(error)
    })
}
</script>

<template> 
    <div class="flex h-screen">
        <!-- 左半边 -->
        <div class="w-full sm:w-35% flex flex-col justify-center items-center">
            <div class="w-80%">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="#ED57AC" class="size-6 m1">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <p class="font-250 text-2rem mb2 mt-5">越是困难，越要抬起头，地上可找不到任何希望！ </p>
                <p class="font-250 text-#7D7D7D m0">—— 「Zetman」</p>

                <p class="text-#2C2C2C font-330 ms-0.5 mb-3 mt-2rem">邮箱</p>
                <input v-model="username" type="text"
                    :class="{'border-red-500 border-solid border-x border-y': errorUsername }"
                    class="w-full bg-#FAFAFA border-0 px-4 py-4 box-border rounded-xl text-1rem border-red-500 border-solid border transition-all"
                    placeholder="输入电子邮箱地址" />

                <p class="text-#2C2C2C font-330 ms-0.5 mb-3">密码</p>
                <input v-model="password" type="password"
                    :class="{'border-red-500 border-solid border-x border-y': errorPassword }"
                    class="w-full bg-#FAFAFA border-0 px-4 py-4 box-border rounded-xl text-1rem transition-all" placeholder="输入密码" />

                <div class="w-full flex rounded-2xl items-center box-border px-4 my-8 duration-500 ease-in-out transform bg-gradient-to-r from-#a17ace to-#4248F5 active:scale-95"
                    @click="login()">
                    <p class="text-white font-330">登入</p>
                    <div class="flex-grow"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="white" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- 右边图片 -->
        <div class="hidden sm:flex w-65% relative overflow-hidden items-center justify-center m-4">
            <img src="/src/assets/login_banner.png" class="w-full h-full object-cover rounded-2xl" />
        </div>
    </div>
</template>