interface ClientState{
    handleMessage(message : Message) : void
    getNextDefaultState() : ClientState
}