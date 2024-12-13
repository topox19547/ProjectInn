<script setup lang="ts">
    import type { Asset } from '../../../../../model/Asset.js';
    import editIcon from '../../../../../assets/icons/edit.svg';
    import { ref } from 'vue';

    const hoveredOn = ref(false);

    const props = defineProps<{
        asset : Asset,
    }>();

    const emits = defineEmits<{
        (e : 'editAsset', asset : Asset) : void
    }>();
</script>

<template>
    <div class="container" 
    @mouseenter="hoveredOn = true" 
    @mouseleave="hoveredOn = false">
        <div class="hoverButton">
            <img class="editButton" 
            :src="editIcon" 
            :style="{opacity : hoveredOn ? 1 : 0}" 
            @click="$emit('editAsset',asset)">
        </div>
        <img :src="asset.assetURL" class="tokenSprite">
        <div class="tokenName">{{ asset.name }}</div>
    </div>
</template>

<style scoped>
    .container{
        position: relative;
        display: flex;
        flex-direction: column;
        background-color: #555555;
        border-radius: 16px;
        height: 140px;
        width: 100px;
        margin: 8px;
        justify-content: space-between;
        align-items: center;
    }

    .tokenName{
        height: 20%;
        font-size: 16px;
        font-weight: bold;
        color: #d9d9d9;
        padding-bottom:16px;
    }

    .tokenSprite{
        border-style: none;
        margin: 12px;
        width: 84px;
        height: 84px;
        border-radius: 16px;
    }

    .editButton{
        position: absolute;
        top:16px;
        right:16px;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        border-radius: 16px;
    }

    .hoverButton:hover{
        opacity: 0.5;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
    }
</style>