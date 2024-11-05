class Lobby implements NotificationSource{
    private readonly games : Map<number, Game>;
    private readonly maxConcurrentGames : number;
    private notifier : ClientNotifier | undefined;

    constructor(notifier : ClientNotifier){
        this.games = new Map();
        this.maxConcurrentGames = Number.MAX_SAFE_INTEGER;
        this.notifier = undefined;
    }

    public setNotifier(notifier : ClientNotifier) : void{
        this.notifier = notifier;
    }

    public addToLobby(handler : ClientHandler){
        this.notifier?.subscribe(handler);
    }

    public leaveLobby(handler : ClientHandler){
        this.notifier?.unsubscribe(handler)
    }

    public publishGame(game : Game) : void{
        let id = 1;
        while(this.games.has(id)){
            id++;
            if (id == this.maxConcurrentGames){
                throw new Error("all the game slots are full")
            }
        }
        this.games.set(id, game);
        this.notifier?.notify(this.buildMatchListMessage());
    }

    public removeGame(game : Game) : void{
        for(let [id, g] of this.games){
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
        const gameList = new Array<{id : number, name : string}>;
        this.getRunningGames().forEach((v,k) => gameList.concat({id : k, name : v.getName()}))
        return {
            status : MessageType.LOBBY_UPDATE,
            command : Command.SAFE_MODIFY,
            content : gameList
        }
    }
}