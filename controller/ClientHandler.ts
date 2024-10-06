interface ClientHandler{
    open():void
    close():void
    receive():void
    send():void
    changeState(state : ClientState):void
}