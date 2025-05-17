<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Marked } from 'marked';
import AV from 'leancloud-storage';
import PostalMime from 'postal-mime'
import { useRoute } from 'vue-router';
import hljs from 'highlight.js'
import { markedHighlight } from "marked-highlight";
import 'highlight.js/styles/idea.css'
import axios from 'axios';


const route = useRoute()

const showingMdCode = ref(true)
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

const bodyHtml = computed(() => {
    return marked.parse(bodyMd.value)
})

function togglePreview() {
    showingMdCode.value = !showingMdCode.value
}

async function sendEmail() {
    isLoading.value = true

    const formData = new FormData();
    const html = marked.parse(bodyMd.value) as string
    formData.append("to", to.value);
    formData.append("fromName", from.value)
    formData.append("subject", subject.value);
    formData.append("html", html);

    axios.post("https://resend.spacexc.net/api/send", formData).then((response) => {
        console.log(response.data);
        success.value = true
        isLoading.value = false
    }).catch((error) => {
        console.error(error);
        errorMessage.value = error
        isLoading.value = false
    })
}

</script>

<template>
    <div class="h-screen flex overflow-hidden" v-if="!isLoading && !success">
        <div class="flex-1 bg-gray-50 p4 overflow-auto">
            <div class="max-w-3xl mx-auto bg-white shadow-md rounded-xl p4">
                <h1 class="text-xl font-bold mb2">写邮件</h1>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">发件人</label>
                        <input v-model="from" type="text" class="w-full border rounded py-2" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">收件人</label>
                        <input v-model="to" type="text" class="w-full border rounded py-2" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-1">主题</label>
                        <input v-model="subject" type="text" class="w-full border rounded py-2" />
                    </div>


                    <div>
                        <div class="flex items-center"><label class="block text-sm font-medium mb-1">正文</label>
                            <button
                                class="bg-light-blue text-white px-4 py-2 rounded border-0 shadow hover:shadow-lg transition-all m-3"
                                @click="togglePreview()">预览</button>
                        </div>
                        <textarea v-if="showingMdCode" v-model="bodyMd"
                            class="w-full border rounded py-2 min-h-40 resize-y"></textarea>
                        <div v-if="!showingMdCode" v-html="bodyHtml"></div>
                    </div>

                    <div class="flex flex-col justify-end gap-2">
                        <button
                            class="bg-light-blue text-white px-4 py-2 rounded border-0 shadow hover:shadow-lg transition-all w-auto self-end"
                            @click="sendEmail()">发送</button>
                        <p class="text-#FF0000 self-end">{{ errorMessage }}</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <div v-if="isLoading" class="w-full h-screen flex overflow-hidden">
        <div class="flex-1 bg-gray-50 p4 overflow-auto">
            <div class="max-w-3xl mx-auto bg-white shadow-md rounded-xl p4">
                <h1 class="text-xl font-bold mb2">发送中...</h1>
            </div>
        </div>
    </div>
    <div v-if="success && !isLoading" class="w-full h-screen flex overflow-hidden">
        <div class="flex-1 bg-gray-50 p4 overflow-auto">
            <div class="max-w-3xl mx-auto bg-white shadow-md rounded-xl p4">
                <h1 class="text-xl font-bold mb2">发送成功</h1>
                <p>邮件已发送至{{ to }}</p>
                <RouterLink to="/">
                    <button
                        class="bg-light-blue text-white px-4 py-2 rounded border-0 shadow hover:shadow-lg transition-all"
                        @click="success = false">返回主页</button>
                </RouterLink>
            </div>
        </div>
    </div>
</template>