interface ClientHandler{
    open():void
    close():void
    receive():void
    send(message : Message):void
    changeState(state : ClientState):void
}