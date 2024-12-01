<script setup lang="ts">
    const props = defineProps<{
        windowWidth : string,
        windowHeight : string
    }>();
</script>

<template>
    <div class="background">
        <div class="window" :style="{ 'width' : props.windowWidth, 'height' : props.windowHeight}">
            <slot name="content"></slot>
        </div>
    </div>

</template>

<style scoped>
    .background{
        display: flex;
        position: fixed;
        z-index: 1;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        overflow: auto;
        backdrop-filter: blur(3px);
        background-color: rgba(0,0,0,0.5); 
        z-index: 1;
    }
    .window{
        display: flex;
        margin: auto;
        position: 50% 50%;
        background: #242424;
        box-shadow: 0px 0px 3px;
        border-radius: 16px;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
    }
</style> 