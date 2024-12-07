<script setup lang="ts">
import { inject, ref } from 'vue';
import type { Player } from '../../model/Player.js';
import IdInput from './windows/IdInput.vue';
import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
import type { ServerPublisher } from '../../network/ServerHandler.js';
import { Status } from '../../network/message/Status.js';
import { Command } from '../../network/message/Command.js';
    const emits = defineEmits<{
        close : boolean
    }>();

    const props = defineProps<{
        showWizard : boolean
    }>();

    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const showPlayerMenu = ref(false);
    const joinData = ref<{ gameId : number, player : Player}>(
        {
            gameId : 0,
            player : {
                name: '',
                color: '',
                permissions: {},
                connected: false
            }
        });
    
    function showPlayerEditor(){
        showPlayerMenu.value = true;
    }

    function submitJoinData(){
        showPlayerMenu.value = false;
        serverPublisher.send({
            status : Status.JOIN_GAME,
            command : Command.NONE,
            content : {
                gameId : joinData.value.gameId,
                username : joinData.value.player.name,
                playerColor : joinData.value.player.color,
                password : undefined
            }
        });
    }
</script>

<template>
    <IdInput 
    :join-data="joinData" 
    :on-confirm="() => {
        $emit('close');
        showPlayerEditor();
    }"
    :show="showWizard"
    @close="$emit('close')">
    </IdInput>
    <PlayerEditWindow 
    :player="joinData.player"
    :on-confirm="submitJoinData"
    :show="showPlayerMenu"
    @close="showPlayerMenu = false">
    </PlayerEditWindow>
</template>

<style scoped>

</style>