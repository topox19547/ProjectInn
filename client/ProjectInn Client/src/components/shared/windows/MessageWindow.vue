<script setup lang="ts">
    import WindowBackground from '../WindowBackground.vue';
    import WindowBase from '../WindowBase.vue';

    defineProps<
        {
            title : string,
            message : string
        }
    >();
</script>


<template>
    <WindowBackground></WindowBackground>
    <WindowBase window-height="225px" window-width="365px">
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
        width: 100%;
        height: 100%;
        gap: 24px;
        padding-block: 16px;
    }
    .title{
        font-weight: bold;
        font-size: 20px;
    }
    .message{
        padding: 16px;
        padding-inline: 32px;
        white-space: pre-wrap;
        text-align: center;
    }
</style>
