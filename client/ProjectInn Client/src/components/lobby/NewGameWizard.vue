<script setup lang="ts">
    import { inject, ref } from 'vue';
    import { SaveManager } from '../../filesystem/SaveManager.js';
    import { getStartingPlayerData } from '../../model/Player.js';
    import { getStartingSceneData } from '../../model/Scene.js';
    import type { ServerPublisher } from '../../network/ServerPublisher.js';
    import { Command } from '../../network/message/Command.js';
    import { Status } from '../../network/message/Status.js';
    import ButtonBase from '../shared/ButtonBase.vue';
    import GameEditWindow from '../shared/windows/GameEditWindow.vue';
    import ErrorWindow from '../shared/windows/MessageWindow.vue';
    import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
    import SceneEditWindow from '../shared/windows/SceneEditWindow.vue';
    defineProps<{
        showWizard : boolean
    }>();
    defineEmits<{
        close : void
    }>();
    const sameNameError = ref(false);
    const newGameData = ref(getStartingGameData());
    const showPlayerMenu = ref(false);
    const showNewGameMenu = ref(false);
    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const saveManager = new SaveManager();

    function getStartingGameData(){
        return {
            name : "",
            localPlayer : getStartingPlayerData(),
            currentScene : getStartingSceneData(),
            password : undefined
        }
    }

    function goToPlayerEditor(){
        showPlayerMenu.value = true;
    }

    function goToGameEditor(){
        showPlayerMenu.value = false;
        showNewGameMenu.value = true;
    }

    function sendNewGameInfo(){
        if(saveManager.getGameList().find(g => g.name == newGameData.value.name)){
            sameNameError.value = true;
            return;
        }
        serverPublisher.send({
            status : Status.CREATE_GAME,
            command : Command.CREATE,
            content : {
                username : newGameData.value.localPlayer.name,
                playerColor : newGameData.value.localPlayer.color,
                gameName : newGameData.value.name,
                password : newGameData.value.password,
                scene : newGameData.value.currentScene
            }
        })
    }
</script>

<template>
     <SceneEditWindow
    title="Starting Scene"
    :scene="newGameData.currentScene"
    :on-confirm="() => {
        goToPlayerEditor();
        $emit('close');
    }"
    :show="showWizard"
    @close = "$emit('close')"
    ></SceneEditWindow>
    <PlayerEditWindow
    :player="newGameData.localPlayer"
    :show="showPlayerMenu"
    :on-confirm="goToGameEditor"
    :force-new-player="true"
    @close="showPlayerMenu = false"
    ></PlayerEditWindow>
    <GameEditWindow
    :game="newGameData"
    :is-new-game="true"
    :enable-save-management="false"
    :show="showNewGameMenu"
    confirm-text="Next"
    :on-confirm="sendNewGameInfo"
    @close="showNewGameMenu = false"
    ></GameEditWindow>
    <ErrorWindow v-if="sameNameError"
        title="Error"
        message="You already have a game with the same name">
        <template v-slot:button>
            <ButtonBase
            text="Ok"
            @click="() => sameNameError = false"
            ></ButtonBase>
        </template>
    </ErrorWindow>
</template>
