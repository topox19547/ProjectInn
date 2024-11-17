import { Message } from "../model/messages/Message"

export interface ClientState{
    handleMessage(message : Message) : void
    getNextDefaultState() : ClientState
}