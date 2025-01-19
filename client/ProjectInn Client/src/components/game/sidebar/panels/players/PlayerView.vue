<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type { Player } from '../../../../../model/Player.js';
    import ButtonBase from '../../../../shared/ButtonBase.vue';
    import editPermsIcon from '../../../../../assets/icons/editPerms.svg';
    import kickIcon from '../../../../../assets/icons/kick.svg';
    import ownerIcon from '../../../../../assets/icons/owner.svg';
    import masterIcon from '../../../../../assets/icons/master.svg';
    import playerIcon from '../../../../../assets/icons/player.svg';
    import KickPlayer from '../../../windows/KickPlayer.vue';
    import { Permission } from '../../../../../model/Permission.js';
    import EditPermissions from '../../../windows/EditPermissions.vue';

    const showKickWindow = ref(false);
    const showPermissionsWindow = ref(false);

    const props = defineProps<{
        players : Array<Player>
        localPlayer : Player
    }>();

    const onlinePlayers = computed(() => props.players.filter(p => p.connected == true));
    const offlinePlayers = computed(() => props.players.filter(p => p.connected == false));
    const lowerPlayers = computed(() => props.players.filter(p =>{
        if(props.localPlayer.isOwner){
            return p.name != props.localPlayer.name;
        }else if(props.localPlayer.permissions[Permission.MASTER] == true){
            return p.name != props.localPlayer.name && p.permissions[Permission.MASTER] == false;
        }else{
            return [];
        }
    }).map(p => p.name));
    const canKickPlayers = computed(() => {
        return (props.localPlayer.permissions[Permission.MASTER] == true || props.localPlayer.isOwner) &&
        lowerPlayers.value.length > 0;
    })

</script>

<template>
    <div class="margin">
        <div class="container">
            <div class="playerList">
                <div class="title" v-if="onlinePlayers.length > 0">
                    Active players
                </div>
                <div v-for="player in onlinePlayers" class="player" :key="player.name"
                :style="{ 'color' : player.color}">
                    <div>
                        {{ player.name }}
                    </div>
                    <div class="playerTags" v-if="true">
                        <img :src="playerIcon" title="You"
                        v-if="player.name == localPlayer.name" width="24px">
                        <img :src="ownerIcon" title="Owner"
                        v-if="player.isOwner" width="24px">
                        <img :src="masterIcon" title="Dungeon Master"
                        v-else-if="player.permissions[Permission.MASTER]" width="24px">
                    </div>
                </div>
                <div class="spacer"></div>
                <div class="title" v-if="offlinePlayers.length > 0">
                    Offline players
                </div>
                <div v-for="player in offlinePlayers" class="player" :key="player.name"
                :style="{ 'color' : player.color}">
                    <div>
                        {{ player.name }}
                    </div>
                    <div class="playerTags" v-if="true">
                        <img :src="playerIcon" title="You"
                        v-if="player.name == localPlayer.name" width="24px">
                        <img :src="ownerIcon" title="Owner"
                         v-if="player.isOwner" width="24px">
                        <img :src="masterIcon" title="Dungeon Master"
                        v-else-if="player.permissions[Permission.MASTER]" width="24px">
                    </div>
                </div>
            </div>
            <div class="buttonBar">
                <ButtonBase
                @click="showPermissionsWindow = true"
                text="Edit permissions"
                :icon="editPermsIcon"
                :disable-shadow="true"
                width="100%"
                height="42px"
                v-if="localPlayer.permissions[Permission.MASTER] == true || localPlayer.isOwner"></ButtonBase>
                <ButtonBase
                @click="showKickWindow = true"
                text="Kick player"
                :icon="kickIcon"
                :disable-shadow="true"
                width="100%"
                height="42px"
                :color="{ active : '#9D2C2C', hover : '#CD3A3A'}"
                v-if="canKickPlayers"></ButtonBase>
            </div>
        </div>
    </div>
    <KickPlayer
    :kickable-players="lowerPlayers" :show="showKickWindow" @close="showKickWindow = false">
    </KickPlayer>
    <EditPermissions
    :editable-players="lowerPlayers"
    :show="showPermissionsWindow"
    :players="players"
    :local-player="localPlayer"
    @close="showPermissionsWindow = false">
    </EditPermissions>
</template>

<style scoped>
    .playerTags{
        display: flex;
        justify-content: end;
        gap: 4px;
    }

    .container{
        display: flex;
        flex-direction: column;
        background-color: #353535;
        border-radius: 16px;
        margin-inline: 16px;
        height: 100%;
        justify-content: space-between;
    }

    .playerList{
        padding: 16px;
        display: block;
        overflow-y: auto;
        height: 100%;
    }

    .title{
        font-size: 20px;
        font-weight: bold;
        color: #d9d9d9;
        padding-bottom:16px;
    }

    .player{
        font-size: 18px;
        padding-block: 4px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        overflow-wrap: anywhere;
    }

    .spacer{
        min-height: 16px;
    }

    .buttonBar{
        display: flex;
        flex-direction: column;
        padding-inline: 16px;
        padding-bottom: 16px;
        gap: 8px;
        align-items: center;
        height: 128px;
        flex : 1;
    }

    .textBox{
        background-color: #494949;
        color: #ffffff;
        border-radius: 16px;
        outline: #d9d9d9;
        border: 0;
        box-shadow: none;
        outline-style: none;
        outline-width: 0px;
        font-size: 16px;
        padding-top: 4px;
        padding-left: 16px;
        padding-bottom: 4px;
        width: 75%;
        height: 32px;
    }

    .margin{
        padding-bottom: 16px;
        overflow: hidden;
        height: 100%;
    }

</style>
