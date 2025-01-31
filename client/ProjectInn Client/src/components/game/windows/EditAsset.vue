<script setup lang="ts">
    import { onUpdated, ref, watch } from 'vue';
    import AssetIcon from '../../../assets/icons/assets.svg';
    import ErrorImage from '../../../assets/placeholders/token_placeholder.png';
    import type { Asset } from '../../../model/Asset.js';
    import ButtonBase from '../../shared/ButtonBase.vue';
    import CloseButton from '../../shared/CloseButton.vue';
    import UploadHelp from '../../shared/UploadHelp.vue';
    import WindowBackground from '../../shared/WindowBackground.vue';
    import WindowBase from '../../shared/WindowBase.vue';
    import WindowTitleBar from '../../shared/WindowTitleBar.vue';
    const confirmDisabled = ref(true);
    let imageValid = false;
    let errorOccurred = false;
    const emits = defineEmits<{
        (e : "close") : void
        (e : "confirm", asset : Asset) : void
    }>();
    const props = defineProps<{
        title : string
        actionText : string
        show : boolean
        asset : Asset
    }>();
    const editableAsset = ref(JSON.parse(JSON.stringify(props.asset))); //deep clone

    function enableConfirm() : void{
        confirmDisabled.value = !(imageValid && editableAsset.value.name.length > 0);
    }

    function onLoadError(e : Event) : void{
        confirmDisabled.value = true;
        errorOccurred= true;
        if(e.target instanceof HTMLImageElement){
          e.target.src = ErrorImage;
        }

    }

    function onLoadSuccess() : void{
        if(!errorOccurred){
            imageValid = true
            enableConfirm();
        }
        errorOccurred = false
    }

    function confirm() : void{
        confirmDisabled.value = true;
        emits("confirm", editableAsset.value);
    }

    watch(() => props.asset.assetURL, () => {
        imageValid = false;
    });

    onUpdated(() => {
        editableAsset.value = JSON.parse(JSON.stringify(props.asset));
    });
</script>


<template>
    <Transition name="background">
        <WindowBackground  v-if="show" ></WindowBackground>
    </Transition>
    <Transition name="window">
        <WindowBase window-height="400px" window-width="700px"  v-if="show" >
            <template v-slot:content>
                <WindowTitleBar :title="title" :icon="AssetIcon">
                    <template v-slot:back>
                        <CloseButton @click="$emit('close')"></CloseButton>
                    </template>
                </WindowTitleBar>
                <div class="contentContainer">
                    <div class="editor">
                        <div class="inputTitle">Asset name</div>
                        <input class="textBox" @input="enableConfirm" v-model="editableAsset.name" maxlength="24" type="text">
                        <div class="titleWithHelp">
                            <div class="inputTitle">
                                Image URL
                            </div>
                            <UploadHelp></UploadHelp>
                        </div>
                        <input class="textBox" v-model="editableAsset.assetURL" maxlength="2000" type="text">
                    </div>
                    <div class="preview">
                        <div>
                            <img :src="editableAsset.assetURL" @error="onLoadError"
                            width="128px" height="128px"
                            @load="onLoadSuccess">
                            <div class="previewLabel">
                                preview
                            </div>
                        </div>
                        <ButtonBase
                        :text="actionText" width="256px" height="42px" :disabled="confirmDisabled"
                        @click="() => {
                            $emit('close');
                            confirm();
                        }">
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
        padding: 8px;
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
        padding-inline: 32px;
        padding-block: 16px;
        border-radius: 16px;
        gap: 16px;
        box-sizing: border-box;
        height: 100%;
        align-items: center;
        justify-content: center;
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
