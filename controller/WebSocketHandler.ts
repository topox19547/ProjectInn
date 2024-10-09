class WebSocketHandler implements ClientHandler{
    private readonly webSocket : WebSocket;
    
    constructor(webSocket : WebSocket){
        this.webSocket = webSocket;
    }
    
    changeState(state: ClientState): void {
        throw new Error("Method not implemented.");
    }

    open(): void {
        throw new Error("Method not implemented.");
    }

    close(): void {
        throw new Error("Method not implemented.");
    }

    receive(): void {
        throw new Error("Method not implemented.");
    }
    
    send(): void {
        throw new Error("Method not implemented.");
    }
}