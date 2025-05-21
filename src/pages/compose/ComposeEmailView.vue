<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Marked } from 'marked';
import AV from 'leancloud-storage';
import PostalMime from 'postal-mime'
import { useRoute, useRouter } from 'vue-router';
import hljs from 'highlight.js'
import { markedHighlight } from "marked-highlight";
import 'highlight.js/styles/idea.css'
import axios from 'axios';


const route = useRoute()
const router = useRouter()

// const showingMdCode = ref(true)
const from = ref("XC")
const to = ref("")
const subject = ref("")
const bodyMd = ref("")

const isLoading = ref(false)
const success = ref(false)
const errorMessage = ref("")

onMounted(async () => {
    if (route.query.replyTo) {
        const lcObject = AV.Object.createWithoutData('Emails', route.query.replyTo as string)
        lcObject.fetch().then(async (email) => {
            const rawEmail = email.get("rawEmail")
            const parsedEmail = await PostalMime.parse(rawEmail)
            bodyMd.value = `> ${parsedEmail.html}\n\n`
            to.value = parsedEmail.from.address as string
            subject.value = `Re: ${parsedEmail.subject}`
        }).catch((error) => {
            console.error(error);
        })
    }
    else {
        to.value = localStorage.getItem("to") ?? ""
        subject.value = localStorage.getItem("subject") ?? ""
        bodyMd.value = localStorage.getItem("bodyMd") ?? ""
    }
})

watch([to, subject, bodyMd], () => {
    localStorage.setItem("to", to.value)
    localStorage.setItem("subject", subject.value)
    localStorage.setItem("bodyMd", bodyMd.value)
})

const marked = new Marked(
    markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    })
);

// const bodyHtml = computed(() => {
//     return marked.parse(bodyMd.value)
// })

// function togglePreview() {
//     showingMdCode.value = !showingMdCode.value
// }

async function sendEmail() {
    if (to.value === "" || subject.value === "" || bodyMd.value === "") {
        return
    }

    isLoading.value = true

    const formData = new FormData();
    const html = marked.parse(bodyMd.value) as string
    formData.append("to", to.value);
    formData.append("fromName", from.value)
    formData.append("subject", subject.value);
    formData.append("html", html);

    axios.post("https://resend.spacexc.net/api/send", formData).then((response) => {
        localStorage.removeItem("to")
        localStorage.removeItem("subject")  
        localStorage.removeItem("bodyMd")
        console.log(response.data);
        success.value = true
        isLoading.value = false
        router.push('/inbox')
    }).catch((error) => {
        console.error(error);
        errorMessage.value = error
        isLoading.value = false
    })
}

</script>

<template>
    <div class="flex h-screen flex-col">
        <div class="flex items-center px6 pt8">
            <span class="material-symbols-rounded text-1.2rem" @click="router.back()">
                arrow_back_ios_new
            </span>
            <p class="m0 font-380 text-1.3rem ps-3.5">新邮件</p>

            <div class="flex flex-1">
                <div class="flex-1"></div>
                <Transition name="slide-fade" mode="out-in">
                    <div class="flex items-center bg-#E5E6FF px-6 py-3 rounded-xl" @click="sendEmail()"
                        v-if="!isLoading">
                        <svg class="size-1.3rem" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4.49991 9L2.45166 2.34375C7.35131 3.76875 11.9717 6.01984 16.1137 9C11.9719 11.9801 7.3518 14.2312 2.45241 15.6562L4.49991 9ZM4.49991 9H10.1249"
                                stroke="#4248F5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p class="text-#4248F5 font-380 text-1.1rem m0 ms-2">发送</p>
                    </div>
                    <md-circular-progress indeterminate
                        style="--md-sys-color-primary: #064BDD; --md-circular-progress-active-indicator-width: 6"
                        class="size-2rem m2 me-3" v-else></md-circular-progress>
                </Transition>
            </div>


        </div>

        <div class="flex flex-col m-6 flex-1">
            <div class="space-y-5">
                <div class="flex items-center">
                    <p class="text-#4A4A4A font-380 bg-#F4F4F4 m0 px-3 py-2 rounded-0.4rem me-2">收件人</p>
                    <input v-model="to" type="text"
                        class="flex-1 border-0 box-border focus:outline-none text-black font-380 text-1.1rem"
                        placeholder="收件人" />
                </div>
                <div class="flex items-center">
                    <p class="text-#4A4A4A font-380 bg-#F4F4F4 m0 px-3 py-2 rounded-0.4rem me-2">主题</p>
                    <input v-model="subject" type="text"
                        class="flex-1 border-0 box-border focus:outline-none text-black font-380 text-1.1rem"
                        placeholder="主题" />
                </div>
            </div>

            <div class="h-0.05rem bg-#E3E3E3 my-6"></div>

            <textarea v-model="bodyMd" class="flex-1 w-full border-none resize-none outline-none text-1.1rem"
                style="font-family: MiSans;" placeholder="Markdown goes here"></textarea>
        </div>
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