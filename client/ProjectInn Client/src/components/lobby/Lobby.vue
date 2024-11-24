<script setup lang="ts">
import GameListRoot from './gamelists/GameListRoot.vue';

    
</script>

<template>
    <div class="pageMargin">
        <header class="title">Project Inn</header>
        <main class="lobby">
            <div class="contentContainer">  
                <GameListRoot title="test"></GameListRoot>
                <GameListRoot title="test2"></GameListRoot>
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