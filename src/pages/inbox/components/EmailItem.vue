<script setup lang="ts">
import type { Email } from 'postal-mime';
import { getAddressDesc } from '../../../utils/GetAddressDesc';

defineProps<{
    email: Email,
    selected: boolean
}>()

</script>

<template>
    <div>
        <div class="flex gap-2 px4 pb1"
        :class="{ 'bg-#F5F5FF border-l-0.2rem border-l-solid border-l-#064BDD ps-0.8rem': selected, 'ps1rem': !selected }">
        <!-- 未读 -->
        <div class="min-h-2 min-w-2 h2 w2 bg-#064BDD rounded-full mt-7 ms-1"></div>

        <div class="min-w-0">
            <p class="truncate font-450 text-lg overflow-hidden whitespace-nowrap text-ellipsis w-full mb-0">{{
                email.subject }}
            </p>
            <p
                class="truncate font-330 text-0.9rem text-#7d7d7d overflow-hidden whitespace-nowrap text-ellipsis w-full mt-1.5 mb-0">
                {{ getAddressDesc(email.from) }}
            </p>
            <p class="font-330 text-0.8rem text-#a7a7a7 overflow-hidden break-all line-clamp-2 w-full mt-1.6 mb-2">{{
                email.text?.replace(/\s+/g, ' ') // 合并多余空格
                    .replace(/[\r\n]+/g, ' ') }}</p>
        </div>
    </div>
    </div>
</template>