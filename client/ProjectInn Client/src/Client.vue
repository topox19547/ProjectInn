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
  import SceneEditWindow from './components/shared/windows/SceneEditWindow.vue';
  import { Status } from './network/message/Status.js';
  import { Command } from './network/message/Command.js';

  const showNetworkError = ref(false);
  const game : Ref<Game | undefined> = ref(undefined);
  const saveManager : SaveManager = new SaveManager();
  let localGames : Array<GamePreview> = new Array();
  let invalidLocalGames : boolean = false;

  const lobby = ref({
    activeGames : [],
    localGames : localGames
  });
  refreshLocalGames();
  const messageHandler : MessageHandler = new MessageHandler(lobby,game);
  const serverPublisher : ServerPublisher = new WebSocketHandler(messageHandler,requestGames,notifyNetworkError);
  provide("serverPublisher", serverPublisher);

  function requestGames(){
    serverPublisher.send(
      {
        status : Status.LOBBY_UPDATE,
        command : Command.NONE,
        content : {}
      }
    )
  }

  function notifyNetworkError(){
    console.log("network error detected");
    showNetworkError.value = true;
  }

  function reloadPage(){
    window.location.reload();
  }

  function deleteLocalGame(id : number){
    saveManager.DeleteGame(id);
    refreshLocalGames();
  }

  function refreshLocalGames(){
    try{
      lobby.value.localGames = saveManager.getGameList()
    }catch(e){
      invalidLocalGames = true;
    }
  }

</script>

<template>
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <LobbyView v-if="game === undefined" 
  :lobby="lobby"
  :invalid-local-games="invalidLocalGames"
  @delete-game="deleteLocalGame"></LobbyView>
  <Transition name="game">
    <GameView v-if="game !== undefined" :game=game></GameView>
  </Transition>
  <ErrorWindow v-if="showNetworkError == true" title="Network error" message="Couldn't connect to the ProjectInn Server.">
    <template v-slot:button>
      <ButtonBase text="Reload page" @click="reloadPage"></ButtonBase>
    </template>
  </ErrorWindow>
</template>
<style>
  body{
    background-color: #242424;
  }
  *{
    font-family: Inter, sans-serif;
    font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */
  }
  body:has(.windowBackground){
    overflow: hidden;
  }
</style>

<style scoped>
  .game-enter-active,
  .game-leave-active{
      transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
  }

  .game-enter-from,
  .game-leave-to {
      opacity: 0;
      transform: translate(0px, 500px);
  }
</style>
