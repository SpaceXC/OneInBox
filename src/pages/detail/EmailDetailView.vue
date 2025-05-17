<script setup lang="ts">
import { ref, onUnmounted, useTemplateRef, watch, nextTick } from 'vue'
import { type Email } from 'postal-mime'
import { bufferToBlobUrl } from '../../utils/ArrayBufferToBlobUrl'
import dayjs from 'dayjs'
import { getAddressDesc } from '../../utils/GetAddressDesc'
import { useRouter } from 'vue-router'

const props = defineProps<{
    email: Email | undefined
}>()

const router = useRouter()

const emit = defineEmits(['onBack'])

const isEmpty = ref(false)

let lastHeight = 0 // 保存在组件作用域，记录上一次高度

const html = ref<string | undefined>(undefined)
const attachments = ref<Map<string, string>>(new Map())

const shadowContainer = useTemplateRef('shadowContainer')
let resizeObserver: ResizeObserver | undefined

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect()
})

onUnmounted(() => {
    Array.from(attachments.value.values()).forEach((attachmentUrl) => {
        URL.revokeObjectURL(attachmentUrl);
    })
});

watch(() => props.email, async (email) => {
    console.log(email)
    if (email == undefined) {
        isEmpty.value = true
    }
    else {
        console.log("加载邮件", email)
        isEmpty.value = false
        loadEmail(email)
    }
}, { immediate: true })

function goBack() {
    console.log("返回")
    emit('onBack')
}

async function loadEmail(parsedEmail: Email) {
    html.value = parsedEmail.html
    attachments.value = new Map()
    console.log(html.value)

    parsedEmail.attachments.forEach((attachment) => {
        if (typeof attachment.content === 'string') {
            attachments.value.set(attachment.filename ?? '', attachment.content)
        } else {
            const url = bufferToBlobUrl(attachment.content, attachment.filename ?? '')
            attachments.value.set(attachment.filename ?? '', url)
            html.value = html.value?.replace(`cid:${attachment.filename}`, url)
        }
    })
    console.log("附件", attachments.value.size)

    await nextTick()
    if (shadowContainer.value) {
        injectEmailHtmlIntoShadow(html.value ?? '')
    }
}

function injectEmailHtmlIntoShadow(html: string) {
    // 创建一个基础样式，确保所有链接在新窗口打开
    const baseStyle = document.createElement('base')
    baseStyle.target = '_blank'

    if (!shadowContainer.value) return

    // 1. 初始化 Shadow Root
    const shadowRoot = shadowContainer.value.shadowRoot || shadowContainer.value.attachShadow({ mode: 'open' })

    // 2. 清空旧内容
    shadowRoot.innerHTML = ''

    // 3. 创建 iframe 容器
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.border = 'none'
    iframe.onload = () => {
        const doc = iframe.contentDocument
        if (!doc) return

        // 4. 写入邮件 HTML 内容
        doc.open()
        doc.write(html)
        doc.close()

        // 注入默认字体样式
        const style = document.createElement('style')
        style.innerHTML = `
          body {
            font-family: MiSans;
            font-size: 14px;
            line-height: 1.6;
            color: #1f2937;
          }
        `
        doc.head.appendChild(style)

        // 添加点击监听，拦截链接跳转
        doc.addEventListener('click', (e) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'A') {
                e.preventDefault()
                const href = (target as HTMLAnchorElement).href
                if (href) {
                    window.open(href, '_blank')
                }
            }
        })

        // 🧠 等内容稳定后第一次设置高度
        setTimeout(() => updateIframeHeight(iframe), 100)

        // 💡 每个图片加载完时，再更新高度
        const images = doc.images
        for (const img of images) {
            img.addEventListener('load', () => updateIframeHeight(iframe))
            img.addEventListener('error', () => updateIframeHeight(iframe))
        }

        // ❌ 销毁组件时记得 disconnect
        resizeObserver = new ResizeObserver(() => updateIframeHeight(iframe))
        resizeObserver.observe(doc.body)
    }

    shadowRoot.appendChild(iframe)
}

function reply() {

    const to = encodeURIComponent(props.email?.from.address ?? '')
    const content = encodeURIComponent(html.value ?? '')
    const subject = encodeURIComponent('RE:' + (props.email?.subject ?? ''))
    router.push(`/compose?to=${to}&subject=${subject}&content=${content}`)
}

function updateIframeHeight(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument
    if (!doc || !iframe.contentWindow) return

    const bodyHeight = doc.body?.scrollHeight || 0
    const docHeight = doc.documentElement?.scrollHeight || 0
    const newHeight = Math.max(bodyHeight, docHeight)

    // 如果高度变化小于 2px，就忽略，避免无限触发
    if (Math.abs(newHeight - lastHeight) > 2) {
        iframe.style.height = newHeight + 'px'
        lastHeight = newHeight
    }
}

</script>

<template>
    <div class="w-full h-full">
        <div v-if="!isEmpty">
            <!-- 发件人信息 -->
            <div class="flex items-center px6 pt6">
                <span class="material-symbols-rounded text-1.2rem" @click="goBack()">
                    arrow_back_ios_new
                </span>
                <div class="flex px-4 items-center">
                    <img src="/src/assets/defaultAvatar.svg" class="size-2.5rem">
                    <div class="px-4" v-if="email?.from.name">
                        <p class="m0 font-380 text-1.3rem">{{ email?.from.name }}</p>
                        <p class="m0 font-330 text-0.8rem text-#7d7d7d">{{ email?.from.address }}</p>
                    </div>
                    <div class="px-4" v-else>
                        <p class="m0 font-380 text-1.3rem">{{ email?.from.address }}</p>
                    </div>
                </div>
                <div class="flex">
                    <div class="flex-[1]"></div>
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" @click="reply()">
                        <path
                            d="M1.5 6.5C1.5 6.5 9.75 6.5 12 6.5C18 6.5 18 14.75 12 14.75M1.5 6.5L6.75 1.25M1.5 6.5L6.75 11.75"
                            stroke="#064BDD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <!-- 邮件内容 -->
            <div class="px-6">
                <div class="mb-5">
                    <p class="font-450 text-1.6rem mb-0">{{ email?.subject }}</p>
                    <p class="font-330 text-0.875rem mt-2 text-#7D7D7D">
                        Date:{{ dayjs(email?.date!!).format("YYYY-MM-DD HH:mm:ss") }} · To: {{email?.to?.map((to) =>
                            getAddressDesc(to)).join(', ')}}
                    </p>
                </div>
                <div class="border-t border-t-solid border-t-#E9E9E9 my-3"></div>

                <div ref="shadowContainer" class="pt-2"></div>
                <!-- <div v-html="html"></div> -->
            </div>
            <div v-if="attachments.size > 0" class="mt-6">
                <h2 class="text-lg font-semibold mb-4">Attachments</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="attachment in attachments" :key="attachment[0]"
                        class="p-4 border rounded-lg shadow-inner bg-gray-50">
                        <p class="truncate font-medium text-gray-700">{{ attachment[0] }}</p>

                        <a :href="attachment[1]" target="_blank"
                            class="mt-2 inline-block text-white no-underline bg-blue px-4 py-3 rounded-lg shadow hover:shadow-lg transition-all">
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col items-center justify-center h-full" v-else>
            <div class="flex flex-col items-center">
                <img src="/src/assets/empty.svg" class="w-4/5">
                <p class="m6 font-380 text-1.2rem">还没有打开任何邮件哦</p>
            </div>
        </div>
    </div>
    <!-- <div class="bg-gray-100 min-h-screen p-6">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold mb-4">{{ email?.subject }}</h1>
            <div class="text-gray-600 mb-4">
                <p><span class="font-semibold">From:</span>{{ getAddressDesc(email?.from) }}</p>
                <p><span class="font-semibold">Date:</span> {{ dayjs(email?.date!!).format("YYYY-MM-DD HH:mm:ss") }}</p>
                <p><span class="font-semibold">To:</span> {{email?.to?.map((to) => getAddressDesc(to)).join(', ')}}</p>
            </div>

            <div ref="shadowContainer" class="bg-gray-50 p-4 rounded-lg shadow-inner"></div>

            <div v-if="attachments.size > 0" class="mt-6">
                <h2 class="text-lg font-semibold mb-4">Attachments</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div v-for="attachment in attachments" :key="attachment[0]"
                        class="p-4 border rounded-lg shadow-inner bg-gray-50">
                        <p class="truncate font-medium text-gray-700">{{ attachment[0] }}</p>

                        <a :href="attachment[1]" target="_blank"
                            class="mt-2 inline-block text-white no-underline bg-blue px-4 py-3 rounded-lg shadow hover:shadow-lg transition-all">
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div> -->
</template>