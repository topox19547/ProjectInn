<script setup lang="ts">
  import Lobby from './components/lobby/Lobby.vue';
  import GameView from './components/game/GameView.vue';
  import { WebSocketHandler } from './network/WebsocketHandler.js';
  import { MessageHandler } from './network/MessageHandler.js';
  import { ref, type Ref } from 'vue';
  import type { ServerPublisher } from './network/ServerHandler.js';
  import type { Game } from './model/Game.js';
  
  const lobby : Ref<Lobby> = ref({
    activeGames : [],
    localGames : []
  });
  const game : Ref<Game | undefined> = ref(undefined);
  const messageHandler : MessageHandler = new MessageHandler(lobby,game);
  const serverPublisher : ServerPublisher = new WebSocketHandler(messageHandler);




</script>

<template>
  <Lobby></Lobby>
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
