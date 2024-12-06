<script setup lang="ts">
</script>

<template>
    <div class="windowBackground">
        <slot name="window"></slot>
    </div>
</template>

<style scoped>
    .windowBackground{
        display: flex;
        position: fixed;
        z-index: 1;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        overflow: hidden;
        backdrop-filter: blur(3px);
        background-color: rgba(0,0,0,0.5); 
        z-index: 1;
    }
</style> 