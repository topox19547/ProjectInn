<script setup lang="ts">
    import { nextTick, ref, useTemplateRef, watch } from 'vue';
    import EditIcon from '../../../../../assets/icons/edit.svg';
    import OkIcon from '../../../../../assets/icons/ok.svg';
    import CloseIcon from '../../../../../assets/icons/close.svg';
    import ButtonBase from '../../../../shared/ButtonBase.vue';
    const props = defineProps<{
        text : string
        canEdit : boolean
        maxLength : number
        currentTokenId : number
    }>();
    const emits = defineEmits<{
        (e : "lockEdits", value :  boolean) : void
        (e : "textEdited", value : string) : void
    }>();
    const hoveredOn = ref(false);
    const editing = ref(false);
    const editableText = ref(props.text);
    const textBox = useTemplateRef("textBox");


    function submit() : void{
        editing.value = false;
        emits("lockEdits",false);
        emits("textEdited", editableText.value);
    }

    function cancel() : void{
        editing.value = false;
        emits("lockEdits",false);
    }

    function edit() : void{
        editing.value = true
        editableText.value = props.text
        nextTick(() => {
            textBox.value?.focus();
        })
        emits("lockEdits",true);
    }

    watch(() => props.currentTokenId, () => {
        if(editing.value == true){
            editing.value = false;
            emits("lockEdits",false);
        }
    })
    
</script>



<template>
    <div class="card" @mouseenter="hoveredOn = true" @mouseleave="hoveredOn = false">
        <div class="staticBox"v-if="editing == false">
            <div class="text">
                {{ text }}
            </div>
            <div class="hoverButton" v-if="canEdit && editing == false" @click="edit">
                <img class="editButton" 
                :src="EditIcon" 
                :style="{opacity : hoveredOn ? 1 : 0}" 
                >
            </div>  
        </div>
        <Transition name="edit">
            <div class="editBox" v-if="editing == true">
                <input class="textBox" :maxlength="maxLength" ref="textBox" v-model="editableText"> 
                <ButtonBase :disable-shadow="true" :icon="OkIcon" @click="submit" height="32px"></ButtonBase>
                <ButtonBase :disable-shadow="true" :icon="CloseIcon" @click="cancel" height="32px"></ButtonBase>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
    .card{
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 64px;
        padding-inline: 16px;
    }

    .text{
        color: #d9d9d9;
        font-size: 24px;
        font-weight: bold;
        text-align: center;  
    }

    .editButton{
        background-color: #494949;
        border-radius: 8px;
        padding: 2px;
    }

    .editBox{
        gap: 4px;
        display: flex;
        height: 32px;
        padding-block: auto;
    }

    .staticBox{
        display: flex;
    }

    .hoverButton{
        opacity: 1;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        position: absolute;
        right:64px;
        display: flex;
        justify-content: center;
    }

    .hoverButton:hover{
        opacity: 0.75;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        position: absolute;
        right:64px;
        display: flex;
        justify-content: center;
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
        padding-left: 4px;
        padding-bottom: 4px;
        width: 192px;
    }

    .edit-enter-active,
    .edit-leave-active {
        transition: opacity 0.3s ease;
        position: fixed;
    }

    .edit-enter-from,
    .edit-leave-to {
        opacity: 0;
    }

    
</style>