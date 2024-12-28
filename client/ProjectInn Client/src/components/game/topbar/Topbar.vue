<script setup lang="ts">
    import { inject, ref, watch } from 'vue';
    import LeaveIcon from '../../../assets/icons/leave.svg';
    import SaveIcon from '../../../assets/icons/save.svg';
    import SceneIcon from "../../../assets/icons/scene.svg";
    import SettingsIcon from '../../../assets/icons/settings.svg';
    import type { Game } from '../../../model/Game.js';
    import { Permission } from '../../../model/Permission.js';
    import { Command } from '../../../network/message/Command.js';
    import { Status } from '../../../network/message/Status.js';
    import type { ServerPublisher } from '../../../network/ServerHandler.js';
    import GameEditWindow from '../../shared/windows/GameEditWindow.vue';
    import ConfirmAction from '../windows/ConfirmAction.vue';
    import Scenes from '../windows/Scenes.vue';

    const showSceneMenu = ref(false);
    const showGameSettings = ref(false);
    const showSaveGamePopUp = ref(false);
    const showLeaveGamePopup = ref(false);
    const saveOnLeave = ref(true);
    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const autosaveTimeInterval = 60000; //save every minute
    let autosaveInterval = -1;

    const props = defineProps<{
        game : Game
    }>();

    const gameDataCopy = ref(copyGameData());

    function editGameSettings(){
        props.game.localSettings = gameDataCopy.value.localSettings
        if(gameDataCopy.value.password != props.game.password){
            serverPublisher.send({
                status : Status.PASSWORD_CHANGE,
                command : Command.MODIFY,
                content : { password : gameDataCopy.value.password } 
             });
        }
        showGameSettings.value = false;
    }

    function copyGameData(){
        return {
            name : props.game.name,
            password : props.game.password,
            localSettings : {
                autoSaveEnabled : props.game.localSettings.autoSaveEnabled
            }
        };
    }

    function requestGameSave(notifyUser : boolean){
        serverPublisher.send({
            status : Status.SAVE_GAME,
            command : Command.NONE,
            content : {
                show : notifyUser
            }
        });
    }

    function leaveGame(){
        if(saveOnLeave.value == true){
            requestGameSave(false);
        }
        if(props.game.localPlayer.isOwner){
            serverPublisher.send({
            status : Status.GAME_END,
            command : Command.DELETE,
            content : {}
        });
        } else {
            serverPublisher.send({
            status : Status.CLIENT_STATUS,
            command : Command.DELETE,
            content : {}
        });
        }
    }

    function closeLeaveGame(){
        showLeaveGamePopup.value = false;
        saveOnLeave.value = true;
    }

    watch(() => props.game.localSettings.autoSaveEnabled,(autosaveEnabled) => {
        if(autosaveEnabled){
            requestGameSave(false);
            autosaveInterval = setInterval(() => requestGameSave(false), autosaveTimeInterval);
        } else {
            clearInterval(autosaveInterval);
        }
    }, {immediate : true})

    watch(showGameSettings, () => {
        gameDataCopy.value = copyGameData()
    })

</script>

<template>
    <div class="topbarContent">
        <div class="topbarButton" @click="showLeaveGamePopup = true">
            <img :src="LeaveIcon">
            <div>{{game.localPlayer.isOwner ? 'End Game' : 'Leave Room'}}</div>
        </div>
        <div class="topbarButton"
        v-if="game.localPlayer.isOwner" @click="() => requestGameSave(true)">
            <img :src="SaveIcon">
            <div>Save Game</div>
        </div>
        <div class="topbarButton" @click="showGameSettings = true"
        v-if="game.localPlayer.permissions[Permission.MASTER]">
            <img :src="SettingsIcon">
            <div>Game Settings</div>
        </div>
        <div class="topbarButton" @click="showSceneMenu = true" 
        v-if="game.localPlayer.permissions[Permission.MANAGE_SCENES]">
            <img :src="SceneIcon">
            <div>Scenes</div>
        </div>
    </div>
    <Scenes 
    :scenes="game.scenes" 
    :current-scene="game.currentScene" 
    :show="showSceneMenu" 
    @close="showSceneMenu = false"
    @show="showSceneMenu = true"></Scenes>
    <GameEditWindow
    :is-new-game="false"
    :enable-save-management="game.localPlayer.isOwner"
    :game="gameDataCopy"
    :show="showGameSettings"
    confirm-text="Save"
    :on-confirm="editGameSettings"
    @close="showGameSettings = false"
    ></GameEditWindow>
    <ConfirmAction
    action="Ok"
    :destructive="false"
    :icon="SaveIcon"
    message="The game has been saved"
    title="Save"
    :show="showSaveGamePopUp"
    :on-confirm="() => showSaveGamePopUp = false">
    </ConfirmAction>
    <ConfirmAction
    :action="props.game.localPlayer.isOwner ?'End Game' : 'Leave'"
    :destructive="false"
    :icon="LeaveIcon"
    :message="props.game.localPlayer.isOwner ?
        'Are you sure you want to end the game?' :
        'Are you sure you want to leave the game?'"
    :title="props.game.localPlayer.isOwner ?'End Game' : 'Leave'"
    :show="showLeaveGamePopup"
    :on-confirm="leaveGame"
    @close="closeLeaveGame">
        <template v-slot:additionalContent>
            <div class="section" v-if="game.localPlayer.isOwner">
                <div class="inputTitle">Save the game before ending it:</div>
                <input class="toggle" v-model="saveOnLeave" type="checkbox">
            </div>
        </template>
    </ConfirmAction>
</template>

<style scoped>
    .topbarContent{
        display: flex;
        padding-inline: 16px;
        gap:32px;
        align-items: center;
        color: #d9d9d9;
        user-select: none;
        width: 100%;
        height: 100%;
    }

    .topbarButton{
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .topbarButton:hover{
        opacity: 0.75;
    }

    .section{
        display: flex;
        justify-content: space-between;
        accent-color:#303F9F;
        padding-inline: 16px;
        padding-top: 8px;
        gap:8px;
        font-weight: bold;
    }

</style>