<script setup lang="ts">
    import type { SideBarTab } from './sidebarTab.js';
    import TokenIcon from '../../../assets/icons/token.svg';
    import AssetIcon from '../../../assets/icons/assets.svg';
    import PlayersIcon from '../../../assets/icons/players.svg';
    import ChatIcon from '../../../assets/icons/chat.svg';
    import TabButton from './TabButton.vue';
    import Chat from './panels/chat/Chat.vue';
    import type { Player } from '../../../model/Player.js';
    import type { ChatMessage } from '../../../model/ChatMessage.js';
import Players from './panels/players/Players.vue';

    const props = defineProps<{
        currentTab : SideBarTab,
        players : Array<Player>,
        chat : Array<ChatMessage>
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
    <div class = "content">
        <Chat :chat="chat" v-if="currentTab == 0" :players="players"></Chat>
        <Players :players="players" v-if="currentTab == 1"></Players>
    </div>
</template>


<style scoped>
    .content{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow-y: hidden;
    }

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