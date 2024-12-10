<script setup lang="ts">
    import { inject, ref } from 'vue';
    import type { ServerPublisher } from '../../network/ServerHandler.js';
    import { Status } from '../../network/message/Status.js';
    import { Command } from '../../network/message/Command.js';
    import { GridType } from '../../model/GridType.js';
    import { AssetType } from '../../model/AssetType.js';
    import type { Game } from '../../model/Game.js';
    import SceneEditWindow from '../shared/windows/SceneEditWindow.vue';
    import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
    import GameEditWindow from '../shared/windows/GameEditWindow.vue';
    const props = defineProps<{
        showWizard : boolean
    }>();
    const emits = defineEmits<{
        close : void
    }>();
    const newGameData = ref(getStartingGameData());
    const showPlayerMenu = ref(false);
    const showNewGameMenu = ref(false);
    const serverPublisher = inject("serverPublisher") as ServerPublisher;

    function getStartingGameData(){
        return {
            name : "",
            localPlayer : {
                    name: "",
                    color : "#784cff",
                    permissions : {},
                    connected : false,
                    isOwner : false
            },
            currentScene : {
                asset : {
                    name : "starting scene",
                    assetID : 0,
                    assetType : AssetType.SCENE,
                    assetSize : {x : 0, y : 0},
                    assetURL : undefined
                },
                tileSize : 25,
                gridType : GridType.SQUARE,
                offset : {x : 0, y : 0}
            },
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
        console.log(newGameData.value.password)
        console.log("sending")
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
    @close="showPlayerMenu = false"
    ></PlayerEditWindow>
    <GameEditWindow
    :game="newGameData"
    :is-new-game="true"
    :show="showNewGameMenu"
    :on-confirm="sendNewGameInfo"
    @close="showNewGameMenu = false"
    ></GameEditWindow>
</template>
