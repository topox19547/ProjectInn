class WebSocketHandler extends ClientHandler{
    private readonly webSocket : WebSocket;
    
    constructor(webSocket : WebSocket, initialState : ClientState){
        super(initialState);
        this.webSocket = webSocket;
        webSocket.addEventListener("message", this.receive);
        webSocket.addEventListener("close", this.close);
    }

    open(): void {
        throw new Error("Method not implemented.");
    }

    close(): void {
        this.currentState.handleMessage({
            status : Status.CLIENT_STATUS,
            command : Command.DELETE,
            content : {}
        })
    }

    receive(event : MessageEvent): void {
        try{
            const parsedMessage = validateMessage(JSON.parse(event.data))
            this.currentState.handleMessage(parsedMessage);
        } catch (e){
            if(e instanceof SyntaxError){
                console.log("invalid JSON syntax on inbound message");
            } else if (e instanceof FormatError){
                console.log("invalid message format on inbound message");
            }
        }
            
    }
    
    send(message : Message): void {
        this.webSocket.send(JSON.stringify(message));
    }
}