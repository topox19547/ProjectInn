<script setup lang="ts">
import GameList from './gamelists/GameList.vue';

    
</script>

<template>
    <div class="pageMargin">
        <header class="title">Project Inn</header>
        <main class="lobby">
            <div class="contentContainer">
                <GameList></GameList>
                <GameList></GameList>
            </div>
        </main>
    </div> 
</template>

<style scoped>
    .title {
        text-align: left;
        font-size: 48px;
        font-weight: bold;
        color: #D9D9D9;
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
    }
</style>