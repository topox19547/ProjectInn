<script setup lang="ts">
    import { ref, watch } from 'vue';
    import BoardSettingsIcon from '../../assets/icons/boardSettings.svg';
    import { SaveManager } from '../../filesystem/SaveManager.js';
    import type { Game } from '../../model/Game.js';
    import { getDefaultGlobalSettings } from '../../model/GlobalSettings.js';
    import ButtonBase from '../shared/ButtonBase.vue';
    import ErrorWindow from '../shared/windows/MessageWindow.vue';
    import BoardCanvas from './canvas/BoardCanvas.vue';
    import SideBar from './sidebar/SideBar.vue';
    import { SideBarTab } from './sidebar/sidebarTab.js';
    import TopBar from './topbar/TopBar.vue';
    import BoardSettings from './windows/BoardSettings.vue';

    const loadError = ref(false);
    const currentTab = ref(SideBarTab.CHAT);
    const savedTab = ref(SideBarTab.CHAT);
    const sidebarWidth = ref(400);
    const headerHeight = ref(64);
    const canvasSize = ref({ x : 0, y : 0});
    const saveManager = new SaveManager();
    const showBoardSettings = ref(false);
    const globalSettings = ref(getDefaultGlobalSettings());
    const loadedSettings = saveManager.loadSettings();
    if(loadedSettings !== undefined){
        globalSettings.value = loadedSettings;
    }

    const props = defineProps<{
        game : Game
    }>();

    const emits = defineEmits<{
      (e : "resetSelectedToken") : void
    }>();

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    function setShowNames(value : boolean){
        globalSettings.value.showNames = value;
        saveManager.saveSettings(globalSettings.value);
    }

    function setShowStats(value : boolean){
        globalSettings.value.showStats = value;
        saveManager.saveSettings(globalSettings.value);
    }

    function setCanvasSize(){
        canvasSize.value.x = window.innerWidth - sidebarWidth.value;
        canvasSize.value.y = window.innerHeight - headerHeight.value;
    }

    function manualTabChange(tab : SideBarTab){
        if(props.game.viewData.selectedToken !== undefined){
            savedTab.value = tab;
            emits("resetSelectedToken");
        } else {
            changeTab(tab);
        }
    }

    function changeTab(tab : SideBarTab){
        savedTab.value = currentTab.value;
        currentTab.value = tab;
    }

    watch(() => props.game.viewData.selectedToken,(newToken, oldToken) => {
        if(newToken !== undefined && oldToken === undefined){
            changeTab(SideBarTab.TOKENS);
        } else if (newToken !== undefined && newToken !== oldToken){
            currentTab.value = SideBarTab.TOKENS;
        } else if(newToken === undefined) {
            changeTab(savedTab.value);
        }
    })
</script>

<template>
    <div class="background">
        <div class="mainContent">
            <div class="topbar" :style="{ height : headerHeight + 'px' }">
                <TopBar
                :game="props.game"></TopBar>
            </div>
            <BoardCanvas @mousedown="showBoardSettings = false"
            :tokens="game.tokens"
            :token-assets="game.tokenAssets"
            :current-scene="game.currentScene"
            :local-player="game.localPlayer"
            :players="game.players"
            :view-data="game.viewData"
            :global-settings="globalSettings"
            rounded="0px 16px 0px 0px"
            :on-load-error="() => loadError = true"
            :canvas-size="canvasSize"></BoardCanvas>
            <div class="gameId">
                <div>
                    ProjectInn Beta, Game id : {{ game.id }}
                </div>
            </div>
            <BoardSettings :global-settings="globalSettings"
             :show="showBoardSettings"
             @change-show-names="setShowNames"
             @change-show-stats="setShowStats"></BoardSettings>
            <div class="boardSettingsButton" @click="showBoardSettings = !showBoardSettings">
                <img :src="BoardSettingsIcon">
            </div>
        </div>
        <div class="sidebar" :style="{ width : sidebarWidth + 'px'}">
            <SideBar
            :local-player="game.localPlayer"
            :current-tab="currentTab"
            :previous-tab="savedTab"
            @tab-changed="manualTabChange"
            :players="game.players"
            :chat="game.chat"
            :assets="game.tokenAssets"
            :view-data="game.viewData"></SideBar>
        </div>
        <ErrorWindow title="Load error"
        message="unable to load the current scene. please try joining again" v-if="loadError">
            <template v-slot:button>
                <ButtonBase text="Ok" @click="loadError = false"></ButtonBase>
            </template>
    </ErrorWindow>
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
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 16px;
        left: 64px;
        color: #FFFFFF;
        pointer-events: none;
        font-weight: bold;
        background: #24242480;
        backdrop-filter: blur(4px);
        padding: 8px;
        border-radius: 8px;
        height: 24px;
        user-select: none;
    }

    .boardSettingsButton{
        user-select: none;
        display: flex;
        justify-content: center;
        position: absolute;
        background: #24242480;
        backdrop-filter: blur(4px);
        bottom: 16px;
        left: 16px;
        padding: 8px;
        border-radius: 8px;
    }

    .boardSettingsButton:hover{
        opacity: 0.8;
    }
</style>
