<script setup lang="ts">
    import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
    import { statToString, type Stat } from '../../../../../model/Stat.js';
    import EditIcon from '../../../../../assets/icons/edit.svg';
    import DeleteIcon from '../../../../../assets/icons/delete.svg';
    import OkIcon from '../../../../../assets/icons/ok.svg';
    import CloseIcon from '../../../../../assets/icons/close.svg';
    import ButtonBase from '../../../../shared/ButtonBase.vue';

    const isEditing = ref(false);
    const hoveredOn = ref(false);

    const emits = defineEmits<{
        (e : "editedStat", title : string, stat : Stat ) : void
        (e : "deletedStat") : void
        (e : "cancel") : void
        (e : "setEditLock", status : boolean) : void
    }>();

    const props = defineProps<{
        stat : Stat
        name : string
        create : boolean
        canEdit : boolean
        takenNames? : Array<string>
        currentTokenId : number
    }>();

    const editableStat = ref({
        value : props.stat.value,
        max : props.stat.max,
        min : props.stat.min
    });

    const valueInput = useTemplateRef("valueInput");
    
    const editableName = ref(props.name);

    const isStatOk = computed(() => {
        if(typeof editableStat.value.value !== 'number'){
            return false;
        }
        if(editableName.value.length == 0 || props.takenNames?.includes(editableName.value)){
            return false;
        }
        if(editableStat.value.max !== undefined && editableStat.value.max < editableStat.value.value){
            return false;
        }
        if(editableStat.value.min !== undefined && editableStat.value.min > editableStat.value.value){
            return false;
        }
        if(editableStat.value.max !== undefined && editableStat.value.min !== undefined){
            if(editableStat.value.min > editableStat.value.max){
                return false;
            }
        }
        return true;
    })

    const statString = computed(() => statToString(props.name, props.stat))

    function resetContent(){
        editableStat.value = {
            value : props.stat.value,
            max : props.stat.max,
            min : props.stat.min
        };
    }

    function reset(){
        emits("cancel");
        isEditing.value = false;
        resetContent();
    }

    function setEditStatus(status : boolean){
        resetContent();
        hoveredOn.value = false;
        emits("setEditLock", status);
        isEditing.value = status;
        if(status == true){
            nextTick(() => {
                valueInput.value?.focus();
            })
        }
    }

    function confirm(){
        if(!isStatOk.value){
            return;
        }
        emits('editedStat', editableName.value , editableStat.value);
        setEditStatus(false);
    }

    onMounted(() => {
        resetContent();
    })

    onUnmounted(() => {
        reset();
    })

    watch(() => props.currentTokenId, () => {
        reset();
    })

    watch(editableStat, (newStat) => {
        if (typeof newStat.min !== "number" && typeof newStat.min !== "undefined"){
            editableStat.value.min = undefined;
        }
        if (typeof newStat.max !== "number" && typeof newStat.max !== "undefined") {
            editableStat.value.max = undefined;
        }
    }, {deep : true})

</script>

<template>
    <div>
        <TransitionGroup name="edit">
            <div class="static" v-if="!(isEditing) && create == false" 
            @mouseenter="hoveredOn = true" @mouseleave="hoveredOn = false">
                <div class=" anchor progressBar" v-if="props.stat.max !== undefined && props.stat.min !== undefined">
                    <div class="progressFill" 
                    :style="
                    {width: (props.stat.value - props.stat.min) / (props.stat.max - props.stat.min) * 100 + '%' }"
                    ></div>
                    <div class="progressText" @dblclick="() => {if(canEdit) setEditStatus(true)}">
                        {{ statString }}
                    </div>
                </div>
                <div class="anchor noProgress"  v-else>
                    <div class="progressText" @dblclick="() => {if(canEdit) setEditStatus(true)}">
                        {{ statString }}
                    </div>
                </div>
                <div @dragstart="(e) => e.preventDefault()" 
                    class="hoverButton editButton" @click="setEditStatus(true)" v-if="canEdit">
                    <img class="miniButton" 
                        :src="EditIcon" 
                        :style="{opacity : hoveredOn ? 1 : 0}" >
                </div>
                <div @dragstart="(e) => e.preventDefault()" 
                    class="hoverButton deleteButton" @click="$emit('deletedStat')" v-if="canEdit">
                    <img class="miniButton" 
                    :src="DeleteIcon" 
                    :style="{opacity : hoveredOn ? 1 : 0}">
                </div>
            </div>
            <div class="editable" v-if="isEditing || create == true">
                <div class="inputTitle" v-if="create == true">Name:</div>
                <input class="textBox" placeholder="name" maxlength="24" width="10px" v-model="editableName" 
                v-if="create == true"
                @keydown.enter="() => {if(isStatOk) confirm()}">
                <div class="inputTitle">Value:</div>
                <input class="textBox" type="number" placeholder="value" v-model="editableStat.value"
                @keydown.enter="() => {if(isStatOk) confirm()}" ref="valueInput">
                <div class="inputTitle">Minimum (optional):</div>
                <input class="textBox" type="number" placeholder="minimum" v-model="editableStat.min"
                @keydown.enter="() => {if(isStatOk) confirm()}">
                <div class="inputTitle">Maximum (optional):</div>
                <input class="textBox" type="number" placeholder="maximum" v-model="editableStat.max"
                @keydown.enter="() => {if(isStatOk) confirm()}">
                <div class="buttonBar">
                    <ButtonBase :disable-shadow="true" :icon="OkIcon" 
                    :disabled ="!isStatOk"
                    height="32px" @click="confirm"></ButtonBase>
                    <ButtonBase :disable-shadow="true" :icon="CloseIcon" height="32px" @click="reset"></ButtonBase>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
    .anchor{
        position: relative;
        height: 28px;
    }

    .progressBar{
        height: 32px;
        border-radius: 16px;
        appearance: none;
        background-color: #222222;
        overflow: hidden;
    }

    .progressFill{
        position: absolute;
        left: 0px;
        height: 100%;
        border-radius: 16px 4px 4px 16px;
        appearance: none;
        background-color: #303F9F;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.5s;
    }

    .inputTitle{
        width: fit-content;
        color: #D9D9D9;
        font-weight: bold;
        padding-inline: 8px;
        margin-block: auto;
        padding-top: 4px;
    }

    .progressText{
        position: absolute;
        left: 16px;
        line-height: 32px;
        height: 100%;
        color : #FFFFFF;
        font-weight: bold;
    }

    .noProgress{
        color : #d9d9d9;
        background-color: #555555;
        height: 32px;
        border-radius: 16px;
        width: 100%;
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

    .buttonBar{
        display: flex;
        gap: 4px;
        padding-top: 4px;
    }

    .static{
        position: relative;
        padding-inline: 0px;
        padding-block: 12px;
        transition: height 1s cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
    }

    .editable{
        background-color: #555555;
        border-radius: 16px;
        padding: 24px;
        margin-block: 4px;
        gap: 8px;
        display: flex;
        flex-direction: column;
        position: relative;
        transition: height 1s cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
    }

    .hoverButton{
        opacity: 1;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        position: absolute;
        display: flex;
        justify-content: center;
        top: 25%;
    }

    .hoverButton:hover{
        opacity: 0.75;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        position: absolute;
        display: flex;
        justify-content: center;
    }

    .miniButton{
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        padding: 2px;
    }

    .editButton{
        right:48px;
    }

    .deleteButton{
        right:16px;
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
        padding-block: 0px;
        margin-block: 0px;
        max-height: 0px;
        overflow: hidden;
    }
</style>