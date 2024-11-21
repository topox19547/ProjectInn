import type { Message } from "./message/Message.js"

export interface ServerHandler{
    receive(message : MessageEvent) : void
    close() : void
    send(message : Message) : void
}