import { FormatError } from "../errors/FormatError.js";
import { Command } from "../model/messages/Command.js";
import { validateMessage, Message } from "../model/messages/Message.js";
import { Status } from "../model/messages/Status.js";
import { ClientHandler } from "./ClientHandler.js";


export class WebSocketHandler extends ClientHandler{
    private readonly webSocket : WebSocket;
    
    constructor(webSocket : WebSocket){
        super()
        this.webSocket = webSocket;
        webSocket.addEventListener("message", this.receive);
        webSocket.addEventListener("close", this.close);
    }

    open(): void {
        throw new Error("Method not implemented.");
    }

    close(): void {
        this.currentState?.handleMessage({
            status : Status.CLIENT_STATUS,
            command : Command.DELETE,
            content : {}
        });
        console.log("A player has left");
    }

    receive(event : MessageEvent): void {
        try{
            const parsedMessage = validateMessage(JSON.parse(event.data))
            this.currentState?.handleMessage(parsedMessage);
            console.log(this.currentState);
        } catch (e){
            if(e instanceof SyntaxError){
                console.log("invalid JSON syntax on inbound message");
            } else if (e instanceof FormatError){
                console.log(e);
                console.log("invalid message format on inbound message");
            }
        }  
    }
    
    send(message : Message): void {
        this.webSocket.send(JSON.stringify(message));
    }
}