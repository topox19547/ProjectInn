<script setup lang="ts">
    import type { Lobby } from '../../model/Lobby.js';
    import WindowBase from '../shared/WindowBase.vue';
    import LocalGameList from './gamelists/LocalGameList.vue';
    import RemoteGameList from './gamelists/RemoteGameList.vue';
    
    const props = defineProps<Lobby>();
</script>

<template>
    <div class="pageMargin">
        <header class="title">Project Inn</header>
        <main class="lobby">
            <div class="contentContainer">  
                <LocalGameList :local-games="props.localGames"></LocalGameList>
                <RemoteGameList :remote-games="props.activeGames"></RemoteGameList>
                <WindowBase windowWidth="700px" windowHeight="300px"></WindowBase>
            </div>
        </main>
    </div> 
</template>

<style scoped>
    .title {
        text-align: left;
        font-size: 42px;
        font-weight: bold;
        margin-top: 32px;
        color: #D9D9D9;
        margin-left: 16px;
    }
    .pageMargin{
        max-width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }
    .contentContainer{
        margin-top: 64px;
        display: flex;
        gap: 64px;
        flex-wrap: wrap;
        justify-content: space-around;
    }
</style>