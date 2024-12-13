<script setup lang="ts">
    import { computed, inject, ref } from 'vue';
    import type { Player } from '../../../../../model/Player.js';
    import ButtonBase from '../../../../shared/ButtonBase.vue';
    import addIcon from '../../../../../assets/icons/add.svg';
    import kickIcon from '../../../../../assets/icons/kick.svg';
    import ownerIcon from '../../../../../assets/icons/owner.svg';
    import masterIcon from '../../../../../assets/icons/master.svg'
    import Kickplayer from '../../../windows/Kickplayer.vue';
    import { Permission } from '../../../../../model/Permission.js';
    import EditPermissions from '../../../windows/EditPermissions.vue';
    import type { Asset } from '../../../../../model/Asset.js';
    import EditAsset from '../../../windows/EditAsset.vue';
    import { AssetType } from '../../../../../model/AssetType.js';
    import type { ServerPublisher } from '../../../../../network/ServerHandler.js';
import { Status } from '../../../../../network/message/Status.js';
import { Command } from '../../../../../network/message/Command.js';
import AssetCard from './AssetCard.vue';

    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const showEditAssetWindow = ref(false);
    const showCreateAssetWindow = ref(false);

    const props = defineProps<{
        assets : Array<Asset>
        localPlayer : Player
    }>();

    const newAsset = ref<Asset>(createEmptyAsset());

    function createEmptyAsset(){
        return {
        assetID : -1,
        name : "",
        assetURL : "",
        assetType : AssetType.TOKEN,
        assetSize : {x : 256, y : 256} 
        };
    }

    function sendNewAsset(){
        serverPublisher.send({
            status : Status.TOKEN_ASSET,
            command : Command.CREATE,
            content : newAsset.value
        })
        newAsset.value = createEmptyAsset();
    }

</script>

<template>
    <div class="margin" v-if="localPlayer.permissions.MANAGE_TOKENS == true">
        <div class="container">
            <div class="assetList">
                <div class="assets">
                    <AssetCard :asset="asset" v-for="asset in assets"></AssetCard>
                </div>
            </div>
            <div class="buttonBar">
                <ButtonBase
                @click="showCreateAssetWindow = true"
                text="Add a new asset" 
                :icon="addIcon" 
                :disable-shadow="true"
                width="100%" 
                height="42px"></ButtonBase>
            </div>
        </div>
    </div>
    <EditAsset
    title="Create Asset"
    action-text="Create"
    :asset="newAsset"
    :create="true"
    :show="showCreateAssetWindow"
    @close="showCreateAssetWindow = false"
    :on-confirm="sendNewAsset"
    >
    </EditAsset>
</template>

<style scoped>
    .container{
        display: flex;
        flex-direction: column;
        background-color: #353535;
        border-radius: 16px;
        height: 100%;
        justify-content: space-between;
    }

    .assetList{
        padding-block: 16px;
        padding-inline: 8px;
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

    .assets{
        display: flex;
        flex-wrap: wrap;
        row-gap: 8px;
        justify-content: start;
        margin-left: 16px;

    }

    .buttonBar{
        display: flex;
        flex-direction: column;
        padding-inline: 16px;
        padding-bottom: 16px;
        gap: 0px;
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