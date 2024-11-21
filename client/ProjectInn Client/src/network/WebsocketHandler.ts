import type { Message } from "./message/Message.js";
import type { ServerHandler } from "./ServerHandler.js";

export class WebSocketHandler implements ServerHandler{
    constructor(socket : WebSocket){

    }

    receive(event : MessageEvent): void {
        try{
            const parsedMessage = JSON.parse(event.data) as Message
            
        } catch (e){
            if(e instanceof SyntaxError){
                console.log("invalid JSON syntax on inbound message");
            }
        }  
    }

    send(message: Message): void {
        throw new Error("Method not implemented.");
    }
    
}