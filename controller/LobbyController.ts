class LobbyController implements ClientState{
    private readonly lobby : Lobby;

    constructor(lobby : Lobby){
        this.lobby = lobby;
    }

    handleMessage(message : string): void {
        throw new Error("Method not implemented.");
    }
}