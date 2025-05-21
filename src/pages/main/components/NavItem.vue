<script setup lang="ts">
import { defineProps } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()

defineProps<{
    name: string,
    number: string | number | undefined,
    isSelected: boolean,
    destinationPath: string,
    showFull: boolean
}>()

</script>

<template>

    <div :class="'rounded-2xl flex items-center px-4 my-2 mx-3 py-4 transition-all duration-300 ease-in-out hover-bg-white hover:shadow-#D2D2D2 hover:shadow-md ' + (isSelected ? 'shadow-#D2D2D2 shadow-md bg-white ' : 'opacity-50')"
        @click="router.push(destinationPath)">

        <slot class=""></slot>

        <div class="flex items-center w-full" v-if="showFull">
            <div class="w-0.5rem"></div>

            <p class="font-330 m0">{{ name }}</p>

            <div class="flex-1"></div>


            <p class="font-330 m0" v-if="number">{{ number }}</p>
        </div>


    </div>

</template>