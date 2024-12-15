<script setup lang="ts">
    import { onMounted, ref, useTemplateRef } from 'vue';
    import BoardCanvas from './canvas/BoardCanvas.vue';
    import type { Game } from '../../model/Game.js';
    import { SideBarTab } from './sidebar/sidebarTab.js';
    import Sidebar from './sidebar/Sidebar.vue';
import Topbar from './topbar/Topbar.vue';
    
    const currentTab = ref(SideBarTab.CHAT);
    const previousTab = ref(SideBarTab.CHAT);
    const sidebarWidth = ref(400);
    const headerHeight = ref(64);
    const canvasSize = ref({ x : 0, y : 0});

    const props = defineProps<{
        game : Game
    }>();
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);


    function setCanvasSize(){
        canvasSize.value.x = window.innerWidth - sidebarWidth.value;
        canvasSize.value.y = window.innerHeight - headerHeight.value;
    }

    function changeTab(tab : SideBarTab){
        previousTab.value = currentTab.value;
        currentTab.value = tab;
    }
    

</script>

<template>
    <div class="background">
        <div class="mainContent">
            <div class="topbar" :style="{ height : headerHeight + 'px' }">
                <Topbar 
                :local-player="game.localPlayer" 
                :current-scene="game.currentScene" 
                :scenes="game.scenes"></Topbar>
            </div>
            <BoardCanvas 
            :tokens="game.tokens" 
            :token-assets="game.tokenAssets" 
            :current-scene="game.currentScene" 
            rounded="0px 16px 0px 0px" 
            :canvas-size="canvasSize"></BoardCanvas>
        </div>
        <div class="sidebar" :style="{ width : sidebarWidth + 'px'}">
            <Sidebar
            :local-player="game.localPlayer"
            :current-tab="currentTab"
            :previous-tab="previousTab"
            @tab-changed="changeTab"
            :players="game.players"
            :chat="game.chat"
            :assets="game.tokenAssets"></Sidebar>
        </div>
    </div>
</template>

<style scoped>
    .background{
        background-color: #242424;
        position: absolute;
        display: flex;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .mainContent{
        padding: 0px;
        margin: 0px;
        width: max-content;
        height: 100%;
    }

    .sidebar{
        background-color: #242424;
        display: flex;
        flex-direction: column;
        max-height: 100%;
        overflow-y: hidden;
    }
</style>