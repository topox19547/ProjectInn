import { Message } from "../model/messages/Message.js"

/**
 * basic interface for all the client states. Needs to define a way to handle the messages received while the
 * state is active and a default state to advance to.
 */
export interface ClientState{
    handleMessage(message : Message) : void
    getNextDefaultState() : ClientState
}