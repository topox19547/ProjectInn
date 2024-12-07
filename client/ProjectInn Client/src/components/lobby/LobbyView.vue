<script setup lang="ts">
    import { SaveManager } from '../../filesystem/SaveManager.js';
    import type { Lobby } from '../../model/Lobby.js';
    import WindowBase from '../shared/WindowBase.vue';
    import ErrorWindow from '../shared/windows/ErrorWindow.vue';
    import SceneEditWindow from '../shared/windows/SceneEditWindow.vue';
    import ButtonBase from '../shared/ButtonBase.vue';
    import LocalGameList from './gamelists/LocalGameList.vue';
    import RemoteGameList from './gamelists/RemoteGameList.vue';
    import { inject, ref } from 'vue';
    import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
import type { Game } from '../../model/Game.js';
import { GridType } from '../../model/GridType.js';
import { AssetType } from '../../model/AssetType.js';
import GameEditWindow from '../shared/windows/GameEditWindow.vue';
import type { ServerPublisher } from '../../network/ServerHandler.js';
import { parseJsonSourceFileConfigFileContent } from 'typescript';
import { Status } from '../../network/message/Status.js';
import { Command } from '../../network/message/Command.js';
import { Vector2 } from '../../types/Vector2.js';
import GameInfo from './windows/gameInfoWindow/GameInfo.vue';

      
    const failedLoadText = 
    `Your save data is corrupted.
Press the button below to clear it.`;
    
    const showNewSceneMenu = ref(false);
    const showPlayerMenu = ref(false);
    const showNewGameMenu = ref(false);
    const showGameInfo = ref(false);
    const gameInfoId = ref(-1);
    const newGameData = ref<Game>(getStartingGameData());
    const serverPublisher : ServerPublisher = inject("serverPublisher") as ServerPublisher;
    const props = defineProps<{
        lobby : Lobby,
        invalidLocalGames : boolean
    }>();

    function clearSaveData(){
        const saveManager = new SaveManager();
        saveManager.clearSaves();
        window.location.reload();
    }

    function getStartingGameData() : Game{
        return {
            name : "",
            ownerName : "",
            players : [
                {
                    name: "",
                    color : "#303f9f", //pretty purple :3
                    permissions : {},
                    connected : false
                }
            ],
            scenes : [],
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
            chat : [],
            tokenAssets : [],
            tokens : [],
            password : undefined
        }
    }

    function goToPlayerEditor(){
        showNewSceneMenu.value = false;
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
                username : newGameData.value.players[0].name,
                playerColor : newGameData.value.players[0].color,
                gameName : newGameData.value.name,
                password : newGameData.value.password,
                scene : newGameData.value.currentScene
            }
        })
    }
    
    function openGameInfo(id : number){
        gameInfoId.value = id;
        showGameInfo.value = true;
    }
</script>

<template>
    <ErrorWindow v-if="invalidLocalGames" title="Load error" :message="failedLoadText">
        <template v-slot:button>
            <ButtonBase @click="clearSaveData" text="Clear data"></ButtonBase>
        </template>
    </ErrorWindow>
    <SceneEditWindow 
    title="Starting Scene" 
    :scene="newGameData.currentScene"
    :on-confirm="goToPlayerEditor" 
    :show="showNewSceneMenu"
    @close="showNewSceneMenu = false"
    ></SceneEditWindow>
    <PlayerEditWindow
    :player="newGameData.players[0]"
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
    <GameInfo
    :game-id="gameInfoId"
    :show="showGameInfo"
    @close="showGameInfo = false"
    ></GameInfo>
    <div class="pageMargin">
        <header class="title">Project Inn</header>
        <main class="lobby">
            <div class="contentContainer">  
                <LocalGameList :local-games="props.lobby.localGames"  @new-game="showNewSceneMenu = true"></LocalGameList>
                <RemoteGameList :remote-games="props.lobby.activeGames" @open-game-info="openGameInfo"></RemoteGameList>
            </div>
        </main>
    </div>
</template>

<style scoped>
    .title {
        text-align: left;
        font-size: 42px;
        font-weight: bold;
        margin-top: 32px;
        color: #D9D9D9;
        margin-left: 16px;
    }
    .pageMargin{
        max-width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }
    .contentContainer{
        margin-top: 64px;
        display: flex;
        gap: 64px;
        flex-wrap: wrap;
        justify-content: space-around;
    }
</style>