class Lobby{
    private readonly games : Map<number, Game>;
    private readonly maxConcurrentGames : number;

    constructor(){
        this.games = new Map();
        this.maxConcurrentGames = Number.MAX_SAFE_INTEGER;
    }

    public publishGame(game : Game) : number{
        let id = 1;
        while(this.games.has(id)){
            id++;
            if (i == this.maxConcurrentGames){
                throw new Error("all the game slots are full")
            }
        }
        this.games.set(id, game);
        return id;
    }

    public removeGame(game : Game) : boolean{
        
    }

}