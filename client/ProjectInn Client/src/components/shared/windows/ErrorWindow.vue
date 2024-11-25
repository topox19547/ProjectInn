<script setup lang="ts">
import WindowBase from '../WindowBase.vue';

    const props = defineProps<
        {
            title : string,
            message : string
        }
    >();
</script>


<template>
    <WindowBase window-height="225px" window-width="325px">
        <template v-slot:content>
            <div class="content">
                <div class="title">{{ title }}</div>
                <div class="message">{{ message }}</div>
                <slot name="button"></slot>
            </div>
        </template>
    </WindowBase>
    
</template>

<style scoped>
    .content{
        color: #d9d9d9;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 325px;
        padding: 16px;
        gap: 24px;
    }
    .title{
        font-weight: bold;
        font-size: 20px;
    }
    .message{
        white-space: pre-wrap;
        text-align: center;
    }
</style>