<script setup lang="ts">
    import { getStartingSceneData, type Scene } from '../../../model/Scene.js';
    import WindowBackground from '../../shared/WindowBackground.vue';
    import WindowBase from '../../shared/WindowBase.vue';
    import SceneIcon from '../../../assets/icons/scene.svg';
    import AddIcon from '../../../assets/icons/add.svg';
    import CloseButton from '../../shared/CloseButton.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';
    import AssetCard from '../shared/AssetCard.vue';
    import ButtonBase from '../../shared/ButtonBase.vue';
import SceneEditWindow from '../../shared/windows/SceneEditWindow.vue';
import type { Asset } from '../../../model/Asset.js';
import type { WeakVector2 } from '../../../types/Vector2.js';
import { inject, ref } from 'vue';
import ConfirmDelete from './ConfirmDelete.vue';
import type { ServerPublisher } from '../../../network/ServerHandler.js';
import { Status } from '../../../network/message/Status.js';
import { Command } from '../../../network/message/Command.js';
    const emits = defineEmits<{
        close : void,
        show : void
    }>();

    const props = defineProps<{
        scenes : Array<Scene>
        currentScene : Scene
        show : boolean
    }>();

    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const showSceneEditWindow = ref(false);
    const showSceneCreateWindow = ref(false);
    const showSceneDeleteWindow = ref(false);
    const editingScene = ref(getStartingSceneData());
    let deletingSceneId = -1;
    const newScene = ref(getStartingSceneData());


    function editScene(id : number){
        const scene : Scene | undefined = props.scenes.find(p => p.asset.assetID == id);
        if(scene == undefined){
            return;
        }
        editingScene.value = scene;
    }

    function deleteScene(id : number){
        showSceneDeleteWindow.value = true
        deletingSceneId = id;
    }

    function copyScene(scene : Scene){
        const positionCopy : WeakVector2 = Object.assign({}, scene.offset);
        const assetCopy : Asset = Object.assign({}, scene.asset);
        const assetSizeCopy : WeakVector2 = Object.assign({}, scene.asset.assetSize);
        const sceneCopy : Scene = Object.assign({}, scene);
        assetCopy.assetSize = assetSizeCopy;
        sceneCopy.offset = positionCopy;
        sceneCopy.asset = assetCopy;
        return sceneCopy;
    }

    function sendDeletedScene(){
        serverPublisher.send({
            status : Status.SCENE,
            command : Command.DELETE,
            content : {
                id : deletingSceneId
            }
        })
    }

    function sendEditedScene(){
        serverPublisher.send({
            status : Status.SCENE,
            command : Command.MODIFY,
            content : editingScene
        })
    }

</script>

<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="500px" window-width="700px"  v-if="show">
            <template v-slot:content>
                <WindowTitleBar title="Scenes" :icon="SceneIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="content">
                    <div class="assets">
                        <AssetCard :asset="scene.asset" v-for="scene in scenes"
                        :show
                        @edit-asset="a => editScene(a.assetID)"
                        @delete-asset="a => deleteScene(a.assetID)"></AssetCard>
                    </div>
                    <div class="buttonBar">
                        <ButtonBase text="Add a new scene" :icon="AddIcon" @click=""></ButtonBase>
                    </div>
                </div>
            </template>
        </WindowBase>
    </Transition>
    <SceneEditWindow
    :scene="editingScene"
    :show="showSceneEditWindow"
    title="Edit Scene"
    :on-confirm="sendEditedScene"
    ></SceneEditWindow>
    <SceneEditWindow
    :scene="newScene"
    :show="showSceneCreateWindow"
    title="Create Scene"
    :on-confirm="sendDeletedScene"
    ></SceneEditWindow>
    <ConfirmDelete 
    :show = showSceneDeleteWindow
    message="Are you sure you want to delete this scene?"
    :on-confirm="sendDeletedScene"
    @close="showSceneDeleteWindow = false">
    </ConfirmDelete>
</template>

<style scoped>
    .content{
        display: flex;
        padding: 16px;
        justify-content: space-between;
        flex-direction: column;
    }

    .assets{
        display: flex;
        flex-wrap: wrap;
        padding-bottom: 24px;
        row-gap: 8px;
        justify-content: start;
        margin: auto;
        width: 100%;
        height: 330px;
    }

    .buttonBar{
        display: flex;
        flex-direction: column;
        padding-inline: 16px;
        padding-bottom: 16px;
        padding-top:8px;
        gap: 0px;
        align-items: center;
        height: 128px;
        flex : 1;
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