<script setup lang="ts">
    const props = defineProps<{
        windowWidth : string,
        windowHeight : string
    }>();
</script>

<template>
    <div class="container">
        <div class="window" :style="{ 'width' : props.windowWidth, 'height' : props.windowHeight}">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<style scoped>
    .window{
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin: auto;
        position: 50%,50%;
        background: #242424;
        box-shadow: 0px 0px 3px;
        border-radius: 16px;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
        z-index: 2;
    }
    .container{
        display: flex;
        position: fixed;
        z-index: 1;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        overflow: auto;
        z-index: 1;
    }
</style> 