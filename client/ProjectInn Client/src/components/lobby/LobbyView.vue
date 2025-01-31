<script setup lang="ts">
    import { inject, ref, type Ref } from 'vue';
    import DeleteIcon from '../../assets/icons/delete.svg';
    import { SaveManager } from '../../filesystem/SaveManager.js';
    import type { LocalSettings } from '../../model/Game.js';
    import type { Lobby } from '../../model/Lobby.js';
    import type { SavedGame } from '../../model/SavedGame.js';
    import { Command } from '../../network/message/Command.js';
    import { Status } from '../../network/message/Status.js';
    import type { ServerPublisher } from '../../network/ServerPublisher.js';
    import ConfirmAction from '../game/windows/ConfirmAction.vue';
    import ButtonBase from '../shared/ButtonBase.vue';
    import ErrorWindow from '../shared/windows/MessageWindow.vue';
    import LocalGameList from './gamelists/LocalGameList.vue';
    import RemoteGameList from './gamelists/RemoteGameList.vue';
    import JoinGameWizard from './JoinGameWizard.vue';
    import NewGameWizard from './NewGameWizard.vue';
    import GameInfo from './windows/GameInfo.vue';

      
    const failedLoadText = 
    `Your save data is corrupted.
Press the button below to clear it.`;
    
    const showNewGameWizard = ref(false);
    const showJoinGameWizard = ref(false);
    const showDeleteGame = ref(false);
    const joinID : Ref<undefined | number> = ref(undefined);
    const showGameInfo = ref(false);
    const gameInfoId = ref(-1);
    const deletingGame = ref(-1);
    
    const saveManager = new SaveManager();
    const serverPublisher : ServerPublisher = inject("serverPublisher") as ServerPublisher;
    const props = defineProps<{
        lobby : Lobby,
        invalidLocalGames : boolean
    }>();

    const emits = defineEmits<{
        (e : 'deleteGame', id : number) : void,
        (e : 'loadGameSettings', settings : LocalSettings) : void
    }>();

    function clearSaveData(){
        const saveManager = new SaveManager();
        saveManager.clearGameSaves();
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

    function showDeleteGamePopup(id : number){
        deletingGame.value = id;
        showDeleteGame.value = true
    }

    function loadGame(id : number){
        const savedGame : SavedGame | undefined = saveManager.LoadGame(id);
        if(savedGame?.localSettings !== undefined){
            emits("loadGameSettings", savedGame.localSettings);
        }
        serverPublisher.send({
            status : Status.LOAD_GAME,
            command : Command.CREATE,
            content : savedGame?.game
        });
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
                @new-game="showNewGameWizard = true"
                @delete-game-file="showDeleteGamePopup"
                @load-game="loadGame"></LocalGameList>
                <RemoteGameList 
                :remote-games="props.lobby.activeGames"
                @open-game-info="openGameInfo"
                @join-by-id="showJoinGameWizard = true"
                @join-game="joinGame"></RemoteGameList>
            </div>
        </main>
    </div>
    <ConfirmAction
        :show="showDeleteGame"
        action="Delete"
        :destructive="true"
        :icon="DeleteIcon"
        message="Are you sure? the game will be permanently deleted."
        title="Delete game"
        :on-confirm="() => $emit('deleteGame', deletingGame)"
        @close="showDeleteGame = false"
    >
    </ConfirmAction>
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