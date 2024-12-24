<script setup lang="ts">
    const props = defineProps<{
        text? : string
        width? : string
        height? : string
        disableShadow? : boolean
        icon? : string
        color? : {
            active : string,
            hover : string
        }
    }>();
</script>

<template>
    <button class="button" 
    :style="{
        width: width,
        height: height,
        'box-shadow' : disableShadow ? '0px 0px 0px' : '0px 0px 3px',
        '--color-active': color?.active,
        '--color-hover': color?.hover
    }">
        <img class="icon" v-if="icon !== undefined" 
        :style="{ 'padding-right' : text ? '0px' : '8px' }" 
        :src="icon" width="24px">
        <div class="buttonText" v-if="text !== undefined" >{{ props.text }}</div>
    </button>
</template>

<style scoped>
    .button{
        --color-active: #303F9F;
        --color-hover: #3F51B5;
        display: flex;
        justify-content: center;
        width: fit-content;
        align-items: center;
        height: 48px;
        border-radius: 16px;
        background-color: var(--color-active);
        border: 0px;
        box-shadow: 0px 0px 3px;
        padding-inline: 8px;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
    }
    .button:hover:enabled{
        background-color: var(--color-hover);
        transform: scale(1.05);
    }

    .icon{
        padding-inline: 8px;
    }

    .button:disabled{
        background-color: #7e7e7e;
    }

    .buttonText{
        margin-top: auto;
        margin-bottom: auto;
        font-size: 16px;
        padding-inline: 8px;
        color: white;
        font-weight: 500;
    }
</style>