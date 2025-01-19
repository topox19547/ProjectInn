<script setup lang="ts">
  import { inject, ref} from 'vue';
  import IdInput from './windows/IdInput.vue';
  import PlayerEditWindow from '../shared/windows/PlayerEditWindow.vue';
  import type { ServerPublisher } from '../../network/ServerPublisher.js';
  import { Status } from '../../network/message/Status.js';
  import { Command } from '../../network/message/Command.js';
  import type { GamePreview } from '../../model/gamePreview.js';
  import ErrorWindow from '../shared/windows/MessageWindow.vue';
  import ButtonBase from '../shared/ButtonBase.vue';
  import PasswordInput from './windows/PasswordInput.vue';
import type { Player } from '../../model/Player.js';
  const emits = defineEmits<{
      (e : "close") : boolean
  }>();

  const props = defineProps<{
      joinID : undefined | number
      showWizard : boolean
      activeGames : Array<GamePreview>
  }>();

  const serverPublisher = inject("serverPublisher") as ServerPublisher;
  const showJoinError = ref(false);
  const showPasswordScreen = ref(false);
  const showPlayerMenu = ref(false);
  const joinData = ref(getJoinDataBaseValue());
  type joinData = {
    gameId : number,
    player : Player,
    password : string | undefined,
    enterAsNewPlayer : boolean
  }

  function getJoinDataBaseValue() : joinData{
      return {
          gameId : 0,
          player : {
              name: '',
              color : "#784cff",
              permissions: {},
              connected: false,
              isOwner : false
          },
          password : undefined,
          enterAsNewPlayer : true
      }
  }

  function submitJoinData(player : Player){
      joinData.value.gameId = props.joinID !== undefined ? props.joinID : joinData.value.gameId;
      joinData.value.player = player;
      showPlayerMenu.value = false;
      const game : GamePreview | undefined = props.activeGames.find(g => g.id == joinData.value.gameId);
      if(game === undefined){
          showJoinError.value = true;
          return;
      }
      emits('close');
      if(game.private == true){
          showPasswordScreen.value = true;
          return;
      }
      serverPublisher.send({
          status : Status.JOIN_GAME,
          command : Command.NONE,
          content : {
              gameId : joinData.value.gameId,
              username : joinData.value.player.name,
              playerColor : joinData.value.player.color,
              newPlayer : joinData.value.enterAsNewPlayer,
              password : undefined
          }
      });
      joinData.value = getJoinDataBaseValue();
  }

  function submitJoinDataPassword(password : string | undefined){
      joinData.value.password = password;
      if(joinData.value.password === undefined){
          return;
      }
      serverPublisher.send({
          status : Status.JOIN_GAME,
          command : Command.NONE,
          content : {
              gameId : joinData.value.gameId,
              username : joinData.value.player.name,
              playerColor : joinData.value.player.color,
              newPlayer : joinData.value.enterAsNewPlayer,
              password : joinData.value.password
          }
      });
      joinData.value = getJoinDataBaseValue();
      emits('close');
  }

  function hideError(){
      emits('close');
      showJoinError.value = false;
  }

  function goToPlayerEditor(gameId : number){
      joinData.value.gameId = gameId;
      showPlayerMenu.value = true;
      emits('close');
  }

  function hidePlayerEditor(){
      showPlayerMenu.value = false;
      emits('close');
  }

</script>

<template>
    <ErrorWindow v-if="showJoinError"
    title="ID Error"
    :message="`Couldn't find any game with the ID: ${ joinData.gameId }`" >
        <template v-slot:button>
            <ButtonBase
            text="Ok"
            width="100px"
            @click="hideError"></ButtonBase>
        </template>
    </ErrorWindow>
    <IdInput
    :game-id="joinData.gameId"
    @confirm="goToPlayerEditor"
    :show="showWizard && joinID === undefined"
    @close="emits('close')">
    </IdInput>
    <PlayerEditWindow
    :player="joinData.player"
    :show="showPlayerMenu || showWizard && joinID !== undefined"
    :force-new-player="false"
    @close="hidePlayerEditor"
    @change-new-player-status="s => joinData.enterAsNewPlayer = s"
    @confirm="submitJoinData">
    </PlayerEditWindow>
    <PasswordInput
    :password="joinData.password"
    @confirm="submitJoinDataPassword"
    :show="showPasswordScreen"
    @close="showPasswordScreen = false"
    ></PasswordInput>
</template>

<style scoped>

</style>
