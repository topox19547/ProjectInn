import type { Message } from "./message/Message.js";
import { MessageHandler } from "./MessageHandler.js";
import type { ServerPublisher } from "./ServerHandler.js";

export class WebSocketHandler implements ServerPublisher{
    private readonly messageHandler : MessageHandler;
    private readonly socket : WebSocket;

    constructor(messageHandler : MessageHandler, onConnect : () => void, url? : string){
        this.messageHandler = messageHandler;
        //The default behavior is that the server has the same hostname as the website the client is using
        this.socket = new WebSocket(url !== undefined ? url : `ws://${window.location.hostname}:23435`);
        this.socket.addEventListener("close",() => this.close());
        this.socket.addEventListener("error",() => this.error());
        this.socket.addEventListener("message",(m) => this.receive(m));
        this.socket.addEventListener("open", onConnect)
    }

    private close(): void {
        throw new Error("Method not implemented.");
    }

    private error(): void{
        throw new Error("Method not implemented.");
    }

    private receive(event : MessageEvent): void {
        try{
            const parsedMessage = JSON.parse(event.data) as Message
            this.messageHandler.handleMessage(parsedMessage);
        } catch (e){
            if(e instanceof SyntaxError){
                console.log("invalid JSON syntax on inbound message");
            }
        }  
    }

    public send(message: Message): void {
        this.socket.send(JSON.stringify(message));
    }
    
}