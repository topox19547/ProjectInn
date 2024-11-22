import type { Message } from "./message/Message.js";
import { MessageHandler } from "./MessageHandler.js";
import type { ServerHandler } from "./ServerHandler.js";

export class WebSocketHandler implements ServerHandler{
    private readonly messageHandler : MessageHandler;
    private readonly socket : WebSocket;

    constructor(socket : WebSocket, messageHandler : MessageHandler){
        this.messageHandler = messageHandler;
        this.socket = socket;
    }

    close(): void {
        throw new Error("Method not implemented.");
    }

    receive(event : MessageEvent): void {
        try{
            const parsedMessage = JSON.parse(event.data) as Message
            this.messageHandler.handleMessage(parsedMessage);
        } catch (e){
            if(e instanceof SyntaxError){
                console.log("invalid JSON syntax on inbound message");
            }
        }  
    }

    send(message: Message): void {
        this.socket.send(JSON.stringify(message));
    }
    
}