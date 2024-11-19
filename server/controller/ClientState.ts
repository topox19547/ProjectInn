import { Message } from "../model/messages/Message.js"

export interface ClientState{
    handleMessage(message : Message) : void
    getNextDefaultState() : ClientState
}