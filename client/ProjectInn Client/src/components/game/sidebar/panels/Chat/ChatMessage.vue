<script setup lang="ts">
import type { ChatMessage } from '../../../../../model/ChatMessage.js';
    const props = defineProps<{
        message : ChatMessage
        playerColor? : string
    }>();
</script>

<template>
    <div class="messageContainer" :class="{ system : message.isSystem }">
        <div class="sender" :style="{ color : playerColor }">{{ message.sender + ":" }}</div>
        <div class="text" v-if="!message.isSystem">{{ message.text }}</div>
        <div class="systemText" v-if="message.isSystem" v-html="message.text"></div>
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
</style>