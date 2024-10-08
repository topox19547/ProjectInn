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
            if (id == this.maxConcurrentGames){
                throw new Error("all the game slots are full")
            }
        }
        this.games.set(id, game);
        return id;
    }

    public removeGame(game : Game) : void{
        for(let [id, g] of this.games){
            if(g == game){
                this.games.delete(id);
            }
        }
    }

    public getGameById(id : number) : Game | undefined{
        return this.games.get(id);
    }
}