<script setup lang="ts">
    const props = defineProps<{ 
        text : string
        icon : string
    }>();
</script>

<template>
    <button class="fab">
        <div class="buttonText">{{ props.text }}</div>
        <img class="buttonIcon" :src=props.icon></img>
    </button>
</template>

<style scoped>
    .fab{
        display: flex;
        position:absolute;
        justify-content: space-around;
        bottom: 16px;
        right: 16px;
        width: fit-content;
        gap:8px;
        height: 48px;
        border-radius: 16px;
        background-color: #303F9F;
        border: 0px;
        box-shadow: 0px 0px 3px;
        z-index: 10;
        padding-inline: 8px;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
    }
    .fab:hover{
        background-color: #3F51B5;
        transform: scale(1.1);
    }
    .buttonText{
        margin-top: auto;
        margin-bottom: auto;
        font-size: 16px;
        color: white;
        margin-left: 8px;
        font-weight: 500;
    }
    .buttonIcon{
        width: 28px;
        height: 100%;
        margin-right: 4px;
    }
</style>