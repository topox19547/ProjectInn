import { WebSocketServer } from "ws";
import { ClientHandler } from "./controller/ClientHandler.js";
import { LobbyController } from "./controller/LobbyController.js";
import { WebSocketHandler } from "./controller/WebSocketHandler.js";
import { ClientNotifier } from "./model/ClientNotifier.js";
import { Lobby } from "./model/Lobby.js";
import { setDefaultResultOrder } from "dns";

export class Server{
    public start(){
        console.log("Starting ProjectInn server");
        const lobbyNotifier : ClientNotifier = new ClientNotifier();
        const lobby : Lobby = new Lobby();
        lobby.setNotifier(lobbyNotifier);
        const server : WebSocketServer = new WebSocketServer({port : 23435});
        server.addListener("connection",(w : WebSocket) =>{
            const handler : ClientHandler = new WebSocketHandler(w);
            handler.changeState(new LobbyController(lobby, handler));
        })
    }
}

const server : Server = new Server();
server.start();