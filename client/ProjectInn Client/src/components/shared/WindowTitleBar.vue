<script setup lang="ts">
import CloseButton from './CloseButton.vue';

    const props = defineProps<{
        title : string,
        icon : string,
    }>();
</script>


<template>
    <div class="container">
        <slot name="back">
        </slot>
        <div class="titleContainer">
            <div class="icon">
                <img :src="icon" class="windowIcon">
            </div>
            <div class="title">
                {{ title }} 
            </div>
        </div>
    </div>
</template>


<style scoped>
    .title{
        font-size: 24px;
        width: fit-content;
        color:#D9D9D9;
        font-weight: bold;
        width: fit-content;
        margin-block: auto;
    }
    .windowIcon{
        width: 24px;
        height: 64px;
    }
    .container{
        display: flex;
        position: relative;
        height: 64px;
        width: 100%;
        padding-inline: 16px;
        gap: 32px;
        justify-content: center;
    }
    .titleContainer{
        display: flex;
        gap: 8px;
    }
</style>
