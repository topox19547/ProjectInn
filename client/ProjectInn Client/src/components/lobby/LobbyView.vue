<script setup lang="ts">
    import { SaveManager } from '../../filesystem/SaveManager.js';
    import type { Lobby } from '../../model/Lobby.js';
    import WindowBase from '../shared/WindowBase.vue';
    import ErrorWindow from '../shared/windows/ErrorWindow.vue';
    import SceneEditWindow from '../shared/windows/SceneEditWindow.vue';
    import ButtonBase from '../shared/ButtonBase.vue';
    import LocalGameList from './gamelists/LocalGameList.vue';
    import RemoteGameList from './gamelists/RemoteGameList.vue';
    import { inject, ref, type Ref } from 'vue';
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
import GameInfo from './windows/GameInfo.vue';
import NewGameWizard from './NewGameWizard.vue';
import JoinGameWizard from './JoinGameWizard.vue';

      
    const failedLoadText = 
    `Your save data is corrupted.
Press the button below to clear it.`;
    
    const showNewGameWizard = ref(false);
    const showJoinGameWizard = ref(false);
    const joinID : Ref<undefined | number> = ref(undefined);
    const showGameInfo = ref(false);
    const gameInfoId = ref(-1);
    
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

    function openGameInfo(id : number){
        gameInfoId.value = id;
        showGameInfo.value = true;
    }

    function joinGame(id : number){
        joinID.value = id;
        showJoinGameWizard.value = true;
    }

    function closeJoinGameWizard(){
        joinID.value = undefined;
        showJoinGameWizard.value = false;
    }
</script>

<template>
    <ErrorWindow v-if="invalidLocalGames" title="Load error" :message="failedLoadText">
        <template v-slot:button>
            <ButtonBase @click="clearSaveData" text="Clear data"></ButtonBase>
        </template>
    </ErrorWindow>
    <NewGameWizard :show-wizard="showNewGameWizard" @close="showNewGameWizard = false">
    </NewGameWizard>
    <JoinGameWizard
    :join-i-d="joinID"
    :show-wizard="showJoinGameWizard" 
    :active-games="lobby.activeGames" 
    @close="closeJoinGameWizard()">
    </JoinGameWizard>
    <GameInfo
    :game-id="gameInfoId"
    :show="showGameInfo"
    @close="showGameInfo = false"
    ></GameInfo>
    <div class="pageMargin">
        <header class="title">Project Inn</header>
        <main class="lobby">
            <div class="contentContainer">  
                <LocalGameList 
                :local-games="props.lobby.localGames"
                @new-game="showNewGameWizard = true"></LocalGameList>
                <RemoteGameList 
                :remote-games="props.lobby.activeGames"
                @open-game-info="openGameInfo"
                @join-by-id="showJoinGameWizard = true"
                @join-game="joinGame"></RemoteGameList>
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