import { ChatMessage } from "../ChatMessage.js";

/**
 * Defines an interface for command responses, which includes the actual response and the players to send it to.
 */
export interface CommandResponse{
    response : ChatMessage
    sendTo? : Array<string> //if not present, send the message to everyone in the room
}