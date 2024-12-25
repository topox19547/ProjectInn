<script setup lang="ts">
    import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
    import BoardCanvas from './canvas/BoardCanvas.vue';
    import type { Game } from '../../model/Game.js';
    import { SideBarTab } from './sidebar/sidebarTab.js';
    import Sidebar from './sidebar/Sidebar.vue';
    import Topbar from './topbar/Topbar.vue';
    import { SaveManager } from '../../filesystem/SaveManager.js';
    
    const currentTab = ref(SideBarTab.CHAT);
    const previousTab = ref(SideBarTab.CHAT);
    const sidebarWidth = ref(400);
    const headerHeight = ref(64);
    const canvasSize = ref({ x : 0, y : 0});
    const saveManager = new SaveManager();

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

    watch(() => props.game.viewData.selectedToken,(newToken, oldToken) => {
        if(newToken !== undefined && oldToken === undefined){
            changeTab(SideBarTab.TOKENS);
        } else if (newToken !== undefined && newToken !== oldToken){
            currentTab.value = SideBarTab.TOKENS;
        } else if(newToken === undefined) {
            changeTab(previousTab.value);
        }
    })
</script>

<template>
    <div class="background">
        <div class="mainContent">
            <div class="topbar" :style="{ height : headerHeight + 'px' }">
                <Topbar 
                :game="props.game"></Topbar>
            </div>
            <BoardCanvas 
            :tokens="game.tokens" 
            :token-assets="game.tokenAssets" 
            :current-scene="game.currentScene"
            :local-player="game.localPlayer"
            :players="game.players"
            :view-data="game.viewData"
            rounded="0px 16px 0px 0px" 
            :canvas-size="canvasSize"></BoardCanvas>
            <div class="gameId">
                ProjectInn Beta, Game id : {{ game.id }}
            </div>
        </div>
        <div class="sidebar" :style="{ width : sidebarWidth + 'px'}">
            <Sidebar
            :local-player="game.localPlayer"
            :current-tab="currentTab"
            :previous-tab="previousTab"
            @tab-changed="changeTab"
            :players="game.players"
            :chat="game.chat"
            :assets="game.tokenAssets"
            :view-data="game.viewData"></Sidebar>
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

    .gameId{
        position: absolute;
        bottom: 16px;
        left: 16px;
        color: #FFFFFF;
        pointer-events: none;
        font-weight: bold;
        background: #24242480;
        backdrop-filter: blur(4px);
        padding: 8px;
        border-radius: 8px;
    }
</style>