import { ClientHandler } from "../controller/ClientHandler.js";
import { ClientNotifier } from "./ClientNotifier.js";
import { Game } from "./Game.js";
import { Command } from "./messages/Command.js";
import { Message } from "./messages/Message.js";
import { Status } from "./messages/Status.js";


/**
 * defines a lobby, which is a collection of all the running games that a client can browse.
 */
export class Lobby{
    private readonly games : Map<number, Game>;
    private readonly maxConcurrentGames : number;
    private notifier : ClientNotifier | undefined;

    constructor(){
        this.games = new Map();
        this.maxConcurrentGames = Number.MAX_SAFE_INTEGER;
        this.notifier = undefined;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
    }

    public addToLobby(handler : ClientHandler){
        this.notifier?.subscribe(handler);
        console.log("a player has joined the lobby")
    }

    public leaveLobby(handler : ClientHandler){
        this.notifier?.unsubscribe(handler)
    }

    public publishGame(game : Game) : number{
        let id = 1;
        while(this.games.has(id)){
            id++;
            if (id == this.maxConcurrentGames){
                throw new Error("all the game slots are full")
            }
        }
        this.games.set(id, game);
        this.notifier?.notify(this.buildMatchListMessage());
        return id;
    }

    public removeGame(game : Game) : void{
        for(const [id, g] of this.games){
            if(g == game){
                this.games.delete(id);
            }
        }
        this.notifier?.notify(this.buildMatchListMessage());
    }

    public getRunningGames() : Map<number,Game>{
        return new Map(this.games);
    }

    public buildMatchListMessage() : Message{
        const gameList = new Array<{id : number, name : string, private : boolean, info : string}>;
        this.getRunningGames().forEach((v,k) => gameList.push({
            id : k,
            name : v.getName(),
            private : !v.checkPassword(undefined),
            info : `${v.checkPassword(undefined) ? "Public 🔓" : "Private 🔒"}, created by ${v.getOwnerName()}`
        }));
        return {
            status : Status.LOBBY_UPDATE,
            command : Command.MODIFY,
            content : {
                activeGames : gameList
            }
        }
    }
}