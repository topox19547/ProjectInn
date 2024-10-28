class Lobby{
    private readonly games : Map<number, Game>;
    private readonly maxConcurrentGames : number;
    private readonly notifier : ClientNotifier;

    constructor(notifier : ClientNotifier){
        this.games = new Map();
        this.maxConcurrentGames = Number.MAX_SAFE_INTEGER;
        this.notifier = notifier;
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
        this.notifier.notify({
            status : MessageType.LOBBY_UPDATE,
            command : Command.SAFE_MODIFY,
            content : this.getRunningGames()
        });
    }

    public removeGame(game : Game) : void{
        for(let [id, g] of this.games){
            if(g == game){
                this.games.delete(id);
            }
        }
        this.notifier.notify({
            status : MessageType.LOBBY_UPDATE,
            command : Command.SAFE_MODIFY,
            content : this.getRunningGames()
        });
    }

    public getRunningGames() : Map<number,Game>{
        return new Map(this.games);
    }
}