import type { Message } from "./message/Message.js"

export interface ServerPublisher{
    send(message : Message) : void
}