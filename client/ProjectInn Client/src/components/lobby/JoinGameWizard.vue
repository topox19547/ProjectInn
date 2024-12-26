<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type { Player } from '../../model/Player.js';
import IdInput from './windows/IdInput.vue';
import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
import type { ServerPublisher } from '../../network/ServerHandler.js';
import { Status } from '../../network/message/Status.js';
import { Command } from '../../network/message/Command.js';
import type { GamePreview } from '../../model/gamePreview.js';
import ErrorWindow from '../shared/windows/MessageWindow.vue';
import ButtonBase from '../shared/ButtonBase.vue';
import PasswordInput from './windows/PasswordInput.vue';
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
    const joinData = ref<{ gameId : number, player : Player, password : string | undefined}>(getJoinDataBaseValue());

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
            password : undefined
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
            console.log("password required");
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
    @close="() => {
        showPlayerMenu = false;
        $emit('close');
    }">
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