<script setup lang="ts">
  import GameView from './components/game/GameView.vue';
  import { WebSocketHandler } from './network/WebsocketHandler.js';
  import { MessageHandler } from './network/MessageHandler.js';
  import { provide, ref, type Ref } from 'vue';
  import type { ServerPublisher } from './network/ServerHandler.js';
  import type { Game } from './model/Game.js';
  import type { Lobby } from './model/Lobby.js';
  import LobbyView from './components/lobby/LobbyView.vue';
  
  const lobby : Ref<Lobby> = ref({
    activeGames : [],
    localGames : []
  });
  const game : Ref<Game | undefined> = ref(undefined);
  const messageHandler : MessageHandler = new MessageHandler(lobby,game);
  const serverPublisher : ServerPublisher = new WebSocketHandler(messageHandler);
  provide("serverPublisher", serverPublisher);




</script>

<template>
  <LobbyView :local-games="lobby.localGames" :active-games="lobby.activeGames"></LobbyView>
  <GameView></GameView>
</template>

<style>
  body{
    background-color: #242424;
  }
  *{
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>
