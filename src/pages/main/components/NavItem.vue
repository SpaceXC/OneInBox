<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
    name: string,
    number: string,
    isSelected: boolean,
    destinationPath: string
}>()

</script>

<template>

    <div :class="'rounded-2xl flex items-center px-4 my-2 mx-3 hover:shadow-#D2D2D2' + (isSelected ? 'shadow-#D2D2D2 shadow-md bg-white ' : 'opacity-0.5')">

        <slot></slot>

        <div class="w-0.5rem"></div>

        <p class="font-330">{{ name }}</p>

        <div class="flex-1"></div>


        <p class="font-330">{{ number}}</p>

    </div>

</template>