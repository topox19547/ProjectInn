<script setup lang="ts">
    import { computed } from 'vue';
    import type { ChatMessage } from '../../../../../model/ChatMessage.js';
    const props = defineProps<{
        message : ChatMessage
        playerColor? : string
    }>();

    const timeString = computed(() => {
        if(props.message.receivedAt !== undefined){
            return props.message.receivedAt.toLocaleTimeString(
                navigator.language,{hour : '2-digit', minute: '2-digit'});
        }
    })
</script>

<template>
    <div class="messageContainer" :class="{ system : message.isSystem }">
        <div class="sender" :style="{ color : playerColor }">{{ message.sender + ":" }}</div>
        <div class="text" v-if="!message.isSystem">{{ message.text }}</div>
        <div class="systemText" v-if="message.isSystem" v-html="message.text"></div>
        <div  class="time" :class="message.isSystem ? 'systemText' : 'text'"> 
            {{ timeString }}
        </div>
    </div>
</template>

<style scoped>
    .messageContainer{
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        max-height: fit-content;
    }

    .system{
        border-radius: 16px;
        margin-block: 8px;
        background-color: #303F9F;
    }

    .systemText{
        color : #FFFFFF
    }

    .sender{
        font-weight: bold;
        color: #FFFFFF;
        font-size: 16px;
    }

    .text{
        color: #d9d9d9
    }

    .time{
        font-size: 12px;
    }
</style>