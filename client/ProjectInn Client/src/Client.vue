<script setup lang="ts">
  import GameView from './components/game/GameView.vue';
  import { WebSocketHandler } from './network/WebsocketHandler.js';
  import { MessageHandler } from './network/MessageHandler.js';
  import { provide, ref, watch, type Ref } from 'vue';
  import type { ServerPublisher } from './network/ServerPublisher.js';
  import type { Game, LocalSettings } from './model/Game.js';
  import type { Lobby } from './model/Lobby.js';
  import LobbyView from './components/lobby/LobbyView.vue';
  import { SaveManager } from './filesystem/SaveManager.js';
  import type { GamePreview } from './model/gamePreview.js';
  import MessageWindow from './components/shared/windows/MessageWindow.vue';
  import ButtonBase from './components/shared/ButtonBase.vue';
  import SceneEditWindow from './components/shared/windows/SceneEditWindow.vue';
  import { Status } from './network/message/Status.js';
  import { Command } from './network/message/Command.js';

  const serverUrl : string = `wss://${window.location.hostname}:23435/`;
  //use ws instead of wss if your server doesn't use secure websockets.
  const showNetworkError = ref(false);
  const game : Ref<Game | undefined> = ref(undefined);
  const serverMessageBuffer : Ref<Array<{title : string, text :string}>> = ref([]);
  const localSettings : Ref<LocalSettings | undefined> = ref(undefined);
  const saveManager : SaveManager = new SaveManager();
  let localGames : Array<GamePreview> = new Array();
  let invalidLocalGames : boolean = false;

  const lobby = ref({
    activeGames : [],
    localGames : localGames
  });
  refreshLocalGames();
  const messageHandler : MessageHandler = new MessageHandler(lobby, game, localSettings, serverMessageBuffer);
  const serverPublisher : ServerPublisher = new WebSocketHandler(
    messageHandler, requestGames, notifyNetworkError, serverUrl);
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

  function loadGameSettings(settings : LocalSettings){
    localSettings.value = settings;
  }

  function refreshLocalGames(){
    try{
      lobby.value.localGames = saveManager.getGameList()
    }catch(e){
      invalidLocalGames = true;
    }
  }

  watch(game, () => {
    refreshLocalGames();
  })

</script>

<template>
  <link rel="preconnect" href="https://rsms.me/">
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
  <LobbyView v-if="game === undefined" 
  :lobby="lobby"
  :invalid-local-games="invalidLocalGames"
  @delete-game="deleteLocalGame"
  @load-game-settings="loadGameSettings"></LobbyView>
  <Transition name="game">
    <GameView v-if="game !== undefined" :game=game></GameView>
  </Transition>
  <MessageWindow v-if="showNetworkError == true" title="Network error" message="Lost connection to the ProjectInn Server.">
    <template v-slot:button>
      <ButtonBase text="Reload page" @click="reloadPage"></ButtonBase>
    </template>
  </MessageWindow>
  <MessageWindow v-if="serverMessageBuffer.length > 0" 
    :title="serverMessageBuffer[0].title" 
    :message="serverMessageBuffer[0].text">
    <template v-slot:button>
      <ButtonBase text="Ok" @click="() => serverMessageBuffer.shift()"></ButtonBase>
    </template>
  </MessageWindow>
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
