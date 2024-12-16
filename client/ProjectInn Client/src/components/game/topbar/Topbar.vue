<script setup lang="ts">
    import { ref } from 'vue';
    import SceneIcon from "../../../assets/icons/scene.svg";
    import SettingsIcon from '../../../assets/icons/settings.svg';
    import SaveIcon from '../../../assets/icons/save.svg';
    import LeaveIcon from '../../../assets/icons/leave.svg';
    import type { Player } from '../../../model/Player.js';
    import type { Scene } from '../../../model/Scene.js';
    import Scenes from '../windows/Scenes.vue';
import { Permission } from '../../../model/Permission.js';

    const showSceneMenu = ref(false);
    const showGameSettings = ref(false);
    const showSaveGamePopUp = ref(false);
    const showLeaveRoomPopup = ref(false);

    const props = defineProps<{
        localPlayer : Player,
        currentScene : Scene,
        scenes : Array<Scene>
    }>();
</script>

<template>
    <div class="topbarContent">
        <div class="topbarButton">
            <img :src="LeaveIcon">
            <div>Leave Room</div>
        </div>
        <div class="topbarButton"
        v-if="localPlayer.isOwner">
            <img :src="SaveIcon">
            <div>Save Game</div>
        </div>
        <div class="topbarButton"
        v-if="localPlayer.permissions[Permission.MASTER]">
            <img :src="SettingsIcon">
            <div>Room Settings</div>
        </div>
        <div class="topbarButton" @click="showSceneMenu = true" 
        v-if="localPlayer.permissions[Permission.MANAGE_SCENES]">
            <img :src="SceneIcon">
            <div>Scenes</div>
        </div>
    </div>
    <Scenes 
    :scenes="scenes" 
    :current-scene="currentScene" 
    :show="showSceneMenu" 
    @close="showSceneMenu = false"
    @show="showSceneMenu = true"></Scenes>
</template>

<style scoped>
    .topbarContent{
        display: flex;
        padding-inline: 16px;
        gap:32px;
        align-items: center;
        color: #d9d9d9;
        user-select: none;
        width: 100%;
        height: 100%;
    }

    .topbarButton{
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .topbarButton:hover{
        opacity: 0.75;
    }
</style>