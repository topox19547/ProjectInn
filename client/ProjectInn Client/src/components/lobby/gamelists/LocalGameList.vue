<script setup lang="ts">
    import Add from '../../../assets/icons/add.svg';
    import Delete from '../../../assets/icons/delete.svg';
    import type { GamePreview } from '../../../model/gamePreview.js';
    import FAButton from './FAButton.vue'
    import GameEntry from './GameEntry.vue';
    import GameListRoot from './GameListRoot.vue';
    import NoGamesText from './NoGamesText.vue';

    defineEmits<{
        (e: 'newGame') : void,
        (e: 'deleteGameFile', id : number) : void,
        (e: 'loadGame', id : number) : void
    }>();
    defineProps<{
        localGames : Array<GamePreview>
    }>();
</script>

<template>
    <GameListRoot title="Local games">
        <template v-slot:content>
            <NoGamesText v-if="localGames.length == 0">Looks like you haven't created any games yet...</NoGamesText>
            <GameEntry v-for="game in localGames" :key="game.id" :title="game.name" :game-id="game.id" :info="game.info"
            @click="$emit('loadGame', game.id)">
                <template v-slot:actions>
                    <img :src=Delete class="deleteButton" @click.stop="$emit('deleteGameFile', game.id)">
                </template>
            </GameEntry>
            <div class="spacer" v-if="localGames.length > 0"></div>
        </template>
        <template v-slot:fab>
            <FAButton text="New game" :icon=Add @click="$emit('newGame')"></FAButton>
        </template>
    </GameListRoot>
</template>

<style scoped>
    .deleteButton{
        width: 24px;
    }
    .deleteButton:hover{
        opacity: 75%;
    }
    .spacer{
        height: 64px;
    }
</style>
