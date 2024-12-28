<script setup lang="ts">
    import { inject, nextTick, onUpdated, ref, useTemplateRef, watch } from 'vue';
import type { ChatMessage } from '../../../../../model/ChatMessage.js';
    import type { Player } from '../../../../../model/Player.js';
    import MessageView from './ChatMessage.vue';
import ButtonBase from '../../../../shared/ButtonBase.vue';
import type { ServerPublisher } from '../../../../../network/ServerHandler.js';
import { Status } from '../../../../../network/message/Status.js';
import { Command } from '../../../../../network/message/Command.js';

    const scrolledToBottom = ref(true);
    const chatMessage = ref("");
    const chatBottom = useTemplateRef("bottom");
    const serverPublisher = inject("serverPublisher") as ServerPublisher;
    const props = defineProps<{
        chat : Array<ChatMessage>,
        players : Array<Player>,
        localPlayer : Player
    }>();

    function getPlayerColor(name : string) : string | undefined{
        const player : Player | undefined = props.players.find(p => p.name == name)
        if(player == undefined){
            return undefined
        }
        return player.color;
    }

    function sendMessage() : void{
        if(chatMessage.value.length == 0){
            return;
        }
        serverPublisher.send({
            status : Status.CHAT,
            command : Command.CREATE,
            content : {
                text : chatMessage.value
            }
        })
        chatMessage.value = "";
    }

    function updateScrollToBottom(target : any){
        scrolledToBottom.value = target.scrollTop + target.clientHeight >= target.scrollHeight;
    }

    function scrollToBottom(){
        nextTick(() => {
            chatBottom.value?.scrollIntoView({ block: 'nearest', inline: 'end' });
        })
    }

    watch(props.chat, (newChat) => {
        const lastMessage : ChatMessage = newChat[newChat.length - 1];
        const messageBeforeLast : ChatMessage = newChat[newChat.length - 2];
        if(scrolledToBottom.value){
            scrollToBottom();
        } else if(lastMessage.sender == props.localPlayer.name){
            scrollToBottom();
        } else if ((lastMessage.isSystem == true && messageBeforeLast.sender == props.localPlayer.name)){
            scrollToBottom();
        }
    });

</script>

<template>
    <div class="margin">
        <div class="container">
            <div class="messageViewer" @scrollend="e => updateScrollToBottom(e.target)">
                <MessageView v-for="message in chat"
                :message="message"
                :player-color="message.isSystem ? undefined : getPlayerColor(message.sender)" ></MessageView>
                <div ref="bottom" class="bottom"></div>
            </div>
            <div class="chatBar">
                <input type="text" v-model="chatMessage" maxlength="512" @keyup.enter="sendMessage()" class="textBox">
                <ButtonBase height="40px" 
                :disable-shadow="true" 
                :disabled="chatMessage.length == 0" 
                @click="sendMessage()"
                text="Send">
                </ButtonBase>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .container{
        display: flex;
        flex-direction: column;
        background-color: #353535;
        border-radius: 16px;
        margin-inline: 16px;
        height: 100%;
        justify-content: space-between;
    }

    .messageViewer{
        padding-top: 16px;
        padding-inline: 16px;
        display: block;
        overflow-y: auto;
        height: 100%;
    }

    .chatBar{
        display: flex;
        padding-inline: 16px;
        padding-bottom: 16px;
        gap: 4px;
        align-items: center;
        height: 64px;
        flex : 1;
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
        padding-left: 16px;
        padding-bottom: 4px;
        width: 75%;
        height: 32px;
    }

    .margin{
        padding-bottom: 16px;
        overflow: hidden;
        height: 100%;
    }
    
    .bottom{
        height: 24px;
        padding: 0px;
        margin: 0px;
    }
</style>