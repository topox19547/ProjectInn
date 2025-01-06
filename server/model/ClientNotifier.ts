import { ClientHandler } from "../controller/ClientHandler.js";
import { WebSocketHandler } from "../controller/WebSocketHandler.js";
import { Player } from "./gameObjects/player/Player.js";
import { Message } from "./messages/Message.js";
import { Notifier } from "./Notifier.js";


export class ClientNotifier<T = void> implements Notifier<T>{
    private readonly subscribers : Map<ClientHandler, T>;

    constructor(){
        this.subscribers = new Map();
    }

    public subscribe(clientHandler : ClientHandler, identity: T) : void{
        this.subscribers.set(clientHandler, identity);
    }

    public unsubscribe(clientHandler : ClientHandler) : void{
        this.subscribers.delete(clientHandler);
    }

    public notify(message : Message) : void{
        this.subscribers.forEach((_, c) => {
            c.send(message);
        })
    }

    public notifyIf(message : Message, check : (identity : T) => boolean) : void{
        this.subscribers.forEach((i, c) => {
            if(check(i)){
                c.send(message);
            }
        });
    }

    public removeAllClients(){
        this.subscribers.forEach((_,c) => {
            c.leaveCurrentState();
        })
        this.subscribers.clear();
    }

    public removeClientsIf(check : (identity : T) => boolean){
        this.subscribers.forEach((i,c) => {
            if(check(i)){
                c.leaveCurrentState();
                this.subscribers.delete(c);
            }
        })
    }
}