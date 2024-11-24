<script setup lang="ts">
    import Fab from './Fab.vue';
    import GameEntry from './GameEntry.vue';
    import GameListRoot from './GameListRoot.vue';
    import Login from '../../../assets/icons/login.svg';
    import Info from '../../../assets/icons/info.svg';
    const emits = defineEmits<{
        (e: 'openGameInfo', id : number) : void,
        (e: 'joinGame', id : number) : void
    }>();
    const props = defineProps<{
        remoteGames : Array<GamePreview>
    }>();
</script>

<template>
    <GameListRoot title="Ongoing games">
        <template v-slot:content>
            <GameEntry v-for="game in remoteGames" :title="game.name" :game-id="game.id" :info="game.info" 
            @click="$emit('joinGame',game.id)">
                <template v-slot:actions>
                    <img :src=Info class="infoButton" @click.stop="$emit('openGameInfo', game.id)">
                </template>
            </GameEntry>
        </template>
        <template v-slot:fab>
            <Fab text="Join with ID" :icon=Login></Fab>
        </template>
    </GameListRoot>
</template>


<style scoped>
    .infoButton{
        width: 24px;
    }
    .infoButton:hover{
        opacity: 75%;
    }
</style>