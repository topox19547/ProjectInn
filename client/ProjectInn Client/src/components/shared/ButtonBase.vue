<script setup lang="ts">
    const props = defineProps<{
        text : string
        width? : string
        height? : string
        disableShadow? : boolean
    }>();
</script>

<template>
    <button class="button" 
    :style="{width: width, height: height, 'box-shadow' : disableShadow ? '0px 0px 0px' : '0px 0px 3px'}">
        <div class="buttonText">{{ props.text }}</div>
    </button>
</template>

<style scoped>
    .button{
        display: flex;
        justify-content: space-around;
        width: fit-content;
        gap:8px;
        height: 48px;
        border-radius: 16px;
        background-color: #303F9F;
        border: 0px;
        box-shadow: 0px 0px 3px;
        padding-inline: 8px;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
    }
    .button:hover:enabled{
        background-color: #3F51B5;
        transform: scale(1.05);
    }

    .button:disabled{
        background-color: #7e7e7e;
    }

    .buttonText{
        margin-top: auto;
        margin-bottom: auto;
        font-size: 16px;
        margin-inline: 8px;
        color: white;
        font-weight: 500;
    }
</style>