<script setup lang="ts">
    const props = defineProps<{
        title : string,
        info : string
        emitSignal : string
        gameId : number
    }>();
</script>

<template>
    <div class="gameEntry" @click="$emit(emitSignal,gameId)">
        <div class="gameInfo">
            <div class="gameTitle">{{ props.title }}</div>
            <div class="gameDesc">{{ props.info }}</div>
        </div>
        <slot name="actions"></slot>
    </div>
    <div class="divider"></div>
</template>

<style>
    .gameEntry{
        font-size:16px;
        height: 64px;
        color: #D9D9D9;
        display: flex;
        justify-content: space-between;
        padding: 16px;
    }
    .gameEntry:hover{
        background-color: #3b3b3b;
    }
    .action{
        max-width: fit-content;
        margin-top: auto;
        margin-bottom: auto;
    }
    .gameInfo{
        max-width: fit-content;
        margin-top: auto;
        margin-bottom: auto;
        display: flex;
        flex-direction:column;
        gap: 16px;
    }
    .gameTitle{
        font-weight: bold;
    }
    .divider{
        background-color: #D9D9D9;
        height: 1px;
        width: 100%;
    }
</style>