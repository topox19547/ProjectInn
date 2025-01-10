import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { readFileSync } from "fs";
import { createServer } from "node:https"
import { ClientHandler } from "./controller/ClientHandler.js";
import { LobbyController } from "./controller/LobbyController.js";
import { WebSocketHandler } from "./controller/WebSocketHandler.js";
import { ClientNotifier } from "./model/ClientNotifier.js";
import { Lobby } from "./model/Lobby.js";
import { setDefaultResultOrder } from "dns";
import { Http2SecureServer } from "node:http2";

/**
 * Main class used to create and start the server
 */
export class Server{
    public start(){
        console.log("Starting ProjectInn server");
        const port : number = 23435;
        const lobbyNotifier : ClientNotifier = new ClientNotifier();
        const lobby : Lobby = new Lobby();
        lobby.setNotifier(lobbyNotifier);
        let server : WebSocketServer;
        try{
            const keyLocations = readFileSync('KEYPATHS').toString().split(/\r?\n/);
            //put the paths for ssl private key and certificate in the KEYPATHS FILE
            const httpsServer = createServer({
                key: readFileSync(keyLocations[0]),
                cert: readFileSync(keyLocations[1])
            });
            httpsServer.listen(port);
            server = new WebSocketServer({server : httpsServer});
        }catch(e){
            console.log("An error occurred while trying to create a secure websocket server");
            console.log("Check if the KEYPATHS file is present and if the key-certificate pair is valid");
            console.log("Starting a regular websocket server.");
            server = new WebSocketServer({port : port});
        }
        server.addListener("connection",(w : WebSocket) =>{
            const handler : ClientHandler = new WebSocketHandler(w);
            handler.changeState(new LobbyController(lobby, handler));
        })
    }
}

const server : Server = new Server();
server.start();