import { ChatMessage } from "../ChatMessage.js";

export interface CommandResponse{
    response : ChatMessage
    sendTo? : Array<string> //if not present, send the message to everyone in the room
}