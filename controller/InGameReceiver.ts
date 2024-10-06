class GameController implements ClientState{
    private readonly currentGame : Game;
    private readonly clientPlayer : Player;
    private readonly clientHandler : ClientHandler;

    constructor(currentGame : Game, clientPlayer : Player, clientHandler : ClientHandler){
        this.currentGame = currentGame;
        this.clientPlayer = clientPlayer;
        this.clientHandler = clientHandler;
    }

    handleMessage(): void {
        throw new Error("Method not implemented.");
    }


}