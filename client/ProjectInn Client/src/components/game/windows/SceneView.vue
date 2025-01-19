<script setup lang="ts">
    import { inject, ref } from 'vue';
    import AddIcon from '../../../assets/icons/add.svg';
    import deleteIcon from '../../../assets/icons/delete_darker.svg';
    import SceneIcon from '../../../assets/icons/scene.svg';
    import SceneThumbnail from '../../../assets/placeholders/default_thumbnail.png';
    import { getStartingSceneData, type Scene } from '../../../model/Scene.js';
    import type { ServerPublisher } from '../../../network/ServerPublisher.js';
    import { Command } from '../../../network/message/Command.js';
    import { Status } from '../../../network/message/Status.js';
    import ButtonBase from '../../shared/ButtonBase.vue';
    import CloseButton from '../../shared/CloseButton.vue';
    import WindowBackground from '../../shared/WindowBackground.vue';
    import WindowBase from '../../shared/WindowBase.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';
    import SceneEditWindow from '../../shared/windows/SceneEditWindow.vue';
    import AssetCard from '../shared/AssetCard.vue';
    import ConfirmAction from './ConfirmAction.vue';
    const emits = defineEmits<{
        (e : "close") : void
        (e : "show") : void
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
    const showSceneChangeWindow = ref(false);
    const editingScene = ref(getStartingSceneData());
    let deletingSceneId = -1;
    let changingSceneId = -1;
    const newScene = ref(getStartingSceneData());
    newScene.value.asset.name = "Scene 1";

    function editScene(id : number){
        const scene : Scene | undefined = props.scenes.find(p => p.asset.assetID == id);
        if(scene == undefined){
            return;
        }
        editingScene.value = scene;
        showSceneEditWindow.value = true;
    }

    function deleteScene(id : number){
        showSceneDeleteWindow.value = true;
        deletingSceneId = id;
    }

    function createScene(){
        showSceneCreateWindow.value = true;
        newScene.value.asset.name = `Scene ${props.scenes.length}`;
    }

    function changeScene(id : number){
        if(id == props.currentScene.asset.assetID){
            return;
        }
        changingSceneId = id;
        showSceneChangeWindow.value = true;
    }

    function sendDeletedScene(){
        serverPublisher.send({
            status : Status.SCENE,
            command : Command.DELETE,
            content : {
                id : deletingSceneId
            }
        });
    }

    function sendEditedScene(scene : Scene){
        serverPublisher.send({
            status : Status.SCENE,
            command : Command.MODIFY,
            content : scene
        });
        showSceneEditWindow.value = false;
    }

    function sendCreatedScene(scene : Scene){
        serverPublisher.send({
            status : Status.SCENE,
            command : Command.CREATE,
            content : scene
        });
        showSceneCreateWindow.value = false;
        newScene.value = getStartingSceneData();
    }

    function sendSceneChange(){
        serverPublisher.send({
            status : Status.SCENE_CHANGE,
            command : Command.MODIFY,
            content : {
                id : changingSceneId
            }
        });
        showSceneChangeWindow.value = false;
        emits("close");
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
                    <div class="assetList">
                        <div class="assets">
                            <AssetCard :asset="scene.asset" v-for="scene in scenes"
                            :key="scene.asset.assetID"
                            :thumbnail="scene.asset.assetID != currentScene.asset.assetID ?  SceneThumbnail : undefined"
                            :show-delete="scene.asset.assetID != currentScene.asset.assetID"
                            @edit-asset="a => editScene(a.assetID)"
                            @delete-asset="a => deleteScene(a.assetID)"
                            @asset-clicked="a => changeScene(a.assetID)"></AssetCard>
                        </div>
                    </div>
                    <div class="buttonBar">
                        <ButtonBase text="Add a new scene" :icon="AddIcon" @click="createScene"></ButtonBase>
                    </div>
                </div>
            </template>
        </WindowBase>
    </Transition>
    <SceneEditWindow
    :scene="editingScene"
    :show="showSceneEditWindow"
    title="Edit Scene"
    @confirm="sendEditedScene"
    @close="showSceneEditWindow = false"
    ></SceneEditWindow>
    <SceneEditWindow
    :scene="newScene"
    :show="showSceneCreateWindow"
    title="Create Scene"
    @confirm="sendCreatedScene"
    @close="showSceneCreateWindow = false"
    ></SceneEditWindow>
    <ConfirmAction
    :show = showSceneDeleteWindow
    message="Are you sure you want to delete this scene?"
    :on-confirm="sendDeletedScene"
    @close="showSceneDeleteWindow = false"
    :destructive="true"
    title="Confirm deletion"
    :icon="deleteIcon"
    action="Delete">
    </ConfirmAction>
    <ConfirmAction
    :show = showSceneChangeWindow
    message="Are you sure you want to change to this scene? All token positions will be reset."
    :on-confirm="sendSceneChange"
    @close="showSceneChangeWindow = false"
    :destructive="false"
    title="Change Scene"
    :icon="SceneIcon"
    action="Change scene">
    </ConfirmAction>
</template>

<style scoped>
    .content{
        display: flex;
        padding: 16px;
        justify-content: space-between;
        flex-direction: column;
    }

    .assetList{
        padding-inline: 8px;
        display: flex;
        overflow-y: auto;
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }

    .assets{
        display: flex;
        flex-wrap: wrap;
        padding-bottom: 24px;
        row-gap: 8px;
        justify-content: start;
        margin: auto;
        width: 580px;
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
