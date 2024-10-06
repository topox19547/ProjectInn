class LobbyController implements ClientState{
    private readonly server : Server;

    constructor(server : Server){
        this.server = server;
    }

    handleMessage(): void {
        throw new Error("Method not implemented.");
    }
}