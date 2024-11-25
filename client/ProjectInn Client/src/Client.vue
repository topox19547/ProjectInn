<script setup lang="ts">
  import GameView from './components/game/GameView.vue';
  import { WebSocketHandler } from './network/WebsocketHandler.js';
  import { MessageHandler } from './network/MessageHandler.js';
  import { provide, ref, type Ref } from 'vue';
  import type { ServerPublisher } from './network/ServerHandler.js';
  import type { Game } from './model/Game.js';
  import type { Lobby } from './model/Lobby.js';
  import LobbyView from './components/lobby/LobbyView.vue';
  import { SaveManager } from './filesystem/SaveManager.js';
  import type { GamePreview } from './model/gamePreview.js';
  import ErrorWindow from './components/shared/windows/ErrorWindow.vue';
  import ButtonBase from './components/shared/ButtonBase.vue';
  
  const failedLoadText = 
  `Your save data is corrupted.
  Press the button below to clear it.`

  const game : Ref<Game | undefined> = ref(undefined);
  const saveManager : SaveManager = new SaveManager();
  let localGames : Array<GamePreview> = new Array();
  let invalidLocalGames : boolean = false;
  try{
    localGames = saveManager.getGameList()
  }catch(e){
    invalidLocalGames = true;
  }
  const lobby : Ref<Lobby> = ref({
    activeGames : [
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
      {name : "pipino", info : "a", id : 2},
    ],
    localGames : localGames
  });
  const messageHandler : MessageHandler = new MessageHandler(lobby,game);
  const serverPublisher : ServerPublisher = new WebSocketHandler(messageHandler);
  provide("serverPublisher", serverPublisher);

  function clearSaveData(){
    const saveManager = new SaveManager();
    saveManager.clearSaves();
    window.location.reload();
  }



</script>

<template>
  <LobbyView :local-games="lobby.localGames" :active-games="lobby.activeGames"></LobbyView>
  <GameView></GameView>
  <ErrorWindow v-if="invalidLocalGames" title="Load error" :message="failedLoadText">
    <template v-slot:button>
      <ButtonBase @click="clearSaveData" text="Clear data"></ButtonBase>
    </template>
  </ErrorWindow>
</template>
<style>
  body{
    background-color: #242424;
  }
  *{
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>
