<script setup lang="ts">
    import Fab from './Fab.vue';
    import GameEntry from './GameEntry.vue';
    import GameListRoot from './GameListRoot.vue';
    import Add from '../../../assets/icons/add.svg';
    import Delete from '../../../assets/icons/delete.svg';
    const emits = defineEmits<{
        (e: 'newGame') : void,
        (e: 'deleteGameFile', id : number) : void,
        (e: 'loadGame', id : number) : void
    }>();
    const props = defineProps<{
        localGames : Array<GamePreview>
    }>();
</script>

<template>
    <GameListRoot title="Local games">
        <template v-slot:content>
            <GameEntry v-for="game in localGames" :title="game.name" :game-id="game.id" :info="game.info" 
            @click="$emit('loadGame',game.id)">
                <template v-slot:actions>
                    <img :src=Delete class="deleteButton" @click.stop="$emit('deleteGameFile', game.id)">
                </template>
            </GameEntry>
        </template>
        <template v-slot:fab>
            <Fab text="New game" :icon=Add @click="$emit('newGame')"></Fab>
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
</style>