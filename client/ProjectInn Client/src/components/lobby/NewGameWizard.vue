<script setup lang="ts">
    import { inject, ref } from 'vue';
    import { SaveManager } from '../../filesystem/SaveManager.js';
    import type { ServerPublisher } from '../../network/ServerPublisher.js';
    import { Command } from '../../network/message/Command.js';
    import { Status } from '../../network/message/Status.js';
    import ButtonBase from '../shared/ButtonBase.vue';
    import GameEditWindow from '../shared/windows/GameEditWindow.vue';
    import ErrorWindow from '../shared/windows/MessageWindow.vue';
    import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
    import SceneEditWindow from '../shared/windows/SceneEditWindow.vue';
    import { getStartingGameData, type GameSettings } from '../../model/Game.js';
    import type { Player } from '../../model/Player.js';
    import type { Scene } from '../../model/Scene.js';
    defineProps<{
        showWizard : boolean
    }>();
    const emits = defineEmits<{
        (e : "close") : void
    }>();
    const sameNameError = ref(false);
    const newGameData = ref(getStartingGameData());
    const showPlayerMenu = ref(false);
    const showNewGameMenu = ref(false);
    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const saveManager = new SaveManager();

    function goToPlayerEditor(scene : Scene){
        newGameData.value.currentScene = scene;
        showPlayerMenu.value = true;
        emits("close");
    }

    function goToGameEditor(player : Player){
        newGameData.value.localPlayer = player;
        showPlayerMenu.value = false;
        showNewGameMenu.value = true;
    }

    function sendNewGameInfo(gameSettings : GameSettings){
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
                gameName : gameSettings.name,
                password : gameSettings.password,
                scene : newGameData.value.currentScene
            }
        })
    }
</script>

<template>
     <SceneEditWindow
    title="Starting Scene"
    :scene="newGameData.currentScene"
    @confirm="goToPlayerEditor"
    :show="showWizard"
    @close = "emits('close')"
    ></SceneEditWindow>
    <PlayerEditWindow
    :player="newGameData.localPlayer"
    :show="showPlayerMenu"
    @confirm="goToGameEditor"
    :force-new-player="true"
    @close="showPlayerMenu = false"
    ></PlayerEditWindow>
    <GameEditWindow
    :gameSettings="newGameData"
    :is-new-game="true"
    :enable-save-management="false"
    :show="showNewGameMenu"
    confirm-text="Next"
    @confirm="sendNewGameInfo"
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
