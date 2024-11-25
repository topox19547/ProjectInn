import { WebSocketServer } from "ws";
import { ClientHandler } from "./controller/ClientHandler.js";
import { LobbyController } from "./controller/LobbyController.js";
import { WebSocketHandler } from "./controller/WebSocketHandler.js";
import { ClientNotifier } from "./model/ClientNotifier.js";
import { Lobby } from "./model/Lobby.js";

export class Server{
    public start(){
        console.log("Starting ProjectInn server");
        const lobbyNotifier : ClientNotifier = new ClientNotifier();
        const lobby : Lobby = new Lobby(lobbyNotifier);
        const server : WebSocketServer = new WebSocketServer({port : 23435});
        server.addListener("connection",(w : WebSocket) =>{
            const handler : ClientHandler = new WebSocketHandler(w);
            handler.changeState(new LobbyController(lobby, handler));
            console.log("New user connected");
        })
    }
}

const server : Server = new Server();
server.start();