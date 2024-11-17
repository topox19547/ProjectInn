import { WebSocketServer } from "ws";
import { WebSocketHandler } from "./WebSocketHandler";

export class Server{
    public start(){
        const server : WebSocketServer = new WebSocketServer()
        server.addListener("connection",(w : WebSocket) =>{
            new WebSocketHandler()
        })
        
    }
}