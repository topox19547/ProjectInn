<script setup lang="ts">
    import GameListRoot from './gamelists/GameListRoot.vue';
    import LocalGameList from './gamelists/LocalGameList.vue';
    import RemoteGameList from './gamelists/RemoteGameList.vue';

    
</script>

<template>
    <div class="pageMargin">
        <header class="title">Project Inn</header>
        <main class="lobby">
            <div class="contentContainer">  
                <LocalGameList :local-games="[{name:'a',id:1,info:'s'}]"></LocalGameList>
                <RemoteGameList :remote-games="[{name:'a',id:1,info:'s'}]"></RemoteGameList>
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