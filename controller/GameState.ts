class GameState implements ClientState{
    private readonly currentGame : GameController;
    private readonly currentPlayer : Player;

    constructor(currentGame : GameController, currentPlayer : Player){
        this.currentGame = currentGame;
        this.currentPlayer = currentPlayer;
    }

    handleMessage(): void {
        throw new Error("Method not implemented.");
    }
}