<script setup lang="ts">
    import { ref, watch } from 'vue';
    import SceneIcon from '../../../assets/icons/scene.svg';
    import { getInitializedViewData } from '../../../model/Game.js';
    import { getDefaultGlobalSettings } from '../../../model/GlobalSettings.js';
    import { getStartingPlayerData } from '../../../model/Player.js';
    import type { Scene } from '../../../model/Scene.js';
    import BoardCanvas from '../../game/canvas/BoardCanvas.vue';
    import ButtonBase from '../ButtonBase.vue';
    import CloseButton from '../CloseButton.vue';
    import UploadHelp from '../UploadHelp.vue';
    import WindowBackground from '../WindowBackground.vue';
    import WindowBase from '../WindowBase.vue';
    import WindowTitleBar from '../WindowTitleBar.vue';
    const minTileSize = 30;
    const maxTileSize = 300;
    const tileSizeValue = ref(100);
    const offsetValue = ref({x : 0, y : 0})
    const confirmDisabled = ref(true);
    const emits = defineEmits<{
        (e : "close") : void
        (e : "confirm", scene : Scene) : void
    }>();
    const props = defineProps<{
        title : string
        show : boolean
        scene : Scene
    }>();
    const editableScene = ref(JSON.parse(JSON.stringify(props.scene)) as Scene); //deep clone


    watch(tileSizeValue,(newValue) => {
        if(newValue < minTileSize){
            editableScene.value.tileSize = minTileSize;
        } else if (newValue > maxTileSize){
            editableScene.value.tileSize = maxTileSize;
        } else {
            editableScene.value.tileSize = newValue;
        }
    })

    watch(offsetValue, (newValue) => {
        editableScene.value.offset.x = typeof newValue.x !== "number" ? 0 : newValue.x;
        editableScene.value.offset.y = typeof newValue.y !== "number"? 0 : newValue.y;
    }, {deep : true})

    watch(() => editableScene.value.asset.assetURL, (newValue, oldValue) => {
        console.log("changed url")
        if(oldValue != newValue){
            confirmDisabled.value = true;
        }
    })

    watch(() => props.show,() => {
        confirmDisabled.value = true;
        editableScene.value = JSON.parse(JSON.stringify(props.scene)) as Scene; //deep clone
        tileSizeValue.value = editableScene.value.tileSize;
        offsetValue.value.x = editableScene.value.offset.x;
        offsetValue.value.y = editableScene.value.offset.y;
    })

    function enableConfirm(image : ImageBitmap){
        editableScene.value.asset.assetSize = {x : image.width, y : image.height};
        confirmDisabled.value = false;
    }
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
                        <input class="textBox" v-model="editableScene.asset.name" maxlength="24" type="text">
                        <div class="titleWithHelp">
                            <div class="inputTitle">
                                Image URL
                            </div>
                            <UploadHelp></UploadHelp>
                        </div>
                        <input class="textBox" v-model="editableScene.asset.assetURL" maxlength="2000" type="text">
                        <div class="inputTitle">Grid Type</div>
                        <div class="gridTypeSelection">
                            <div class = "subCategory">
                                <div class="subOption">Square</div>
                                <input class="radioButton" :value="0" type="radio"
                                v-model="editableScene.gridType" name="test">
                            </div>
                            <div class = "subCategory">
                                <div class="subOption">Hexagonal</div>
                                <input class="radioButton" :value="1"  type="radio"
                                v-model="editableScene.gridType" name="test">
                            </div>
                        </div>
                        <div class="inputTitle">Tile width (pixels)</div>
                        <input class="textBox" type="number" v-model="tileSizeValue">
                        <div class="inputTitle">Tile offset (pixels)</div>
                        <div class="subCategory">
                            <div class="subCategory">
                                <div class="coordinateName">X</div>
                                <input class="textBox" v-model="offsetValue.x"
                                type="number">
                            </div>
                            <div class="subCategory">
                                <div class="coordinateName">Y</div>
                                <input class="textBox" v-model="offsetValue.y"
                                type="number">
                            </div>
                        </div>
                    </div>
                    <div class="preview">
                        <div>
                            <BoardCanvas
                            :onLoadSuccess="(img : ImageBitmap) => enableConfirm(img)"
                            rounded="16px"
                            :tokens="[]"
                            :token-assets="[]"
                            :current-scene="editableScene"
                            :local-player="getStartingPlayerData()"
                            :players="[]"
                            :global-settings="getDefaultGlobalSettings()"
                            :view-data="getInitializedViewData()"
                            :canvas-size="{ x : 256, y : 256}">
                            </BoardCanvas>
                            <div class="previewLabel">
                                Interactive preview
                            </div>
                        </div>
                        <ButtonBase
                        text="Next" width="256px" height="42px" :disabled="confirmDisabled"
                        @click="emits('confirm', editableScene)">
                        </ButtonBase>
                    </div>
                </div>
            </template>
        </WindowBase>
    </Transition>
</template>

<style scoped>

    .titleWithHelp{
        display: flex;
    }

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
