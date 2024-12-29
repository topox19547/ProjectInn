<script setup lang="ts">
    import type { Player } from '../../../../../model/Player.js';
    import type { Token } from '../../../../../model/Token.js';
    import AddIcon from '../../../../../assets/icons/add-alt.svg';
    import RemoveIcon from '../../../../../assets/icons/close.svg';
    import DeleteIcon from '../../../../../assets/icons/delete.svg';
    import CopyIcon from '../../../../../assets/icons/copy.svg';
    import { computed, inject, nextTick, ref, useTemplateRef, watch } from 'vue';
    import EditableText from './EditableText.vue';
    import { Permission } from '../../../../../model/Permission.js';
    import type { ServerPublisher } from '../../../../../network/ServerHandler.js';
    import { Status } from '../../../../../network/message/Status.js';
    import { Command } from '../../../../../network/message/Command.js';
    import StatView from './Stat.vue';
    import Note from './Note.vue';
    import ButtonBase from '../../../../shared/ButtonBase.vue';
    import type { Stat } from '../../../../../model/Stat.js';

    const props = defineProps<{
        selectedToken : Token | undefined
        players : Array<Player>
        localPlayer : Player
    }>();

    const editLock = ref(false);
    const addingPlayer = ref("");
    const showNewNoteCard = ref(false);
    const showNewStatCard = ref(false);
    const newNoteScroll = useTemplateRef("newNoteScroll");
    const newStatScroll = useTemplateRef("newStatScroll");
    const serverPublisher : ServerPublisher = inject("serverPublisher") as ServerPublisher;

    const canEdit = computed(() => {
        return (props.selectedToken?.owners.find(o => o == props.localPlayer.name) !== undefined ||
            props.localPlayer.permissions[Permission.MANAGE_TOKENS] == true) && !editLock.value
    });

    const canEditStrict = computed(() => {
        return props.localPlayer.permissions[Permission.MANAGE_TOKENS] == true;
    });

    const ownerCandidatePlayers = computed(() => {
        return props.players.filter(p =>{
            return p.permissions[Permission.MANAGE_TOKENS] == false &&
                props.selectedToken?.owners.find(o => o == p.name) == undefined;
        });
    });

    function changeNewNoteStatus(status : boolean){
        showNewNoteCard.value = status;
        editLock.value = status;
        if(status == true){
            nextTick(() => {
                setTimeout(() => {
                    newNoteScroll.value?.scrollIntoView({ behavior:'smooth', block: 'nearest', inline: 'end' })
                },300)
            })
        }
    }

    function changeNewStatStatus(status : boolean){
        showNewStatCard.value = status;
        editLock.value = status;
        if(status == true){
            nextTick(() => {
                setTimeout(() => {
                    newStatScroll.value?.scrollIntoView({ behavior:'smooth', block: 'nearest', inline: 'end' })
                },300)
            })
        }
    }


    function sendNewTokenName(name : string) : void{
        serverPublisher.send({
            status : Status.TOKEN_NAME,
            command : Command.MODIFY,
            content : {
                id : props.selectedToken?.id,
                name : name
            }
        });
    }

    function updateOwnerStatus(remove : boolean, name : string){
        serverPublisher.send({
            status : Status.TOKEN_OWNERSHIP,
            command : remove == true ? Command.DELETE : Command.CREATE,
            content : {
                name : name,
                id : props.selectedToken?.id
            }
        });
        addingPlayer.value = "";
    }

    function sendEditedNote(title : string, text : string){
        showNewNoteCard.value = false
        serverPublisher.send({
            status : Status.TOKEN_NOTE,
            command : Command.MODIFY,
            content : {
                id : props.selectedToken?.id,
                title : title,
                note : text
            }
        });
    }

    function sendDeletedNote(title : string){
        serverPublisher.send({
            status : Status.TOKEN_NOTE,
            command : Command.DELETE,
            content : {
                id : props.selectedToken?.id,
                title : title
            }
        });
    }

    function sendEditedStat(name : string, stat : Stat){
        showNewStatCard.value = false
        serverPublisher.send({
            status : Status.TOKEN_STAT,
            command : Command.MODIFY,
            content : {
                id : props.selectedToken?.id,
                name : name,
                stat : stat
            }
        })
    }

    function sendDeletedStat(name : string){
        serverPublisher.send({
            status : Status.TOKEN_STAT,
            command : Command.DELETE,
            content : {
                id : props.selectedToken?.id,
                name : name
            }
        });
    }

    function deleteToken(){
        serverPublisher.send({
            status : Status.TOKEN,
            command : Command.DELETE,
            content : {
                id : props.selectedToken?.id
            }
        });
    }

    function copyToken(){
        serverPublisher.send({
            status : Status.TOKEN_COPY,
            command : Command.CREATE,
            content : {
                id : props.selectedToken?.id
            }
        });
    }

    watch(() => props.selectedToken?.id, () => {
        addingPlayer.value = "";
    });
</script>

<template>
    <div class="margin">
        <div class="container">
            <div class="noSelection" v-if="selectedToken == undefined">
                Select a token to view its properties
            </div>
            <div v-if="selectedToken !== undefined" class="tokenInfo">
               <EditableText :max-length=24 :text="selectedToken.name" :current-token-id="selectedToken.id"
               :canEdit="canEdit" @lock-edits="(v) => editLock = v" 
               @text-edited="(name) => sendNewTokenName(name)"></EditableText>
                <div class="section">
                    <div class="title"> Stats </div>
                    <div class="hoverButton" v-if="canEdit" @click="() => changeNewStatStatus(true)">
                        <img class="miniButton" 
                        :src="AddIcon">
                    </div>
                    <TransitionGroup name="subElement">
                        <StatView v-for="stat in Object.entries(selectedToken.stats)" 
                        :name="stat[0]" 
                        :stat="stat[1]" 
                        :create="false"
                        :can-edit="canEdit"
                        :key="stat[0]"
                        @set-edit-lock="(v : boolean) => editLock = v"
                        @cancel="editLock = false"
                        @edited-stat="sendEditedStat"
                        @deleted-stat="() => sendDeletedStat(stat[0])"
                        :current-token-id="selectedToken.id"></StatView>
                        <StatView
                        name="" 
                        :stat="{value : 0, max : undefined, min : 0}" 
                        :create="true"
                        :can-edit="canEdit"
                        key=""
                        :taken-names="Object.keys(selectedToken.stats)"
                        @set-edit-lock="(v : boolean) => editLock = v"
                        @cancel="() => changeNewStatStatus(false)"
                        @edited-stat="sendEditedStat"
                        :current-token-id="selectedToken.id"
                        v-if="showNewStatCard"></StatView>
                        <div class="spacer" ref="newStatScroll"
                        key="" v-if="Object.entries(selectedToken.stats).length > 0 || showNewStatCard"></div>
                    </TransitionGroup>
                </div>
                <div class="section">
                    <div class="title"> Notes </div>
                    <div class="hoverButton" v-if="canEdit" @click="() => changeNewNoteStatus(true)">
                        <img class="miniButton" 
                        :src="AddIcon">
                    </div>
                    <TransitionGroup name="subElement">
                        <Note v-for="note in Object.entries(selectedToken.notes)" 
                        :create="false"
                        :title="note[0]"
                        :text="note[1]"
                        :can-edit="canEdit"
                        :current-token-id="selectedToken.id"
                        @cancel="editLock = false"
                        @edited-note="sendEditedNote"
                        @deleted-note="() => sendDeletedNote(note[0])"
                        @set-edit-lock="(v : boolean) => editLock = v"
                        :key="note[0]"></Note>
                        <Note
                        v-if="showNewNoteCard"
                        :create="true"
                        title=""
                        text=""
                        :current-token-id="selectedToken.id"
                        :taken-titles="Object.keys(selectedToken.notes)"
                        :can-edit="canEdit"
                        @cancel="() => changeNewNoteStatus(false)"
                        @edited-note="sendEditedNote"
                        @set-edit-lock="(v : boolean) => editLock = v"
                        key=""></Note>
                        <div class="spacer" ref="newNoteScroll"
                        key="" v-if="Object.entries(selectedToken.notes).length > 0 || showNewNoteCard"></div>
                    </TransitionGroup>  
                </div>
                <div class="section">
                    <div class="title"> Assigned to </div>
                    <TransitionGroup name="subElement">
                        <div class="player" :key="owner" v-for="owner in selectedToken.owners">
                            <div class="playerText">
                                {{ owner }}
                            </div>
                            <div class="fixedButton" v-if="canEditStrict" 
                            @click="() => updateOwnerStatus(true, owner)">
                                <img class="miniButton" :src="RemoveIcon" width="20px" height="100%">
                            </div>
                        </div>
                    </TransitionGroup>
                    <div class="selectUser" v-if="canEditStrict">
                            <select class="dropDown" v-model="addingPlayer">
                                <option :value="player.name" v-for="player in ownerCandidatePlayers">
                                    {{ player.name }}
                                </option>
                            </select>
                            <ButtonBase text="Add" 
                            :disable-shadow="true" 
                            height="30px" width="128px"
                            :disabled="addingPlayer.length == 0"
                            @click="() => updateOwnerStatus(false, addingPlayer)"></ButtonBase>
                        </div>
                    <div class="spacer" v-if="canEditStrict || selectedToken.owners.length > 0"></div>
                </div>
            </div>
            <div class="buttons" v-if="selectedToken !== undefined">
                <Transition name="fade">
                    <ButtonBase
                    @click="copyToken"
                    text="Copy Token" 
                    :icon="CopyIcon" 
                    :disable-shadow="true"
                    width="100%" 
                    height="42px"
                    v-if="canEditStrict"></ButtonBase>
                </Transition>
                <Transition name="fade">
                    <ButtonBase
                    @click="deleteToken"
                    text="Delete token" 
                    :icon="DeleteIcon" 
                    :disable-shadow="true"
                    width="100%" 
                    height="42px"
                    :color="{ active : '#9D2C2C', hover : '#CD3A3A'}"
                    v-if="canEditStrict"></ButtonBase>
                </Transition>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .margin{
        padding-bottom: 16px;
        padding-inline: 16px;
        overflow: hidden;
        height: 100%;
    }

    .container{
        display: flex;
        flex-direction: column;
        background-color: #353535;
        border-radius: 16px;
        height: 100%;
        justify-content: space-between;
    }

    .noSelection{
        color: #d9d9d9;
        text-align: center;
        margin: auto;
    }
    
    .title{
        color: #d9d9d9;
        font-size: 20px;
        font-weight: bold;
        padding-bottom: 16px;
        text-align: center;
    }

    .player{
        display: flex;
        justify-content: space-between;
        color: #ffffff;
        padding-inline: 16px;
        padding-block: 8px;
        background-color: #555555;
        border-width: 2px;
        border-style: none;
        border-radius: 16px;
        margin-block: 2px;
    }

    .playerText{
        margin-block: auto;
    }

    .spacer{
        height: 16px;
    }

    .buttons{
        display: flex;
        flex-direction: column;
        padding-inline: 16px;
        padding-bottom: 16px;
        gap : 8px
    }

    .section{
        position: relative;
        display: flex;
        flex-direction: column;
        border-color: #636363;
        border-width: 2px;
        border-style: solid;
        padding-top: 16px;
        padding-inline: 16px;
        border-radius: 16px;
        margin-inline: 16px;
    }

    .tokenInfo{
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: auto;
        padding-top: 8px;
        padding-bottom: 16px;
    }

    .miniButton{
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
    }

    .hoverButton{
        opacity: 1;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        position: absolute;
        right:32px;
        display: flex;
        justify-content: center;
    }

    .hoverButton:hover{
        opacity: 0.75;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
        position: absolute;
        right:32px;
        display: flex;
        justify-content: center;
    }

    .fixedButton{
        opacity: 1;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
    }

    .fixedButton:hover{
        opacity: 0.75;
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration: 0.3s;
    }

    .selectUser{
        display: flex;
        padding-block: 8px;
        gap: 4px;
    }

    .dropDown{
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
        padding-left: 16px;
        padding-bottom: 4px;
        max-width: 200px;
        width: 100%;
    }

    .subElement-move,
    .subElement-enter-active,
    .subElement-leave-active {
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration:0.3s;
        max-height: 1000px;
        overflow: hidden;
        transform-box: fill-box;
        transform-origin: 50% 0%;
    }

    .subElement-enter-from,
    .subElement-leave-to {
        opacity: 0;
        max-height: 0px;
        padding-block: 0px;
        margin-block: 0px;
        overflow: hidden;
        transform: scale(1,0);
    }

    .fade-enter-active,
    .fade-leave-active{
        transition: all cubic-bezier(0.075, 0.82, 0.165, 1) ease-in-out;
        transition-duration:0.3s;
        opacity: 1;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>