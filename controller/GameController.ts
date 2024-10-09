class GameController implements ClientState{
    private readonly endProcedure : (game : Game) => void;
    private readonly currentGame : Game;
    private readonly clientPlayer : Player;
    private readonly clientHandler : ClientHandler;

    constructor(currentGame : Game, clientPlayer : Player, clientHandler : ClientHandler,
        endProcedure : (game : Game) => void){
        this.currentGame = currentGame;
        this.clientPlayer = clientPlayer;
        this.clientHandler = clientHandler;
        this.endProcedure = endProcedure;
    }

    handleMessage(message : string): void {
        throw new Error("Method not implemented.");
    }

    


}