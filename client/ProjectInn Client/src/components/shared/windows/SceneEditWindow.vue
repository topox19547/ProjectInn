<script setup lang="ts">
    import type { Scene } from '../../../model/Scene.js';
    import SceneIcon from '../../../assets/icons/scene.svg'
    import WindowBase from '../WindowBase.vue';
    import WindowTitleBar from '../WindowTitleBar.vue';
    import CloseButton from '../CloseButton.vue';
    import { ref, watch, type Ref } from 'vue';
    import WindowBackground from '../WindowBackground.vue';
    import BoardCanvas from '../../game/canvas/BoardCanvas.vue';
    import { AssetType } from '../../../model/AssetType.js';
    import { GridType } from '../../../model/GridType.js';
import ButtonBase from '../ButtonBase.vue';
    const minTileSize = ref(10);
    const maxTileSize = ref(300);
    const tileSizeValue = ref(35);
    const confirmDisabled = ref(true);
    const emits = defineEmits<{
        close : void
    }>();
    const props = defineProps<{
        title : string
        show : boolean
        scene : Scene
        onConfirm : () => void
    }>();
    watch(tileSizeValue,(newValue) => {
        if(newValue < minTileSize.value){
            props.scene.tileSize.x = minTileSize.value;
        } else if (newValue > maxTileSize.value){
            props.scene.tileSize.x = maxTileSize.value;
        } else {
            props.scene.tileSize.x = newValue;
        }
    })
    watch(props.scene.asset, (newValue, oldValue) => {
        if(oldValue.assetURL != newValue.assetURL){
            confirmDisabled.value = true;
        }
    })
</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="600px" window-width="700px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar :title="title" :icon="SceneIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="editor">
                        <div class="inputTitle">Scene name</div>
                        <input class="textBox" v-model="scene.asset.name" maxlength="24" type="text" title="sceneName">
                        <div class="inputTitle">Image URL</div>
                        <input class="textBox" v-model="scene.asset.assetURL" maxlength="2000" type="text" title="URL">
                        <div class="inputTitle">Grid Type</div>
                        <div class="gridTypeSelection">
                            <div class = "subCategory">
                                <div class="subOption">Square</div>
                                <input class="radioButton" value="0" type="radio" v-model="scene.gridType" title="GridType" name="test">
                            </div>
                            <div class = "subCategory">
                                <div class="subOption">Hexagonal</div>
                                <input class="radioButton" type="radio" v-model="scene.gridType" value="1"  title="GridType" name="test">
                            </div>      
                        </div>
                        <div class="inputTitle">Tile width (pixels)</div>
                        <input class="textBox" type="number" v-model="tileSizeValue" title="sceneName">
                        <div class="inputTitle">Tile offset (pixels)</div>
                        <div class="subCategory">
                            <div class="subCategory">
                                <div class="coordinateName">X</div>
                                <input class="textBox" v-model="scene.offset.x" type="number" title="sceneName">
                            </div>
                            <div class="subCategory">
                                <div class="coordinateName">Y</div>
                                <input class="textBox" v-model="scene.offset.y" type="number" title="sceneName">
                            </div>
                        </div>
                       
                    </div>
                    <div class="preview">
                        <div>
                            <BoardCanvas 
                            :onLoadSuccess="() => confirmDisabled = false"
                            :rounded="true" 
                            :tokens="[]" 
                            :token-assets="[]" 
                            :current-scene="scene"
                            height="256" width="256">
                            </BoardCanvas>
                            <div class="previewLabel">
                                Interactive preview
                            </div>
                        </div>
                        <ButtonBase 
                        text="Next" width="256px" height="42px" :disabled="confirmDisabled" @click="onConfirm">
                        </ButtonBase>
                    </div>
                </div>
            </template>
        </WindowBase>
    </Transition>
</template>

<style scoped>

    .subCategory{
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .previewLabel{
        color: #d9d9d9;
        padding-top: 8px;
        text-align: center;
    }

    .coordinateName{
        padding-left: 4px;
        color: #d9d9d9;
    }

    .gridTypeSelection{
        display: flex;
        justify-content: space-around;
        align-items: center;

        border-radius: 8px;
        padding: 0px;
        height: 32px;
    }

    .contentContainer{
        display: flex;
        background-color: #353535;
        border-radius: 16px;
        margin: 16px;
        height: 100%;
    }

    .editor{
        display: flex;
        flex-direction: column;
        padding: 24px;
        gap: 8px;
        width: 50%;
    }

    .inputTitle{
        padding-top: 16px;
        padding-left: 8px;
        padding-bottom: 4px;
        color: #d9d9d9;
    }

    .textBox{
        background-color: #494949;
        color: #ffffff;
        border-radius: 8px;
        outline: #d9d9d9;
        border: 0;
        box-shadow: none;
        outline-style: none;
        outline-width: 0px;
        font-size: 16px;
        padding-top: 4px;
        padding-left: 4px;
        padding-bottom: 4px;
        width: 100%;
    }

    .radioButton{
        background-color: #353535;
        accent-color:#303F9F;
    }
    
    .subOption{
        color: #d9d9d9;
    }

    .preview{
        margin: auto;
        display: flex;
        flex-direction: column;
        padding: 32px;
        border-radius: 16px;
        height: 400px;
        align-items: center;
        justify-content: space-between;
    }

    .background-enter-active,
    .background-leave-active {
        transition: opacity 0.5s ease;
    }

    .background-enter-from,
    .background-leave-to {
        opacity: 0;
    }

    .window-enter-active,
    .window-leave-active{
        transition: all 0.5s  cubic-bezier(0.075, 0.82, 0.165, 1);
    }

    .window-enter-from,
    .window-leave-to {
        opacity: 0;
        transform: scale(0.75);
    }
</style>