<script setup lang="ts">
    import EditIcon from '../../../../../assets/icons/edit.svg';
    import DeleteIcon from '../../../../../assets/icons/delete.svg';
    import OkIcon from '../../../../../assets/icons/ok.svg';
    import CloseIcon from '../../../../../assets/icons/close.svg';
    import ButtonBase from '../../../../shared/ButtonBase.vue';
    import { onMounted, onUnmounted, ref, watch } from 'vue';

    const hoveredOn = ref(false);
    const isEditing = ref(false);
    const editedText = ref("");
    const editedTitle = ref("");

    const emits = defineEmits<{
        (e : "editedNote", title : string, note : string ) : void
        (e : "deletedNote") : void
        (e : "cancel") : void
        (e : "setEditLock", status : boolean) : void
    }>();

    const props = defineProps<{
        create : boolean
        title : string
        text : string
        currentTokenId : number
        takenTitles? : Array<string>
        canEdit : boolean
    }>();

    function reset(){
        emits("cancel");
        isEditing.value = false;
        resetContent();
    }

    function resetContent(){
        editedText.value = props.text;
        editedTitle.value = props.title;
    }

    function confirm(){
        setEditStatus(false);
        emits('editedNote', editedTitle.value , editedText.value)
    }

    function setEditStatus(status : boolean){
        emits("setEditLock", status);
        isEditing.value = status;
    }

    onMounted(() => {
        resetContent();
    })

    onUnmounted(() => {
        reset();
    })

    watch(() => props.currentTokenId, () => {
        console.log(props.currentTokenId)
        reset();
    })

</script>


<template>
    <div class="outer" @mouseover="hoveredOn = true" @mouseleave="hoveredOn = false">
        <div class="title" v-if = "create == false">{{ title }}</div>
        <input class="textBox" v-else v-model="editedTitle" placeholder="Title">
        <TransitionGroup name="edit">
            <div class="static" v-if="!isEditing && create == false">
                <div class="text">{{ text }}</div>
                <div @dragstart="(e) => e.preventDefault()" class="hoverButton" @click="setEditStatus(true)">
                    <img class="miniButton editButton" 
                        :src="EditIcon" 
                        :style="{opacity : hoveredOn ? 1 : 0}" >
                </div>
                <div @dragstart="(e) => e.preventDefault()" class="hoverButton" @click="$emit('deletedNote')">
                    <img class="miniButton deleteButton" 
                    :src="DeleteIcon" 
                    :style="{opacity : hoveredOn ? 1 : 0}">
                </div>
            </div> 
            <div class="editable" v-if="isEditing || create == true"> 
                <textarea class="textArea" placeholder="Text" maxlength="512" v-model="editedText"></textarea>
                <div class="buttonBar">
                    <ButtonBase :disable-shadow="true" :icon="OkIcon" 
                    :disabled="editedText.length == 0 || editedTitle.length == 0 || takenTitles?.includes(editedTitle)"
                    @click="confirm" height="32px"></ButtonBase>
                    <ButtonBase :disable-shadow="true" :icon="CloseIcon" @click="reset" height="32px"></ButtonBase>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
    .textArea{
        background-color: #494949;
        color: #ffffff;
        border-radius: 16px;
        padding: 12px;
        border-style: none;
        resize: none;
        height: 200px;
        box-sizing: border-box;
        width: 100%;
        accent-color: #303F9F;
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
        padding-left: 12px;
        padding-bottom: 4px;
        box-sizing: border-box;

    }

    .title{
        color: #ffffff;
        font-weight: bold;
        padding-inline: 8px;
    }

    .text{
        padding-top:8px;
        padding-INLINE: 8px;
        color: #ffffff;
    }

    .outer{
        background-color: #555555;
        border-radius: 16px;
        padding: 16px;
        margin-block: 4px;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: height 1s cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
    }

    .miniButton{
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        border-radius: 8px;
        padding: 2px;
    }

    .editButton{
        position: absolute;
        top:16px;
        right:48px;
    }

    .deleteButton{
        position: absolute;
        top:16px;
        right:16px;
    }

    .hoverButton{
        opacity: 1;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        display: flex;
        justify-content: center;
    }

    .hoverButton:hover{
        opacity: 0.75;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        display: flex;
        justify-content: center;
    }

    .buttonBar{
        display: flex;
        gap: 4px;
        padding-top: 8px;
    }

    .textArea{
        margin-top:8px
    }

    .edit-enter-active,
    .edit-leave-active {
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        max-height: 1000px;
        overflow: hidden;
    }

    .edit-enter-from,
    .edit-leave-to {
        opacity: 0;
        max-height: 0px;
        overflow: hidden;
    }

    
</style>