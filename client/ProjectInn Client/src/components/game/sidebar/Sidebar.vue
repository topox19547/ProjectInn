<script setup lang="ts">
    import type { SideBarTab } from './sidebarTab.js';
    import TokenIcon from '../../../assets/icons/token.svg';
    import AssetIcon from '../../../assets/icons/assets.svg';
    import PlayersIcon from '../../../assets/icons/players.svg';
    import ChatIcon from '../../../assets/icons/chat.svg';
    import TabButton from './TabButton.vue';

    const props = defineProps<{
        currentTab : SideBarTab
    }>();

    const emits = defineEmits<{
        (e : 'tabChanged', tab : SideBarTab) : void
    }>();
</script>

<template>
    <div class="tabsContainer">
        <div class="tabs">
            <TabButton 
            :is-active="currentTab == 0" 
            :id="0" :icon="ChatIcon" 
            @click="$emit('tabChanged', 0)"></TabButton>
            <TabButton 
            :is-active="currentTab == 1" 
            :id="1" :icon="PlayersIcon" 
            @click="$emit('tabChanged', 1)"></TabButton>
            <TabButton 
            :is-active="currentTab == 2" 
            :id="2" :icon="AssetIcon" 
            @click="$emit('tabChanged', 2)"></TabButton>
            <TabButton 
            :is-active="currentTab == 3" 
            :id="3" 
            :icon="TokenIcon" 
            @click="$emit('tabChanged', 3)"></TabButton>
        </div>
    </div>
    <div class = "content"></div>
</template>


<style scoped>
    .tabsContainer{
        height: 64px;
        display: flex;
        justify-content: center;
    }
    
    .tabs{
        width: 45%;
        display: flex;
        flex-direction: row;
        margin-block: 12px;
        background-color: #353535;
        border-radius: 16px;
    }
</style>