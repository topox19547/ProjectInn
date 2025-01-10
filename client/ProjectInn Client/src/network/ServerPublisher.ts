import type { Message } from "./message/Message.js"

/**
 * interface used by the view components to send messages to the server
 */
export interface ServerPublisher{
    send(message : Message) : void
}