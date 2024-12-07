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
    activeGames : [],
    localGames : localGames
  });
  const messageHandler : MessageHandler = new MessageHandler(lobby,game);
  const serverPublisher : ServerPublisher = new WebSocketHandler(messageHandler,requestGames);
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
</script>

<template>
  <LobbyView v-if="game === undefined" 
  :lobby="lobby"
  :invalid-local-games="invalidLocalGames"></LobbyView>
  <GameView v-if="game !== undefined"></GameView>
</template>
<style>
  body{
    background-color: #242424;
  }
  *{
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  body:has(.windowBackground){
    overflow: hidden;
  }
</style>
