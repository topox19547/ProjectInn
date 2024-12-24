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
    import Assets from './panels/assets/Assets.vue';
    import Tokens from './panels/tokens/Tokens.vue';
    import type { Asset } from '../../../model/Asset.js';
    import type { ViewData } from '../../../model/Game.js';

    const props = defineProps<{
        currentTab : SideBarTab,
        previousTab : SideBarTab,
        localPlayer : Player,
        players : Array<Player>,
        chat : Array<ChatMessage>
        assets : Array<Asset>
        viewData : ViewData
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
            v-if="localPlayer.permissions.MANAGE_TOKENS == true"
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
        <Chat :chat="chat" :players="players" :local-player="localPlayer"
        v-if="currentTab == 0"></Chat>
        <Players :local-player="localPlayer" :players="players" 
        v-if="currentTab == 1"></Players>
        <Assets :assets="assets" :local-player="localPlayer" 
        v-if="currentTab == 2"></Assets>
        <Tokens :selected-token="viewData.selectedToken" :players="players" :local-player="localPlayer"
        v-if="currentTab == 3"></Tokens>
    </div>
</template>


<style scoped>
    .content{
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100% - 64px);
        overflow-y: hidden;
    }

    .tabsContainer{
        height: 64px;
        display: flex;
        justify-content: center;
    }
    
    .tabs{
        width: fit-content;
        display: flex;
        flex-direction: row;
        margin-block: 12px;
        background-color: #353535;
        border-radius: 16px;
    }
</style>