<script setup lang="ts">
    import Fab from './Fab.vue';
    import Add from '../../../assets/icons/add.svg';
    import GameEntry from './GameEntry.vue';
import type { Component, Ref } from 'vue';
    defineEmits(['newGame']);
    const props = defineProps<{
        title : string,
    }>();
</script>

<template>
    <div class="container">
        <header class="categoryTitle"> Title </header>
        <div class="gameListCard">
            <div class="empty">
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
                <GameEntry title="a" info="a" emit-signal="p" :game-id=0></GameEntry>
            </div>
        </div>
        <slot name="fab"></slot>
    </div>
</template>
//PARAMS : button(icon url, name, action),  game list ref

<style scoped>
    .categoryTitle{
        font-size: 28px;
        color: #D9D9D9;
        font-weight: bold;
        margin-left: 16px;
    }
    .gameListCard{
        position: relative;
        margin-top: 16px;
        background-color: #353535;
        border-radius: 16px;
        width: fit-content;
        max-width: 650px;
        max-height: 800px;
        width:60vmin;
        height: 65vmin;
        overflow-y: overlay;
        box-shadow: 0px 0px 3px;
        scrollbar-color: #d9d9d9 transparent;
    }
    .container{
        position: relative;
    }
    .empty{
       overflow-y: auto;
    }
</style>