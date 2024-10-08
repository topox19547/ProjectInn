interface ClientHandler{
    open():void
    close():void
    receive():void
    send(message : Object):void
    changeState(state : ClientState):void
}