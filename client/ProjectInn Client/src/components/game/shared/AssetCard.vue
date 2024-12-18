<script setup lang="ts">
    import type { Asset } from '../../../model/Asset.js';
    import editIcon from '../../../assets/icons/edit.svg';
    import deleteIcon from '../../../assets/icons/delete.svg'
    import ErrorImage from '../../../assets/placeholders/token_placeholder.png';
    import { ref } from 'vue';

    const hoveredOn = ref(false);

    const props = defineProps<{
        asset : Asset,
        showDelete? : boolean
    }>();

    const emits = defineEmits<{
        (e : 'editAsset', asset : Asset) : void
        (e : 'deleteAsset', asset : Asset) : void
        (e : 'assetClicked', asset : Asset) : void
    }>();

    function onDragStart(e : DragEvent){
        console.log("drag started");
        if(e.dataTransfer === null){
            return;
        }
        e.dataTransfer.dropEffect="move";
        e.dataTransfer.effectAllowed="move";
        e.dataTransfer.setData("id", props.asset.assetID.toString());
        e.dataTransfer.setData("name", props.asset.name);
    }
</script>

<template>
    <div class="card" @drop="console.log('aa')" draggable @click="$emit('assetClicked', asset)" @dragstart="onDragStart" @dragend="console.log('e')"
    @mouseenter="hoveredOn = true" 
    @mouseleave="hoveredOn = false">
        <div class="hoverButton">
            <img class="miniButton editButton" 
            :src="editIcon" 
            :style="{opacity : hoveredOn ? 1 : 0}" 
            @click.stop="$emit('editAsset',asset)">
        </div>
        <div class="hoverButton" v-if="showDelete === undefined || showDelete == true">
            <img class="miniButton deleteButton" 
            :src="deleteIcon" 
            :style="{opacity : hoveredOn ? 1 : 0}" 
            @click.stop="$emit('deleteAsset',asset)">
        </div>
        <img :src="asset.assetURL" @error="(e : any) => e.target.src = ErrorImage" class="sprite">
        <div class="centered">
            <div class="name">{{ asset.name }}</div>
        </div>
    </div>
</template>

<style scoped>
    .centered{
        max-height: 25%;
        margin: auto;
        overflow-wrap: anywhere;
        overflow: hidden;
        display: block;
    }

    .card{
        position: relative;
        display: flex;
        flex-direction: column;
        background-color: #555555;
        border-radius: 16px;
        height: 150px;
        width: 100px;   
        margin: 8px;
        justify-content: space-between;
        align-items: center;
        user-select: none;
    }

    .card:hover{
        background-color: #555555af;
    }

    .name{
        max-height: 20%;
        max-width: 90px;
        font-size: 14px;
        font-weight: bold;
        color: #d9d9d9;
        padding-bottom:16px;
        text-align: center;
        text-overflow: ellipsis;
    }

    .sprite{
        border-style: none;
        margin: 12px;
        width: 80px;
        height: 80px;
        border-radius: 16px;
    }

    .miniButton{
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        border-radius: 8px;
        background-color: #000000b4;
        padding: 2px;
        backdrop-filter: blur(4px);
    }

    .editButton{
        position: absolute;
        top:16px;
        right:16px;
    }

    .deleteButton{
        position: absolute;
        top:16px;
        left:16px;
    }

    .hoverButton:hover{
        opacity: 0.75;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
    }
</style>