<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { Player } from '../../model/Player.js';
import IdInput from './windows/IdInput.vue';
import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
import type { ServerPublisher } from '../../network/ServerPublisher.js';
import { Status } from '../../network/message/Status.js';
import { Command } from '../../network/message/Command.js';
import type { GamePreview } from '../../model/gamePreview.js';
import ErrorWindow from '../shared/windows/MessageWindow.vue';
import ButtonBase from '../shared/ButtonBase.vue';
import PasswordInput from './windows/PasswordInput.vue';
import { RefSymbol } from '@vue/reactivity';
    const emits = defineEmits<{
        close : boolean
    }>();

    const props = defineProps<{
        joinID : undefined | number
        showWizard : boolean
        activeGames : Array<GamePreview>
    }>();

    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const showJoinError = ref(false);
    const showPasswordScreen = ref(false);
    const showPlayerMenu = ref(false);
    const joinData = ref(getJoinDataBaseValue());

    function getJoinDataBaseValue(){
        return {
            gameId : 0,
            player : {
                name: '',
                color : "#784cff",
                permissions: {},
                connected: false,
                isOwner : false
            },
            password : undefined,
            enterAsNewPlayer : true
        }
    }
    
    function showPlayerEditor(){
        showPlayerMenu.value = true;
    }

    function submitJoinData(){
        joinData.value.gameId = props.joinID !== undefined ? props.joinID : joinData.value.gameId;
        showPlayerMenu.value = false;
        const game : GamePreview | undefined = props.activeGames.find(g => g.id == joinData.value.gameId);
        if(game === undefined){
            showJoinError.value = true;
            return;
        }
        if(game.private == true){
            showPasswordScreen.value = true;
            return;
        }
        serverPublisher.send({
            status : Status.JOIN_GAME,
            command : Command.NONE,
            content : {
                gameId : joinData.value.gameId,
                username : joinData.value.player.name,
                playerColor : joinData.value.player.color,
                newPlayer : joinData.value.enterAsNewPlayer,
                password : undefined
            }
        });
        joinData.value = getJoinDataBaseValue();
    }

    function submitJoinDataPassword(){
        if(joinData.value.password === undefined){
            return;
        }
        serverPublisher.send({
            status : Status.JOIN_GAME,
            command : Command.NONE,
            content : {
                gameId : joinData.value.gameId,
                username : joinData.value.player.name,
                playerColor : joinData.value.player.color,
                newPlayer : joinData.value.enterAsNewPlayer,
                password : joinData.value.password
            }
        });
        joinData.value = getJoinDataBaseValue();
    }

</script>

<template>
    <ErrorWindow v-if="showJoinError"
    title="ID Error"
    :message="`Couldn't find any game with the ID: ${ joinData.gameId }`" >
        <template v-slot:button>
            <ButtonBase 
            text="Ok"
            width="100px"
            @click="() => {
                $emit('close');
                showJoinError = false;
            }
            "></ButtonBase>
        </template>
    </ErrorWindow>
    <IdInput 
    :join-data="joinData" 
    :on-confirm="() => {
        showPlayerEditor();
        $emit('close');
    }"
    :show="showWizard && joinID === undefined"
    @close="$emit('close')">
    </IdInput>
    <PlayerEditWindow 
    :player="joinData.player"
    :on-confirm="() => {
        submitJoinData();
        $emit('close');
    }"
    :show="showPlayerMenu || showWizard && joinID !== undefined"
    :force-new-player="false"
    @close="() => {
        showPlayerMenu = false;
        $emit('close');
    }"
    @change-new-player-status="s => joinData.enterAsNewPlayer = s">
    </PlayerEditWindow>
    <PasswordInput
    :join-data="joinData"
    :on-confirm="submitJoinDataPassword"
    :show="showPasswordScreen"
    @close="showPasswordScreen = false"
    ></PasswordInput>
</template>

<style scoped>

</style>