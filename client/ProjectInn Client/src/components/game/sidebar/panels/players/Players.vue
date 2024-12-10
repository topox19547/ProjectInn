<script setup lang="ts">
    import { computed } from 'vue';
    import type { Player } from '../../../../../model/Player.js';
    const props = defineProps<{
        players : Array<Player>
    }>();

    const onlinePlayers = computed(() => props.players.filter(p => p.connected == true));
    const offlinePlayers = computed(() => props.players.filter(p => p.connected == false));
</script>

<template>
    <div class="margin">
        <div class="container">
            <div class="playerList">
                <div class="title" v-if="onlinePlayers.length > 0">
                    Active players
                </div>
                <div v-for="player in onlinePlayers" class="player"
                :style="{ 'color' : player.color}">
                    {{ player.name }}
                </div>
                <div class="spacer"></div>
                <div class="title" v-if="offlinePlayers.length > 0">
                    Offline players
                </div>
                <div v-for="player in offlinePlayers" class="player"
                :style="{ 'color' : player.color}">
                    {{ player.name }}
                </div>
            </div>
            <div class="chatBar">
                <input type="text" maxlength="512" class="textBox">
                <ButtonBase height="40px" 
                </ButtonBase>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .container{
        display: flex;
        flex-direction: column;
        background-color: #353535;
        border-radius: 16px;
        margin-inline: 16px;
        height: 100%;
        justify-content: space-between;
    }

    .playerList{
        padding: 16px;
        display: block;
        overflow-y: scroll;
        height: 100%;
    }

    .title{
        font-size: 20px;
        font-weight: bold;
        color: #d9d9d9;
        padding-bottom:16px;
    }

    .player{
        padding-block: 4px;
        font-weight: 600;
    }

    .spacer{
        min-height: 16px;
    }

    .chatBar{
        display: flex;
        padding-inline: 16px;
        padding-bottom: 16px;
        gap: 4px;
        align-items: center;
        height: 64px;
        flex : 1;
    }

    .textBox{
        background-color: #494949;
        color: #ffffff;
        border-radius: 16px;
        outline: #d9d9d9;
        border: 0;
        box-shadow: none;
        outline-style: none;
        outline-width: 0px;
        font-size: 16px;
        padding-top: 4px;
        padding-left: 16px;
        padding-bottom: 4px;
        width: 75%;
        height: 32px;
    }

    .margin{
        padding-bottom: 16px;
        overflow: hidden;
        height: 100%;
    }
    
</style>