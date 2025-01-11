import { FormatError } from "../errors/FormatError.js";
import { Command } from "../model/messages/Command.js";
import { validateMessage, Message } from "../model/messages/Message.js";
import { Status } from "../model/messages/Status.js";
import { ClientHandler } from "./ClientHandler.js";
import { WebSocket } from "ws";

/**
 * ClientHandler implementation for the websocket protocol
 */
export class WebSocketHandler extends ClientHandler{
    private readonly webSocket : WebSocket;
    private isConnected : boolean;
    private closed : boolean;
    
    constructor(webSocket : WebSocket){
        super()
        this.closed = false;
        this.isConnected = true;
        this.webSocket = webSocket;
        this.webSocket.on("message", (m) => this.receive(m.toString()));
        this.webSocket.on("pong", () => this.markConnected())
        this.checkConnectionState();
    }

    private checkConnectionState() : void{
        const pingInterval = 10000;
        if(!this.isConnected){
            this.close()
            return;
        }
        this.isConnected = false;
        this.webSocket.ping();
        setTimeout(() => this.checkConnectionState(), pingInterval)
    }

    private markConnected() : void{
        this.isConnected = true;
    }
    
    public close() : void {
        this.closed = true;
        this.webSocket.close();
        this.currentState?.handleMessage({
            status : Status.CLIENT_STATUS,
            command : Command.DELETE,
            content : {}
        });
        console.log("A player has left");
    }

    public isClosed(): boolean {
        return this.closed;
    }

    private receive(message : string) : void {
        try{
            const parsedMessage = validateMessage(JSON.parse(message))
            if(this.currentState === undefined){
                console.log("handler currently isn't in any state")
                return;
            }
            this.currentState.handleMessage(parsedMessage);
        } catch (e){
            if(e instanceof SyntaxError){
                console.log("invalid JSON syntax on inbound message");
            } else if (e instanceof FormatError){
                console.log(e);
                console.log("invalid message format on inbound message");
            }
        }  
    }
    
    public send(message : Message): void {
        this.webSocket.send(JSON.stringify(message));
    }
}